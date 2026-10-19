import { supabase } from './supabase';
import { scheduleGcalSync } from './gcal';
import { rowData, TABLES, useStore, type Table } from '@/store/store';

/**
 * Offline-first sync. Every table has the same shape:
 *   (user_id, id, data jsonb, updated_at, deleted, server_updated_at)
 * Local writes are pushed (upsert), remote changes are pulled by `server_updated_at`
 * and merged last-write-wins on `updated_at`.
 */
let running: Promise<void> | null = null;
let userId: string | null = null;

export function setSyncUser(id: string | null) { userId = id; }

async function push(table: Table) {
  const s = useStore.getState();
  const ids = Object.keys(s.dirty[table] ?? {});
  if (!ids.length || !supabase || !userId) return;
  // Never upload one account's local data into another account.
  if (s.ownerId !== userId) return;
  const rows = ids.map((id) => {
    const meta = s.meta[table]?.[id];
    const data = rowData(s, table, id);
    return { user_id: userId!, id, data: data ?? {}, updated_at: meta?.updatedAt ?? new Date().toISOString(), deleted: !!meta?.deleted || data === undefined };
  });
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'user_id,id' });
  if (error) throw error;
  useStore.getState().clearDirty(table, rows.map((r) => ({ id: r.id, updatedAt: r.updated_at })));
  // Task changes are on the server now: mirror them to Google Calendar (if connected).
  if (table === 'tasks' || table === 'occurrences') scheduleGcalSync();
}

async function pull(table: Table) {
  if (!supabase || !userId) return;
  let cursor = useStore.getState().cursor[table];
  let first = true;
  for (;;) {
    let q = supabase.from(table).select('id,data,updated_at,deleted,server_updated_at').eq('user_id', userId).order('server_updated_at', { ascending: true }).limit(500);
    // Overlap the cursor a little: a concurrent transaction can commit a row with an
    // earlier server timestamp after we've read past it. Re-applying rows is idempotent (LWW).
    // Only the first page overlaps, so paging always moves forward.
    if (cursor) q = q.gt('server_updated_at', first ? new Date(Date.parse(cursor) - 5000).toISOString() : cursor);
    first = false;
    const { data, error } = await q;
    if (error) throw error;
    if (!data?.length) return;
    const st = useStore.getState();
    if (st.ownerId !== userId) return;
    for (const r of data) st.applyRemote(table, r.id, r.data, r.updated_at, r.deleted);
    cursor = data[data.length - 1].server_updated_at;
    st.setCursor(table, cursor!);
    if (data.length < 500) return;
  }
}

export function syncNow(): Promise<void> {
  if (!supabase || !userId || (typeof navigator !== 'undefined' && navigator.onLine === false)) return Promise.resolve();
  if (running) return running;
  running = (async () => {
    try {
      for (const t of TABLES) await push(t);
      for (const t of TABLES) await pull(t);
      useSyncStatus.set({ lastSync: new Date().toISOString(), error: undefined });
    } catch (e) {
      useSyncStatus.set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      running = null;
    }
  })();
  return running;
}

/** Delete every row of the current user on the server. */
export async function deleteRemoteData() {
  if (!supabase || !userId) return;
  for (const t of TABLES) {
    const { error } = await supabase.from(t).delete().eq('user_id', userId);
    if (error) throw error;
  }
}

/** Tiny observable for the settings screen. */
type SyncStatus = { lastSync?: string; error?: string };
const listeners = new Set<() => void>();
let status: SyncStatus = {};
export const useSyncStatus = {
  get: () => status,
  set: (p: SyncStatus) => { status = { ...status, ...p }; listeners.forEach((l) => l()); },
  subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
};

/** Start background sync: on online, on focus, and every 30 s when something is dirty. */
export function startAutoSync(): () => void {
  syncNow();
  const onOnline = () => syncNow();
  const onVisible = () => { if (document.visibilityState === 'visible') syncNow(); };
  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onVisible);
  const iv = setInterval(() => {
    const d = useStore.getState().dirty;
    if (Object.values(d).some((r) => r && Object.keys(r).length)) syncNow();
  }, 30_000);
  return () => { window.removeEventListener('online', onOnline); document.removeEventListener('visibilitychange', onVisible); clearInterval(iv); };
}
