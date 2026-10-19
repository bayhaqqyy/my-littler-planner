import { addDays, toMinutes, weekdayOf } from './dates';
import type { Occurrence, Priority, Task } from './types';
import { deadlineOccurrences, isDeadline, wallTime } from './deadline';

export const occKey = (taskId: string, date: string) => `${taskId}@${date}`;

export function splitOccKey(key: string): { taskId: string; date: string } {
  const i = key.lastIndexOf('@');
  return { taskId: key.slice(0, i), date: key.slice(i + 1) };
}

/** Does the task template produce an occurrence on `date` (ignores skip/done)? */
export function occursOn(task: Task, date: string): boolean {
  if (task.deletedAt) return false;
  if (task.repeat === 'none') return task.date === date;
  if (date < task.date) return false;
  const wd = weekdayOf(date);
  switch (task.repeat) {
    case 'daily': return true;
    case 'weekdays': return wd >= 1 && wd <= 5;
    case 'weekly': return task.weekdays.includes(wd);
  }
}

/** Duration in minutes: end - start; else manual duration; else 25. */
export function durationOf(task: Pick<Task, 'start' | 'end' | 'durationMin'>): number {
  if (task.start && task.end) {
    const d = toMinutes(task.end) - toMinutes(task.start);
    if (d > 0) return d;
  }
  if (task.durationMin && task.durationMin > 0) return task.durationMin;
  return 25;
}

/** End time of a task: explicit end, or start + duration. */
export function endOf(task: Pick<Task, 'start' | 'end' | 'durationMin'>): number | undefined {
  if (!task.start) return undefined;
  if (task.end && toMinutes(task.end) > toMinutes(task.start)) return toMinutes(task.end);
  return toMinutes(task.start) + durationOf(task);
}

export interface OccView {
  key: string;
  task: Task;
  date: string;
  occ?: Occurrence;
  done: boolean;
  skipped: boolean;
  /** Deadline tasks: this occurrence's due 'YYYY-MM-DDTHH:mm'. */
  dueAt?: string;
}

export function viewOf(task: Task, date: string, occs: Record<string, Occurrence>): OccView {
  const key = occKey(task.id, date);
  const occ = occs[key];
  return { key, task, date, occ, done: !!occ?.doneAt, skipped: !!occ?.skipped };
}

const PRIO_RANK: Record<Priority, number> = { tinggi: 0, sedang: 1, rendah: 2 };

/** Start time, then priority (high first); untimed at the end; done at the bottom. */
export function compareOcc(a: OccView, b: OccView): number {
  if (a.done !== b.done) return a.done ? 1 : -1;
  // Scheduled tasks sort by start time, deadline tasks by their due time.
  const timeOf = (v: OccView) => (v.dueAt ? toMinutes(wallTime(v.dueAt)) : v.task.start ? toMinutes(v.task.start) : Infinity);
  const sa = timeOf(a);
  const sb = timeOf(b);
  if (sa !== sb) return sa - sb;
  const p = PRIO_RANK[a.task.priority] - PRIO_RANK[b.task.priority];
  if (p !== 0) return p;
  return a.task.title.localeCompare(b.task.title);
}

/** Visible (not skipped) occurrences on a date, sorted. */
export function occurrencesOn(tasks: Task[], date: string, occs: Record<string, Occurrence>): OccView[] {
  const scheduled = tasks
    .filter((t) => !isDeadline(t) && occursOn(t, date))
    .map((t) => viewOf(t, date, occs))
    .filter((v) => !v.skipped);
  // Deadline tasks count on the day they are due (which moves when an occurrence is rescheduled).
  const deadlines: OccView[] = deadlineOccurrences(tasks, occs, date, date, 7)
    .map((d) => ({ key: d.key, task: d.task, date: d.date, occ: d.occ, done: d.done, skipped: d.skipped, dueAt: d.dueAt }));
  return [...scheduled, ...deadlines].sort(compareOcc);
}

export function occurrencesInRange(tasks: Task[], from: string, days: number, occs: Record<string, Occurrence>): OccView[] {
  const out: OccView[] = [];
  for (let i = 0; i < days; i++) out.push(...occurrencesOn(tasks, addDays(from, i), occs));
  return out;
}

/** Overdue = non-repeating task dated before today, not done and not skipped. */
export function overdue(tasks: Task[], today: string, occs: Record<string, Occurrence>): OccView[] {
  // Deadline tasks have their own overdue rule (time-based): see overdueDeadlines().
  return tasks
    .filter((t) => !t.deletedAt && !isDeadline(t) && t.repeat === 'none' && t.date < today)
    .map((t) => viewOf(t, t.date, occs))
    .filter((v) => !v.done && !v.skipped)
    .sort((a, b) => (a.date === b.date ? compareOcc(a, b) : a.date < b.date ? -1 : 1));
}

export function matchesSearch(task: Task, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return task.title.toLowerCase().includes(s) || (task.description ?? '').toLowerCase().includes(s);
}

/**
 * Reschedule an occurrence. For a repeating task: skip the occurrence and return a
 * new one-off task on the target date. For a one-off: move the task itself.
 */
export function reschedule(
  task: Task,
  fromDate: string,
  toDate: string,
  newId: string,
  nowIso: string,
  times?: { start?: string; end?: string },
): { updated?: Task; created?: Task; skipKey?: string } {
  // Explicit `times` (even empty) override the task's times; omitted keeps them.
  const start = times ? times.start || undefined : task.start;
  const end = times ? (times.start ? times.end || undefined : undefined) : task.end;
  if (task.repeat === 'none') {
    return { updated: { ...task, date: toDate, start, end, updatedAt: nowIso } };
  }
  const created: Task = {
    ...task,
    id: newId,
    date: toDate,
    start,
    end,
    repeat: 'none',
    weekdays: [],
    subtasks: task.subtasks.map((s) => ({ ...s, done: false })),
    createdAt: nowIso,
    updatedAt: nowIso,
    deletedAt: undefined,
  };
  return { created, skipKey: occKey(task.id, fromDate) };
}
