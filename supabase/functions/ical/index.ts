// Supabase Edge Function: private iCalendar feed of a user's tasks.
//
// GET  ?token=…                 — the .ics feed (Apple Calendar, Google Calendar, Outlook subscribe to it)
// POST {action:'get'|'reset'}   — user JWT; returns the feed URL (reset makes a new token, old links stop working)
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
// @deno-types="../_shared/domain.d.ts"
import { buildIcs, migrateTask } from '../_shared/domain.js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = (Deno.env.get('APP_URL') ?? '').replace(/\/$/, '');
const DEFAULT_TZ = 'Asia/Jakarta';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const newToken = () => {
  const b = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const feedUrl = (token: string) => `${SUPABASE_URL}/functions/v1/ical?token=${token}`;

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

function wallDate(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch {
    return wallDate(DEFAULT_TZ);
  }
}

async function feed(db: SupabaseClient, token: string): Promise<Response> {
  const { data: row } = await db.from('ical_tokens').select('user_id').eq('token', token).maybeSingle();
  if (!row) return new Response('Not found', { status: 404 });
  const [settings] = await rowsOf(db, 'settings', row.user_id);
  let tz = settings?.timezone || DEFAULT_TZ;
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch { tz = DEFAULT_TZ; }
  // deno-lint-ignore no-explicit-any
  const tasks = (await rowsOf(db, 'tasks', row.user_id)).map((t: any) => migrateTask(t)).filter((t: any) => !t.deletedAt);
  // deno-lint-ignore no-explicit-any
  const occs = Object.fromEntries((await rowsOf(db, 'occurrences', row.user_id)).map((o: any) => [o.key, o]));
  const body = buildIcs(tasks, occs, { timeZone: tz, appUrl: APP_URL, now: new Date(), today: wallDate(tz) });
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="little-planner.ics"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const token = url.searchParams.get('token') ?? '';
    if (token.length < 20) return new Response('Not found', { status: 404 });
    return feed(db, token);
  }
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await db.auth.getUser(jwt);
  const user = auth?.user;
  if (!user) return json({ error: 'unauthorized' }, 401);
  const body = await req.json().catch(() => ({}));

  if (body.action === 'reset') {
    const token = newToken();
    const { error } = await db.from('ical_tokens').upsert({ user_id: user.id, token, created_at: new Date().toISOString() });
    if (error) return json({ error: error.message }, 500);
    return json({ url: feedUrl(token) });
  }
  // 'get': reuse the existing link, or make the first one.
  const { data: existing } = await db.from('ical_tokens').select('token').eq('user_id', user.id).maybeSingle();
  if (existing) return json({ url: feedUrl(existing.token) });
  const token = newToken();
  const { error } = await db.from('ical_tokens').insert({ user_id: user.id, token });
  if (error) return json({ error: error.message }, 500);
  return json({ url: feedUrl(token) });
});
