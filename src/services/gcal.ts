import { supabase } from './supabase';

/** One-way Google Calendar sync, served by the `gcal` Edge Function. */
export interface GcalStatus { connected: boolean; email?: string | null; lastSyncAt?: string | null; lastError?: string | null }

async function call<T>(action: string): Promise<T> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const { data, error } = await supabase.functions.invoke('gcal', { body: { action } });
  if (error) throw error;
  return data as T;
}

let connected: boolean | undefined;

export async function gcalStatus(): Promise<GcalStatus> {
  const s = await call<GcalStatus>('status');
  connected = s.connected;
  return s;
}

/** Leaves the app for Google's consent screen; Google returns to /settings?gcal=... */
export async function gcalConnect() {
  const { url } = await call<{ url: string }>('start');
  window.location.href = url;
}

export const gcalSyncNow = () => call<{ connected: boolean; upserted?: number; removed?: number; error?: string }>('sync');

export async function gcalDisconnect() {
  await call('disconnect');
  connected = false;
}

/** Called after task changes reach the server; batches bursts of edits into one sync. */
let timer: ReturnType<typeof setTimeout> | undefined;
export function scheduleGcalSync() {
  if (!supabase || connected === false) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      if (connected === undefined) await gcalStatus();
      if (connected) await gcalSyncNow();
    } catch { /* the 5-minute server job catches up */ }
  }, 4000);
}
