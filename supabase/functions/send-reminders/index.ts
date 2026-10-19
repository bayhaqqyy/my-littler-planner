// Supabase Edge Function: send due task reminders as Web Push.
//
// POST {action:'send'}   — called every minute by pg_cron; requires
//                          `Authorization: Bearer <CRON_SECRET>`.
// POST {action:'snooze', endpoint, occurrenceKey, title}
//                        — called by the service worker's "Tunda 5 menit" action;
//                          authenticated by looking up the push endpoint.
//
// Reminder timing uses the same pure rules as the app (bundled from src/domain
// into ../_shared/domain.js by `npm run build:edge`).
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
// @deno-types="../_shared/domain.d.ts"
import {
  deadlineSnoozeAt, dueAtOf, isDeadline, migrateTask, notifyOn, pendingReminders, REMINDER_EVENT, reminderText, SNOOZE_MIN,
  splitOccKey, toMinutes, wallDate, wallTime, zonedToUtc,
} from '../_shared/domain.js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com';
// Shared secret between the pg_cron job (Vault `cron_secret`) and this function.
const CRON_SECRET = Deno.env.get('CRON_SECRET')!;
const DEFAULT_TZ = 'Asia/Jakarta';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

interface Row<T = Record<string, unknown>> { user_id: string; id: string; data: T; deleted: boolean }
interface PushSub { endpoint: string; p256dh: string; auth: string }
interface Payload { title: string; body: string; data: { id: string; occurrenceKey: string; kind: string; url: string } }

