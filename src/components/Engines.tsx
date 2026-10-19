import { useEffect } from 'react';
import { router } from 'expo-router';
import { addDays, fromMinutes, pendingReminders, snoozeReminder, splitOccKey, stamp, toDateStr, toMinutes, type Reminder } from '@/domain';
import { useStore } from '@/store/store';
import { useUi } from '@/store/ui';
import { playEvent } from '@/services/audio';
import { syncTimerPush } from '@/services/timerPush';
import { deadlineReminderText, deadlineSnoozeAt, dueAtOf, isDeadline, notifyOn, REMINDER_EVENT, wallDate, wallTime, wallToDate } from '@/domain';
import type { SoundEvent } from '@/domain';
import { hasPushSubscription, showLocalNotification } from '@/services/notifications';
import { completeWithFx } from './task/useComplete';
import { badgesFromState, levelFromState } from '@/store/selectors';

const LS_LAST = 'mlp-reminder-last';
const LS_FIRED = 'mlp-reminder-fired';
const LS_SNOOZED = 'mlp-reminder-snoozed';

const ls = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

const nowParts = (d = new Date()) => ({ date: toDateStr(d), time: fromMinutes(d.getHours() * 60 + d.getMinutes()) });
const plusMinute = (p: { date: string; time: string }) => {
  const m = toMinutes(p.time) + 1;
  return m >= 1440 ? `${addDays(p.date, 1)} 00:00` : `${p.date} ${fromMinutes(m)}`;
};

function alarm(event: SoundEvent) {
  const s = useStore.getState().settings;
  if (notifyOn(s.notify, event)) playEvent(s, event);
}

const REMINDER_SOUND: Record<Reminder['kind'], SoundEvent> = REMINDER_EVENT;

async function fire(r: Reminder) {
  if (!notifyOn(useStore.getState().settings.notify, REMINDER_SOUND[r.kind])) return; // this kind is switched off
  const fired = ls.get<string[]>(LS_FIRED, []);
  if (fired.includes(r.id)) return;
  ls.set(LS_FIRED, [...fired.slice(-300), r.id]);
  if (document.visibilityState === 'visible') {
    useUi.getState().pushBanner(r);
    alarm(REMINDER_SOUND[r.kind]);
  } else if (!(await hasPushSubscription())) {
    // No server push on this browser: show a local notification while the tab lives in the background.
    const actions = r.kind === 'deadline-due'
      ? [{ action: 'done', title: 'Tandai selesai' }, { action: 'reschedule', title: 'Jadwalkan ulang' }]
      : r.kind === 'deadline-before'
        ? [{ action: 'start', title: 'Kerjakan sekarang' }, { action: 'done', title: 'Tandai selesai' }]
        : r.kind === 'end'
          ? [{ action: 'done', title: 'Tandai selesai' }, { action: 'snooze', title: 'Tunda 5 menit' }]
          : [{ action: 'start', title: 'Mulai sekarang' }, { action: 'snooze', title: 'Tunda 5 menit' }];
    showLocalNotification(r.title, r.body, { id: r.id, occurrenceKey: r.occurrenceKey, kind: r.kind }, actions);
  }
}

/** Snooze a reminder for 5 minutes (in-app). */
export function snoozeLocal(key: string, bannerId?: string) {
  const s = useStore.getState();
  const task = s.tasks[splitOccKey(key).taskId];
  if (bannerId) useUi.getState().dropBanner(bannerId);
  if (!task) return;
  const n = nowParts();
  let r = snoozeReminder(task, key, n.date, n.time);
  let msg = 'Oke, diingatkan lagi 5 menit lagi ⏰';
  if (isDeadline(task)) {
    // Deadline: 15 minutes later, but never past the deadline (PRD).
    const { date } = splitOccKey(key);
    const dueAt = dueAtOf(task, date, s.occurrences[key]);
    const at = deadlineSnoozeAt(`${n.date}T${n.time}`, dueAt);
    const offset = Math.max(0, Math.round((wallToDate(dueAt).getTime() - wallToDate(at).getTime()) / 60_000));
    const text = offset === 0
      ? deadlineReminderText(task.title, 0, dueAt)
      : { title: `${offset} menit lagi: ${task.title}`, body: deadlineReminderText(task.title, 60, dueAt).body };
    r = { ...r, id: `${key}|snooze|${at}`, kind: offset === 0 ? 'deadline-due' : 'deadline-before', date: wallDate(at), time: wallTime(at), ...text };
    msg = offset === 0 ? 'Oke, diingatkan lagi saat deadline ⏰' : 'Oke, diingatkan lagi 15 menit lagi ⏰';
  }
  ls.set(LS_SNOOZED, [...ls.get<Reminder[]>(LS_SNOOZED, []), r]);
  useUi.getState().pushToast('info', msg);
}

/** Checks reminders every 15 s while the app is open (banners + sound). */
function checkReminders() {
  const s = useStore.getState();
  const n = nowParts();
  const nowStamp = `${n.date} ${n.time}`;
  const floor = (() => { const d = new Date(Date.now() - 10 * 60_000); const p = nowParts(d); return `${p.date} ${p.time}`; })();
  let last = ls.get<string>(LS_LAST, floor);
  if (last < floor) last = floor;
  const to = plusMinute(n);
  const tasks = Object.values(s.tasks);
  const due = pendingReminders(tasks, s.occurrences, n.date, 1, last, to);
  ls.set(LS_LAST, to);
  due.forEach(fire);
  const snoozed = ls.get<Reminder[]>(LS_SNOOZED, []);
  const ready = snoozed.filter((r) => stamp(r) <= nowStamp);
  if (ready.length) {
    ls.set(LS_SNOOZED, snoozed.filter((r) => stamp(r) > nowStamp));
    ready.forEach((r) => {
      const o = s.occurrences[r.occurrenceKey];
      if (!o?.doneAt && !o?.skipped) fire(r);
    });
  }
}

