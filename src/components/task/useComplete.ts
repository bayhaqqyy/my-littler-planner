import { CHEERS, toDateStr } from '@/domain';
import { useStore } from '@/store/store';
import { useUi } from '@/store/ui';
import { playEvent } from '@/services/audio';

/** Complete an occurrence with all the fun: burst, cheer toast, streak toast, celebration. */
export function completeWithFx(key: string, origin?: { x: number; y: number }, opts?: { timed?: boolean }) {
  const st = useStore.getState();
  const ui = useUi.getState();
  const res = st.complete(key, opts);
  if (st.settings.notify?.done !== false) playEvent(st.settings, 'done');
  if (origin) ui.setBurst(origin.x, origin.y);
  ui.pushToast('cheer', CHEERS[Math.floor(Math.random() * CHEERS.length)]);
  if (res.early) setTimeout(() => ui.pushToast('gift', 'Selesai lebih awal! Peluang kado langka lebih besar ✨'), 300);
  if (res.firstToday && res.streak) setTimeout(() => ui.pushToast('streak', `Streak ${res.streak} hari!`), 500);
  for (const g of res.streakGifts) setTimeout(() => ui.pushToast('gift', `Kado Edisi Streak: ${g.source}! 🎁`), 900);
  if (res.allDone && st.markCelebrated(toDateStr(new Date()))) setTimeout(() => ui.setCelebrate(true), 700);
  return res;
}
