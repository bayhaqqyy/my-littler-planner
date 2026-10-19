// Supabase Edge Function: one-way Google Calendar sync (Little Planner → Google).
//
// GET  ?code&state                     — OAuth callback from Google (redirects back to the app)
// POST {action:'start'}                — user JWT; returns the Google consent URL
// POST {action:'status'|'sync'|'disconnect'} — user JWT
// POST {action:'sync-all'}             — pg_cron, `Authorization: Bearer <CRON_SECRET>`
//
// Tasks become events in a dedicated "Little Planner" calendar the app creates. The scope
// `calendar.app.created` only gives access to calendars this app made — never the user's others.
// Event mapping is the same pure code as the app (bundled from src/domain by `npm run build:edge`).
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
// @deno-types="../_shared/domain.d.ts"
import { desiredEvents, gcalEventId, migrateTask, planSync } from '../_shared/domain.js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET')!;
const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const STATE_SECRET = Deno.env.get('GCAL_STATE_SECRET')!;
const APP_URL = (Deno.env.get('APP_URL') ?? '').replace(/\/$/, '');
const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/gcal`;
const SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/calendar.app.created'];
const CAL_API = 'https://www.googleapis.com/calendar/v3';
const DEFAULT_TZ = 'Asia/Jakarta';
const CALENDAR_NAME = 'Little Planner 🌷';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const redirect = (url: string) => new Response(null, { status: 302, headers: { Location: url } });

interface Conn { user_id: string; google_email: string | null; refresh_token: string; calendar_id: string | null; last_sync_at: string | null; last_error: string | null }
class ReconnectNeeded extends Error {}

/* ---------- signed OAuth state ---------- */

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const hmacKey = () => crypto.subtle.importKey('raw', new TextEncoder().encode(STATE_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

async function signState(userId: string): Promise<string> {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ u: userId, t: Date.now() })));
  const sig = b64url(await crypto.subtle.sign('HMAC', await hmacKey(), new TextEncoder().encode(payload)));
  return `${payload}.${sig}`;
}

async function verifyState(state: string): Promise<string | null> {
  const [payload, sig] = state.split('.');
  if (!payload || !sig) return null;
  const expected = b64url(await crypto.subtle.sign('HMAC', await hmacKey(), new TextEncoder().encode(payload)));
  if (expected !== sig) return null;
  const { u, t } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  return Date.now() - t < 15 * 60_000 ? u : null; // valid for 15 minutes
}

/* ---------- Google helpers ---------- */

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, ...params }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.error === 'invalid_grant') throw new ReconnectNeeded('Akses Google dicabut atau kedaluwarsa');
    throw new Error(`token: ${data.error_description ?? data.error}`);
  }
  return data as { access_token: string; refresh_token?: string; id_token?: string };
}

async function gapi(token: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${CAL_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) throw new ReconnectNeeded('Akses Google ditolak');
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

async function createCalendar(token: string, timeZone: string): Promise<string> {
  const r = await gapi(token, 'POST', '/calendars', {
    summary: CALENDAR_NAME,
    description: `Tugas dari My Little Planner (${APP_URL}). Diisi otomatis — ubah tugas di aplikasi, bukan di sini.`,
    timeZone,
  });
  if (r.status >= 300) throw new Error(`create calendar ${r.status}: ${JSON.stringify(r.data?.error?.message ?? r.data)}`);
  return r.data.id;
}

/* ---------- sync ---------- */

// deno-lint-ignore no-explicit-any
async function rowsOf(db: SupabaseClient, table: string, userId: string): Promise<any[]> {
  // deno-lint-ignore no-explicit-any
  const out: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select('data').eq('user_id', userId).eq('deleted', false).range(from, from + 999);
    if (error) throw error;
    out.push(...data.map((r) => r.data));
    if (data.length < 1000) return out;
  }
}

function wallDate(ms: number, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
  } catch {
    return wallDate(ms, DEFAULT_TZ);
  }
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(n, queue.length) }, async () => { while (queue.length) await fn(queue.shift()!); }));
}

async function syncUser(db: SupabaseClient, conn: Conn, retry = true): Promise<{ upserted: number; removed: number }> {
  try {
    const { access_token } = await tokenRequest({ grant_type: 'refresh_token', refresh_token: conn.refresh_token });
    const [settings] = await rowsOf(db, 'settings', conn.user_id);
    const tz = settings?.timezone || DEFAULT_TZ;

    let calendarId = conn.calendar_id;
    if (!calendarId) {
      calendarId = await createCalendar(access_token, tz);
      await db.from('gcal_connections').update({ calendar_id: calendarId }).eq('user_id', conn.user_id);
      await db.from('gcal_events').delete().eq('user_id', conn.user_id);
    }

    // deno-lint-ignore no-explicit-any
    const tasks = (await rowsOf(db, 'tasks', conn.user_id)).map((t: any) => migrateTask(t)).filter((t: any) => !t.deletedAt);
    // deno-lint-ignore no-explicit-any
    const occs = Object.fromEntries((await rowsOf(db, 'occurrences', conn.user_id)).map((o: any) => [o.key, o]));
    const today = wallDate(Date.now(), tz);
    const desired = desiredEvents(tasks, occs, today, tz, APP_URL);

    // Only reconcile inside the window: older pushed events stay as history.
    const windowStart = new Date(Date.parse(today) - 7 * 86400_000).toISOString().slice(0, 10);
    const { data: pushedRows, error } = await db.from('gcal_events').select('occurrence_key,hash').eq('user_id', conn.user_id);
    if (error) throw error;
    const pushed = Object.fromEntries(
      (pushedRows ?? []).filter((r) => r.occurrence_key.slice(r.occurrence_key.lastIndexOf('@') + 1) >= windowStart).map((r) => [r.occurrence_key, r.hash]),
    );
    const { upsert, remove } = planSync(desired, pushed);
    const cal = encodeURIComponent(calendarId);
    let calendarGone = false;

    await pool(upsert, 5, async (d) => {
      // Update first (also revives an event deleted in Google); insert when it never existed.
      let r = await gapi(access_token, 'PUT', `/calendars/${cal}/events/${d.eventId}`, { ...d.event, status: 'confirmed' });
      if (r.status === 404) r = await gapi(access_token, 'POST', `/calendars/${cal}/events`, { ...d.event, id: d.eventId });
      if (r.status === 404) { calendarGone = true; return; }
      if (r.status >= 300) throw new Error(`event ${r.status}: ${r.data?.error?.message}`);
      await db.from('gcal_events').upsert({ user_id: conn.user_id, occurrence_key: d.key, hash: d.hash });
    });
    await pool(remove, 5, async (key) => {
      const r = await gapi(access_token, 'DELETE', `/calendars/${cal}/events/${gcalEventId(key)}`);
      if (r.status >= 300 && r.status !== 404 && r.status !== 410) throw new Error(`delete ${r.status}: ${r.data?.error?.message}`);
      await db.from('gcal_events').delete().eq('user_id', conn.user_id).eq('occurrence_key', key);
    });

    if (calendarGone && retry) {
      // The user deleted the Little Planner calendar in Google: make a new one and push everything again.
      await db.from('gcal_connections').update({ calendar_id: null }).eq('user_id', conn.user_id);
      return syncUser(db, { ...conn, calendar_id: null }, false);
    }
    await db.from('gcal_connections').update({ last_sync_at: new Date().toISOString(), last_error: null }).eq('user_id', conn.user_id);
    return { upserted: upsert.length, removed: remove.length };
  } catch (e) {
    const msg = e instanceof ReconnectNeeded ? `reconnect: ${e.message}` : (e as Error).message;
    await db.from('gcal_connections').update({ last_error: msg.slice(0, 300) }).eq('user_id', conn.user_id);
    throw e;
  }
}

async function getConn(db: SupabaseClient, userId: string): Promise<Conn | null> {
  const { data } = await db.from('gcal_connections').select('*').eq('user_id', userId).maybeSingle();
  return data as Conn | null;
}

/* ---------- handlers ---------- */

async function handleCallback(db: SupabaseClient, url: URL): Promise<Response> {
  const back = (status: string, reason?: string) =>
    redirect(`${APP_URL}/settings?gcal=${status}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`);
  if (url.searchParams.get('error')) return back('cancelled', url.searchParams.get('error')!);
  const userId = await verifyState(url.searchParams.get('state') ?? '');
  if (!userId) return back('error', 'Sesi menghubungkan sudah kedaluwarsa, coba lagi');
  try {
    const tok = await tokenRequest({ grant_type: 'authorization_code', code: url.searchParams.get('code') ?? '', redirect_uri: REDIRECT_URI });
    const granted = (url.searchParams.get('scope') ?? '').split(' ');
    if (!granted.includes('https://www.googleapis.com/auth/calendar.app.created')) return back('error', 'Izin kalender tidak dicentang');
    const old = await getConn(db, userId);
    const refresh = tok.refresh_token ?? old?.refresh_token;
    if (!refresh) return back('error', 'Google tidak memberi akses offline, coba lagi');
    let email: string | null = null;
    if (tok.id_token) {
      try { email = JSON.parse(atob(tok.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).email ?? null; } catch { /* ignore */ }
    }
    // A different Google account can't see the old calendar: start fresh.
    const sameAccount = old && old.google_email === email;
    const conn: Conn = { user_id: userId, google_email: email, refresh_token: refresh, calendar_id: sameAccount ? old!.calendar_id : null, last_sync_at: null, last_error: null };
    const { error } = await db.from('gcal_connections').upsert(conn);
    if (error) throw error;
    if (!sameAccount) await db.from('gcal_events').delete().eq('user_id', userId);
    await syncUser(db, conn).catch((e) => console.error('first sync', e));
    return back('connected');
  } catch (e) {
    console.error('callback', e);
    return back('error', (e as Error).message);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const url = new URL(req.url);

  if (req.method === 'GET') return handleCallback(db, url);
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const body = await req.json().catch(() => ({}));
  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');

  if (body.action === 'sync-all') {
    if (!CRON_SECRET || bearer !== CRON_SECRET) return json({ error: 'unauthorized' }, 401);
    const { data: conns } = await db.from('gcal_connections').select('*');
    let ok = 0, failed = 0;
    for (const c of (conns ?? []) as Conn[]) {
      if (c.last_error?.startsWith('reconnect')) continue; // waits for the user to reconnect
      try { await syncUser(db, c); ok++; } catch (e) { failed++; console.error('sync', c.user_id, (e as Error).message); }
    }
    return json({ ok, failed });
  }

  // Everything else acts for the signed-in user.
  const { data: auth } = await db.auth.getUser(bearer);
  const user = auth?.user;
  if (!user) return json({ error: 'unauthorized' }, 401);

  switch (body.action) {
    case 'start': {
      const params = new URLSearchParams({
        client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: 'code', scope: SCOPES.join(' '),
        access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state: await signState(user.id),
      });
      return json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
    }
    case 'status': {
      const c = await getConn(db, user.id);
      return json(c ? { connected: true, email: c.google_email, lastSyncAt: c.last_sync_at, lastError: c.last_error } : { connected: false });
    }
    case 'sync': {
      const c = await getConn(db, user.id);
      if (!c) return json({ connected: false });
      try { return json({ connected: true, ...(await syncUser(db, c)) }); } catch (e) { return json({ connected: true, error: (e as Error).message }, 200); }
    }
    case 'disconnect': {
      const c = await getConn(db, user.id);
      if (c) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(c.refresh_token)}`, { method: 'POST' }).catch(() => {});
      await db.from('gcal_events').delete().eq('user_id', user.id);
      await db.from('gcal_connections').delete().eq('user_id', user.id);
      return json({ ok: true });
    }
    default:
      return json({ error: 'unknown action' }, 400);
  }
});