/** Wall-clock `YYYY-MM-DD` and `HH:mm` of an instant in a time zone. */
function wallClock(ms: number, timeZone: string): { date: string; time: string } {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(ms));
  } catch {
    return wallClock(ms, DEFAULT_TZ);
  }
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${g('year')}-${g('month')}-${g('day')}`, time: `${g('hour')}:${g('minute')}` };
}

const urlFor = (kind: string, key: string) =>
  kind === 'end' || kind === 'deadline-due' ? `/?complete=${encodeURIComponent(key)}` : `/timer?occ=${encodeURIComponent(key)}`;

async function rowsOf<T>(db: SupabaseClient, table: string, userId: string): Promise<Row<T>[]> {
  const out: Row<T>[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select('user_id,id,data,deleted').eq('user_id', userId).eq('deleted', false).range(from, from + 999);
    if (error) throw error;
    out.push(...(data as Row<T>[]));
    if (!data || data.length < 1000) return out;
  }
}

/** Send to all of a user's subscriptions; mark gone subscriptions deleted. */
async function sendToUser(db: SupabaseClient, userId: string, subs: Row<PushSub>[], payload: Payload) {
  const body = JSON.stringify(payload);
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.data.endpoint, keys: { p256dh: s.data.p256dh, auth: s.data.auth } }, body, { TTL: 600, urgency: 'high' });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await db.from('push_subscriptions').update({ deleted: true, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('id', s.id);
      } else {
        console.error('push failed', userId, code, (e as Error).message);
      }
    }
  }));
  return sent;
}

async function sendDue(db: SupabaseClient) {
  const nowMs = Date.now();
  const { data: subRows, error } = await db.from('push_subscriptions').select('user_id,id,data,deleted').eq('deleted', false);
  if (error) throw error;
  const byUser = new Map<string, Row<PushSub>[]>();
  for (const r of subRows as Row<PushSub>[]) {
    if (!r.data?.endpoint) continue;
    byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r]);
  }

  let total = 0;
  for (const [userId, subs] of byUser) {
    try {
      const [settings] = await rowsOf<{ timezone?: string; notify?: Record<string, boolean> }>(db, 'settings', userId);
      const tz = settings?.data?.timezone || DEFAULT_TZ;
      const now = wallClock(nowMs, tz);
      const from = wallClock(nowMs - 2 * 60_000, tz);
      const to = wallClock(nowMs + 60_000, tz); // exclusive upper bound → includes the current minute

      // migrateTask: rows written by older app versions get the deadline model.
      const tasks = (await rowsOf<Record<string, unknown>>(db, 'tasks', userId)).map((r) => migrateTask(r.data)).filter((t) => !t.deletedAt);
      const occRows = await rowsOf<Record<string, unknown>>(db, 'occurrences', userId);
      const occs = Object.fromEntries(occRows.map((r) => [r.id, r.data]));

      // deno-lint-ignore no-explicit-any
      const due = pendingReminders(tasks as any, occs as any, now.date, 1, `${from.date} ${from.time}`, `${to.date} ${to.time}`);
      for (const r of due.filter((x) => notifyOn(settings?.data?.notify, REMINDER_EVENT[x.kind]))) {
        const { data: claimed, error: e } = await db.from('sent_reminders')
          .upsert({ user_id: userId, reminder_id: `${r.id}|${r.date}T${r.time}` }, { onConflict: 'user_id,reminder_id', ignoreDuplicates: true })
          .select('reminder_id');
        if (e) throw e;
        if (!claimed?.length) continue; // already sent
        total += await sendToUser(db, userId, subs, {
          title: r.title, body: r.body, data: { id: r.id, occurrenceKey: r.occurrenceKey, kind: r.kind, url: urlFor(r.kind, r.occurrenceKey) },
        });
      }
    } catch (e) {
      console.error('user failed', userId, (e as Error).message);
    }
  }

  // Snoozed reminders (created from the notification action).
  const { data: snoozed, error: se } = await db.from('snoozed_reminders').select('*').eq('sent', false).lte('fire_at', new Date(nowMs).toISOString());
  if (se) throw se;
  for (const s of snoozed ?? []) {
    const { data: claimed } = await db.from('snoozed_reminders').update({ sent: true }).eq('id', s.id).eq('sent', false).select('id');
    if (!claimed?.length) continue;
    const subs = byUser.get(s.user_id);
    if (!subs) continue;
    if (s.occurrence_key.startsWith('timer:')) {
      // Timer phase ended while the app may be closed ('timer:break' | 'timer:back' | 'timer:end').
      const event = s.occurrence_key.slice(6);
      const { data: st } = await db.from('settings').select('data').eq('user_id', s.user_id).eq('id', 'me').maybeSingle();
      if (!notifyOn(st?.data?.notify, event)) continue;
      total += await sendToUser(db, s.user_id, subs, {
        title: s.title, body: s.body, data: { id: `timer|${s.id}`, occurrenceKey: '', kind: `timer-${event}`, url: '/timer' },
      });
      continue;
    }
    // Skip if the occurrence was completed or skipped meanwhile.
    const { data: occ } = await db.from('occurrences').select('data').eq('user_id', s.user_id).eq('id', s.occurrence_key).maybeSingle();
    if (occ?.data?.doneAt || occ?.data?.skipped) continue;
    total += await sendToUser(db, s.user_id, subs, {
      title: s.title, body: s.body, data: { id: `${s.occurrence_key}|snooze|${s.id}`, occurrenceKey: s.occurrence_key, kind: 'snooze', url: urlFor('snooze', s.occurrence_key) },
    });
  }

  // Housekeeping: forget dedupe records older than 3 days.
  await db.from('sent_reminders').delete().lt('sent_at', new Date(nowMs - 3 * 86400_000).toISOString());
  return total;
}

async function snooze(db: SupabaseClient, body: { endpoint?: string; occurrenceKey?: string; title?: string }) {
  if (!body.endpoint || !body.occurrenceKey) return json({ error: 'endpoint and occurrenceKey required' }, 400);
  const { data: sub } = await db.from('push_subscriptions').select('user_id').eq('deleted', false).eq('data->>endpoint', body.endpoint).maybeSingle();
  if (!sub) return json({ error: 'unknown subscription' }, 403);

  const { taskId, date } = splitOccKey(body.occurrenceKey);
  const { data: task } = await db.from('tasks').select('data').eq('user_id', sub.user_id).eq('id', taskId).maybeSingle();
  const t = task?.data ? migrateTask(task.data) : undefined;
  let fireAt = new Date(Date.now() + SNOOZE_MIN * 60_000);
  let text = t ? reminderText(t, 'snooze') : { title: body.title ?? 'Pengingat tugas', body: 'Yuk mulai sekarang, kamu pasti bisa! ✨' };
  if (t && isDeadline(t)) {
    // Deadline: 15 minutes, never past the deadline (PRD).
    const { data: st } = await db.from('settings').select('data').eq('user_id', sub.user_id).eq('id', 'me').maybeSingle();
    const tz = st?.data?.timezone || DEFAULT_TZ;
    const { data: o } = await db.from('occurrences').select('data').eq('user_id', sub.user_id).eq('id', body.occurrenceKey).maybeSingle();
    const now = wallClock(Date.now(), tz);
    const target = deadlineSnoozeAt(`${now.date}T${now.time}`, dueAtOf(t, date, o?.data));
    fireAt = zonedToUtc(wallDate(target), toMinutes(wallTime(target)), tz);
    text = { title: body.title ?? `Deadline: ${t.title} 🚩`, body: `Deadline pukul ${wallTime(dueAtOf(t, date, o?.data)).replace(':', '.')}. Yuk selesaikan sekarang!` };
  }

  const { error } = await db.from('snoozed_reminders').insert({
    user_id: sub.user_id, occurrence_key: body.occurrenceKey, title: text.title, body: text.body,
    fire_at: fireAt.toISOString(),
  });
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}


/**
 * The running timer, so its end is announced even when the app is closed.
 * {action:'timer', event:'break'|'back'|'end', endsAt, title, body} replaces any pending timer push;
 * {action:'timer-cancel'} removes it (pause / reset / cancel / finished in the app).
 */
async function scheduleTimer(db: SupabaseClient, req: Request, body: { action: string; event?: string; endsAt?: string; title?: string; body?: string }) {
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await db.auth.getUser(jwt);
  if (!auth?.user) return json({ error: 'unauthorized' }, 401);
  await db.from('snoozed_reminders').delete().eq('user_id', auth.user.id).eq('sent', false).like('occurrence_key', 'timer:%');
  if (body.action === 'timer-cancel') return json({ ok: true });
  const fire = Date.parse(body.endsAt ?? '');
  if (!['break', 'back', 'end'].includes(body.event ?? '') || !Number.isFinite(fire) || fire < Date.now() - 60_000) return json({ error: 'bad timer' }, 400);
  const { error } = await db.from('snoozed_reminders').insert({
    user_id: auth.user.id, occurrence_key: `timer:${body.event}`,
    title: (body.title ?? 'Timer selesai').slice(0, 120), body: (body.body ?? '').slice(0, 200), fire_at: new Date(fire).toISOString(),
  });
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const body = await req.json().catch(() => ({}));

  if (body.action === 'snooze') return snooze(db, body);
  if (body.action === 'timer' || body.action === 'timer-cancel') return scheduleTimer(db, req, body);

  if (!CRON_SECRET || (req.headers.get('Authorization') ?? '') !== `Bearer ${CRON_SECRET}`) return json({ error: 'unauthorized' }, 401);
  try {
    const sent = await sendDue(db);
    return json({ ok: true, sent });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