/**
 * Toast when a badge is earned or the level goes up. What's already known is remembered per
 * account, so the first run on a device (or a big sync) records silently instead of spamming.
 */
function watchAchievements(): () => void {
  let last: unknown[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const check = () => {
    const s = useStore.getState();
    if (!s.hydrated || !s.ownerId) return;
    const deps = [s.ownerId, s.completionLogs, s.focusLogs, s.progress, s.notes, s.wardrobe];
    if (deps.every((d, i) => d === last[i])) return;
    last = deps;
    const key = `mlp-known-achievements:${s.ownerId}`;
    const earned = badgesFromState(s).filter((b) => b.earned);
    const level = levelFromState(s);
    const known = ls.get<{ ids: string[]; level: number } | null>(key, null);
    ls.set(key, { ids: earned.map((b) => b.id), level: level.level });
    if (!known) return;
    const fresh = earned.filter((b) => !known.ids.includes(b.id));
    const toast = useUi.getState().pushToast;
    fresh.slice(0, 2).forEach((b, i) => setTimeout(() => toast('gift', `Badge baru: ${b.emoji} ${b.name}!`), 1200 + i * 900));
    if (fresh.length > 2) setTimeout(() => toast('gift', `+${fresh.length - 2} badge lainnya 🎉`), 3000);
    if (level.level > known.level) setTimeout(() => toast('gift', `Naik ke Lv. ${level.level} · ${level.title}! 🌟`), 800);
  };
  const unsub = useStore.subscribe(() => { clearTimeout(timer); timer = setTimeout(check, 600); });
  check();
  return () => { unsub(); clearTimeout(timer); };
}

export function Engines() {
  useEffect(() => watchAchievements(), []);

  // Keep the server's "timer ends" push in step with the local timer.
  useEffect(() => {
    let last = useStore.getState().timer;
    syncTimerPush(last);
    return useStore.subscribe((s) => {
      if (s.timer === last) return;
      const prev = last;
      last = s.timer;
      if (prev?.state !== last?.state || prev?.endsAt !== last?.endsAt || prev?.phase !== last?.phase) syncTimerPush(last);
    });
  }, []);

  const timerTick = useStore((s) => s.timerTick);

  // Timer: derive from endsAt; detect finish even after the app was closed.
  useEffect(() => {
    const tick = () => {
      const r = timerTick();
      if (r.finished) {
        const t = useStore.getState().timer;
        // Pomodoro focus over → break sound; break over → back-to-study; plain task timer → time's up.
        alarm(r.finished !== 'focus' ? 'back' : t?.mode === 'pomodoro' ? 'break' : 'end');
        const task = t && useStore.getState().tasks[splitOccKey(t.occurrenceKey).taskId];
        const msg = r.finished === 'focus' ? `Sesi fokus ${task?.title ?? ''} selesai! 🍅` : 'Istirahat selesai, yuk fokus lagi! 🌷';
        useUi.getState().pushToast('info', msg);
        const ev: SoundEvent = r.finished !== 'focus' ? 'back' : t?.mode === 'pomodoro' ? 'break' : 'end';
        if (document.visibilityState !== 'visible' && notifyOn(useStore.getState().settings.notify, ev)) {
          showLocalNotification(msg, 'Buka timer untuk lanjut', { id: `timer-${Date.now()}`, occurrenceKey: t?.occurrenceKey ?? '', kind: 'timer' }, [{ action: 'start', title: 'Buka timer' }]);
        }
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    const onVis = () => tick();
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVis); };
  }, [timerTick]);

  // Reminders.
  useEffect(() => {
    checkReminders();
    const iv = setInterval(checkReminders, 15_000);
    const onVis = () => { if (document.visibilityState === 'visible') checkReminders(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // Messages from the service worker (push while focused, notification clicks).
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMsg = (e: MessageEvent) => {
      const m = e.data;
      if (m?.type === 'reminder' && m.data?.occurrenceKey) {
        const st = useStore.getState();
        const key = m.data.occurrenceKey as string;
        const task = st.tasks[splitOccKey(key).taskId];
        if (!task) return;
        const n = nowParts();
        fire({ id: m.data.id ?? `${key}|push`, occurrenceKey: key, taskId: task.id, kind: m.data.kind ?? 'start', date: n.date, time: n.time, title: m.title, body: m.body });
      } else if (m?.type === 'navigate' && typeof m.url === 'string') {
        router.push(m.url);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMsg);
    return () => navigator.serviceWorker.removeEventListener('message', onMsg);
  }, []);

  // Deep link from a notification: /?complete=<key>
  useEffect(() => {
    const url = new URL(window.location.href);
    const key = url.searchParams.get('complete');
    if (key && useStore.getState().tasks[splitOccKey(key).taskId]) {
      completeWithFx(key);
      url.searchParams.delete('complete');
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, []);

  return null;
}
