import type { SoundEvent } from '@/domain';
import { splitOccKey } from '@/domain';
import type { ActiveTimer } from '@/store/store';
import { useStore } from '@/store/store';
import { supabase } from './supabase';

/**
 * Mirrors the running timer to the server so the end of a phase is pushed even when the app
 * is closed. Paused / reset / cancelled timers cancel the pending push.
 */
let scheduled: string | undefined;

function describe(t: ActiveTimer): { event: SoundEvent; title: string; body: string } {
  const task = useStore.getState().tasks[splitOccKey(t.occurrenceKey).taskId]?.title ?? 'tugas';
  if (t.phase !== 'focus') return { event: 'back', title: 'Istirahat selesai 🌷', body: `Yuk lanjut fokus lagi: ${task}` };
  if (t.mode === 'pomodoro') return { event: 'break', title: 'Waktunya istirahat! ☕', body: `Sesi fokus ${task} selesai. Minum air dulu yuk!` };
  return { event: 'end', title: `Waktu ${task} habis! ⏰`, body: 'Sudah selesai? Buka timer untuk lanjut.' };
}

async function send(body: Record<string, unknown>) {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;
  await supabase.functions.invoke('send-reminders', { body }).catch(() => {});
}

export function syncTimerPush(t: ActiveTimer | undefined) {
  if (t && t.state === 'running' && t.endsAt) {
    const d = describe(t);
    const key = `${t.endsAt}|${d.event}`;
    if (key === scheduled) return;
    scheduled = key;
    void send({ action: 'timer', event: d.event, endsAt: t.endsAt, title: d.title, body: d.body });
  } else if (scheduled) {
    scheduled = undefined;
    void send({ action: 'timer-cancel' });
  }
}
