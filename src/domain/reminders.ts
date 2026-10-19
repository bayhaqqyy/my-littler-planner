import { addDays, fromMinutes, toMinutes } from './dates';
import { endOf, occKey, occursOn } from './occurrences';
import { CATEGORY_EMOJI } from './types';
import type { Occurrence, Task } from './types';
import { deadlineOccurrences, deadlineReminderText, deadlineReminderTimes, dueAtOf, isDeadline, wallDate, wallTime } from './deadline';

export type ReminderKind = 'before' | 'start' | 'end' | 'snooze' | 'deadline-before' | 'deadline-due';

export interface Reminder {
  id: string;            // `${occKey}|${kind}` (deadline: `${occKey}|dl${offset}`)
  occurrenceKey: string;
  taskId: string;
  kind: ReminderKind;
  /** Wall-clock date + minute-of-day in the device time zone (may roll over to another day). */
  date: string;
  time: string;
  title: string;
  body: string;
}

export const SNOOZE_MIN = 5;

/** Shift a (date, minutes) pair so minutes fall within 0..1439. */
function normalize(date: string, minutes: number): { date: string; time: string } {
  const dayShift = Math.floor(minutes / 1440);
  return { date: addDays(date, dayShift), time: fromMinutes(minutes - dayShift * 1440) };
}

export function reminderText(task: Pick<Task, 'title' | 'category'>, kind: ReminderKind, beforeMin = 0) {
  const emoji = CATEGORY_EMOJI[task.category];
  switch (kind) {
    case 'before':
      return { title: `${beforeMin} menit lagi: ${task.title} ${emoji}`, body: 'Siap-siap ya, sebentar lagi mulai! 🌷' };
    case 'start':
    case 'snooze':
      return { title: `Waktunya ${task.title}! ${emoji}`, body: 'Yuk mulai sekarang, kamu pasti bisa! ✨' };
    case 'end':
      return { title: `Waktu ${task.title} sudah habis! ⏰`, body: 'Sudah selesai? Tandai selesai untuk dapat kado 🎁' };
    case 'deadline-before':
    case 'deadline-due':
      return { title: `Deadline: ${task.title} 🚩`, body: 'Yuk selesaikan sekarang!' };
  }
}

/** Reminders of one deadline occurrence: one per chosen offset before its due time. */
export function deadlineRemindersFor(task: Task, date: string, occ?: Pick<Occurrence, 'dueAt'>, now?: Date): Reminder[] {
  const key = occKey(task.id, date);
  const dueAt = dueAtOf(task, date, occ);
  return deadlineReminderTimes(dueAt, task.deadlineRemindersMin ?? [], now).map(({ offset, at }) => ({
    id: `${key}|dl${offset}`,
    occurrenceKey: key,
    taskId: task.id,
    kind: offset === 0 ? 'deadline-due' : 'deadline-before',
    date: wallDate(at),
    time: wallTime(at),
    ...deadlineReminderText(task.title, offset, dueAt),
  }));
}

/** Reminders for one occurrence of a timed task. Untimed tasks have none. */
export function remindersFor(task: Task, date: string, occ?: Pick<Occurrence, 'dueAt'>): Reminder[] {
  if (isDeadline(task)) return deadlineRemindersFor(task, date, occ);
  if (!task.start) return [];
  const key = occKey(task.id, date);
  const start = toMinutes(task.start);
  const out: Reminder[] = [];
  const push = (kind: ReminderKind, minutes: number, beforeMin = 0) => {
    const { date: d, time } = normalize(date, minutes);
    out.push({ id: `${key}|${kind}`, occurrenceKey: key, taskId: task.id, kind, date: d, time, ...reminderText(task, kind, beforeMin) });
  };
  if (task.remindBeforeMin > 0) push('before', start - task.remindBeforeMin, task.remindBeforeMin);
  if (task.remindAtStart) push('start', start);
  const end = endOf(task);
  if (task.remindAtEnd && end !== undefined) push('end', end);
  return out;
}

/** Sortable wall-clock stamp `YYYY-MM-DD HH:mm`. */
export const stamp = (r: { date: string; time: string }) => `${r.date} ${r.time}`;

/**
 * All pending reminders whose wall-clock time is within [fromStamp, toStamp).
 * Done/skipped occurrences and deleted tasks produce nothing.
 */
export function pendingReminders(
  tasks: Task[],
  occs: Record<string, Occurrence>,
  today: string,
  days: number,
  fromStamp: string,
  toStamp: string,
): Reminder[] {
  const out: Reminder[] = [];
  // Look one day back so "end" reminders of late tasks and "before" rollovers are covered.
  for (let i = -1; i <= days; i++) {
    const date = addDays(today, i);
    for (const t of tasks) {
      if (isDeadline(t) || !occursOn(t, date)) continue;
      const o = occs[occKey(t.id, date)];
      if (o?.doneAt || o?.skipped) continue;
      for (const r of remindersFor(t, date)) {
        const s = stamp(r);
        if (s >= fromStamp && s < toStamp) out.push(r);
      }
    }
  }
  // Deadlines: by due date (rescheduled ones included); reminders can be up to a day earlier.
  for (const d of deadlineOccurrences(tasks, occs, addDays(today, -1), addDays(today, days + 1))) {
    if (d.done) continue;
    for (const r of deadlineRemindersFor(d.task, d.date, d.occ)) {
      const s = stamp(r);
      if (s >= fromStamp && s < toStamp) out.push(r);
    }
  }
  return out.sort((a, b) => (stamp(a) < stamp(b) ? -1 : 1));
}

/** A snoozed reminder for an occurrence, 5 minutes after `now` (local wall-clock). */
export function snoozeReminder(task: Pick<Task, 'id' | 'title' | 'category'>, occurrenceKey: string, nowDate: string, nowTime: string): Reminder {
  const { date, time } = normalize(nowDate, toMinutes(nowTime) + SNOOZE_MIN);
  return { id: `${occurrenceKey}|snooze|${date}T${time}`, occurrenceKey, taskId: task.id, kind: 'snooze', date, time, ...reminderText(task, 'snooze') };
}

/** Notification kind → the settings key that switches it on/off. */
export const REMINDER_EVENT: Record<ReminderKind, 'remind-before' | 'start' | 'end'> = {
  before: 'remind-before', start: 'start', snooze: 'start', end: 'end',
  // PRD: deadline reminders use the "before" sound; the moment of the deadline the alarm ("Waktu habis").
  'deadline-before': 'remind-before', 'deadline-due': 'end',
};

/** Is this kind of notification switched on? (unset = on) */
export function notifyOn(notify: Partial<Record<string, boolean>> | undefined, event: string): boolean {
  return notify?.[event] !== false;
}
