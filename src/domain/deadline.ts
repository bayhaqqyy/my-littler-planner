/**
 * Deadline tasks (PRD "Fitur Deadline"): one due date + time, reminders counted back from it,
 * urgency levels and countdown labels. Times are local wall-clock 'YYYY-MM-DDTHH:mm' strings,
 * like the rest of the domain; the server interprets them in the user's time zone.
 */
import { addDays, atTime, fromMinutes, parseDate, toDateStr, toMinutes, weekdayOf } from './dates';
import { occKey, occursOn } from './occurrences';
import type { Occurrence, Task, TaskKind } from './types';

export const DEADLINE_REMINDER_OPTIONS = [1440, 180, 60, 30, 0];
export const DEFAULT_DEADLINE_REMINDERS = [1440, 60, 0];
export const DEFAULT_DUE_TIME = '23:59';
/** Snooze on a deadline notification: 15 minutes, but never past the deadline. */
export const DEADLINE_SNOOZE_MIN = 15;
/** Completing at least this long before the original deadline improves gift odds. */
export const EARLY_BONUS_MIN = 24 * 60;

export const kindOf = (t: Pick<Task, 'kind'>): TaskKind => t.kind ?? 'scheduled';
export const isDeadline = (t: Pick<Task, 'kind'>) => kindOf(t) === 'deadline';

export const REMINDER_OFFSET_LABEL: Record<number, string> = {
  1440: '1 hari sebelum', 180: '3 jam sebelum', 60: '1 jam sebelum', 30: '30 menit sebelum', 0: 'Saat deadline',
};
const OFFSET_SHORT: Record<number, string> = { 1440: '1 hari', 180: '3 jam', 60: '1 jam', 30: '30 menit' };

/* ---------- local wall-clock helpers ---------- */

/** 'YYYY-MM-DDTHH:mm' */
export const wall = (date: string, time: string) => `${date}T${time}`;
export const wallDate = (w: string) => w.slice(0, 10);
export const wallTime = (w: string) => w.slice(11, 16);
/** Local Date of a wall-clock string. */
export const wallToDate = (w: string) => atTime(wallDate(w), wallTime(w));
export function dateToWall(d: Date): string {
  return wall(toDateStr(d), fromMinutes(d.getHours() * 60 + d.getMinutes()));
}
/** Shift a wall-clock string by minutes (calendar arithmetic, no time zone involved). */
export function addMinutesWall(w: string, minutes: number): string {
  const total = toMinutes(wallTime(w)) + minutes;
  const days = Math.floor(total / 1440);
  return wall(addDays(wallDate(w), days), fromMinutes(total - days * 1440));
}

/* ---------- migration of the v1 date-only "deadline" field ---------- */

/**
 * v1 tasks had `deadline` (date only). Without a start time they become deadline tasks at 23:59
 * with the default reminders; with a start time they stay scheduled and keep it as hardStop.
 * Returns the same object when nothing changes.
 */
export function migrateTask(t: Task, reminders = DEFAULT_DEADLINE_REMINDERS): Task {
  if (t.kind && t.deadline === undefined) return t;
  if (t.kind && t.deadline !== undefined) {
    const { deadline: _d, ...rest } = t;
    return rest;
  }
  const { deadline, ...rest } = t;
  if (!deadline) return { ...rest, kind: 'scheduled' };
  if (!t.start) {
    return {
      ...rest, kind: 'deadline', date: deadline, dueTime: DEFAULT_DUE_TIME, deadlineRemindersMin: [...reminders],
      end: undefined, durationMin: undefined, remindBeforeMin: 0, remindAtStart: false, remindAtEnd: false,
    };
  }
  return { ...rest, kind: 'scheduled', hardStop: wall(deadline, DEFAULT_DUE_TIME) };
}

/* ---------- due time of an occurrence ---------- */

/** Deadline of an occurrence: its own dueAt when rescheduled, else the task's date + dueTime. */
export function dueAtOf(task: Pick<Task, 'dueTime'>, date: string, occ?: Pick<Occurrence, 'dueAt'>): string {
  return occ?.dueAt ?? wall(date, task.dueTime ?? DEFAULT_DUE_TIME);
}

/** The deadline the occurrence was created with (ignores rescheduling) — used for the early bonus. */
export const originalDueAt = (task: Pick<Task, 'dueTime'>, date: string) => wall(date, task.dueTime ?? DEFAULT_DUE_TIME);

export interface DeadlineView {
  key: string;
  task: Task;
  /** Occurrence date (part of the key). */
  date: string;
  occ?: Occurrence;
  dueAt: string;
  done: boolean;
  skipped: boolean;
}

/**
 * Deadline occurrences whose due date lies in [from, to] (inclusive). Includes occurrences that
 * were rescheduled into the range and leaves out ones rescheduled away from it.
 */
export function deadlineOccurrences(tasks: Task[], occs: Record<string, Occurrence>, from: string, to: string, lookback = 60): DeadlineView[] {
  const out = new Map<string, DeadlineView>();
  const byId = new Map(tasks.filter((t) => isDeadline(t) && !t.deletedAt).map((t) => [t.id, t]));
  const add = (task: Task, date: string) => {
    const key = occKey(task.id, date);
    const occ = occs[key];
    const dueAt = dueAtOf(task, date, occ);
    const d = wallDate(dueAt);
    if (d < from || d > to || out.has(key)) return;
    out.set(key, { key, task, date, occ, dueAt, done: !!occ?.doneAt, skipped: !!occ?.skipped });
  };
  for (const task of byId.values()) {
    // Generate by occurrence date; a little before `from` catches ones moved later into the range.
    for (let d = addDays(from, -lookback); d <= to; d = addDays(d, 1)) if (occursOn(task, d)) add(task, d);
  }
  for (const o of Object.values(occs)) {
    if (!o.dueAt) continue;
    const task = byId.get(o.taskId);
    if (task) add(task, o.date);
  }
  return [...out.values()].filter((v) => !v.skipped).sort((a, b) => (a.dueAt < b.dueAt ? -1 : a.dueAt > b.dueAt ? 1 : a.task.title.localeCompare(b.task.title)));
}

/* ---------- urgency + countdown ---------- */

export type Urgency = 'aman' | 'dekat' | 'mendesak' | 'terlewat' | 'selesai';

export const URGENCY_LABEL: Record<Urgency, string> = { aman: 'Aman', dekat: 'Dekat', mendesak: 'Mendesak', terlewat: 'Terlewat', selesai: 'Selesai' };

/** > 48 h aman · 6–48 h dekat · < 6 h mendesak · past and not done terlewat. */
export function urgencyOf(dueMs: number, nowMs: number, done = false): Urgency {
  if (done) return 'selesai';
  const left = dueMs - nowMs;
  if (left < 0) return 'terlewat';
  if (left < 6 * 3600_000) return 'mendesak';
  if (left <= 48 * 3600_000) return 'dekat';
  return 'aman';
}

/** Countdown label, e.g. { top: 'Sisa', bottom: '2 jam 15 mnt' } — `text` joins both. */
export function countdown(dueMs: number, nowMs: number): { top: string; bottom: string; text: string } {
  const diff = dueMs - nowMs;
  const mk = (top: string, bottom: string) => ({ top, bottom, text: `${top} ${bottom}` });
  if (diff >= 0) {
    const min = Math.floor(diff / 60_000);
    if (min >= 48 * 60) return mk('Sisa', `${Math.floor(min / 1440)} hari`);
    if (min >= 24 * 60) return mk('Sisa', '1 hari');
    if (min >= 60) return mk('Sisa', `${Math.floor(min / 60)} jam ${min % 60} mnt`);
    return mk('Sisa', `${Math.max(min, diff > 0 ? 1 : 0)} mnt`);
  }
  const late = Math.floor(-diff / 60_000);
  if (late >= 24 * 60) return mk('Terlewat', `${Math.floor(late / 1440)} hari`);
  if (late >= 60) return mk('Terlewat', `${Math.floor(late / 60)} jam`);
  return mk('Terlewat', `${Math.max(1, late)} mnt`);
}

/** Hours/minutes/seconds left for the big Home countdown (zero when past). */
export function hms(dueMs: number, nowMs: number) {
  const s = Math.max(0, Math.floor((dueMs - nowMs) / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor(s / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "Hari ini, 23.59" · "Besok, 12.00" · "Kemarin, 09.00" · "Jum, 23 Okt, 23.59". */
export function dueLabel(dueAt: string, today: string): string {
  const d = wallDate(dueAt);
  const time = wallTime(dueAt).replace(':', '.');
  if (d === today) return `Hari ini, ${time}`;
  if (d === addDays(today, 1)) return `Besok, ${time}`;
  if (d === addDays(today, -1)) return `Kemarin, ${time}`;
  const pd = parseDate(d);
  return `${DAY_SHORT[weekdayOf(d)]}, ${pd.getDate()} ${MONTH_SHORT[pd.getMonth()]}, ${time}`;
}

function spanText(min: number): string {
  if (min >= 1440) return `${Math.floor(min / 1440)} hari`;
  if (min >= 60) return `${Math.floor(min / 60)} jam`;
  return `${Math.max(1, min)} menit`;
}

/** "Selesai 5 jam sebelum deadline" or "Selesai terlambat 2 jam". */
export function completionText(doneAt: string, dueMs: number): string {
  const diff = Math.round((dueMs - Date.parse(doneAt)) / 60_000);
  return diff >= 0 ? `Selesai ${spanText(diff)} sebelum deadline` : `Selesai terlambat ${spanText(-diff)}`;
}

/* ---------- grouping for the Deadline tab ---------- */

export type DeadlineGroup = 'terlewat' | 'hari-ini' | 'minggu-ini' | 'nanti' | 'selesai';
export const DEADLINE_GROUP_LABEL: Record<DeadlineGroup, string> = {
  terlewat: 'Terlewat', 'hari-ini': 'Hari ini', 'minggu-ini': 'Minggu ini', nanti: 'Nanti', selesai: 'Selesai',
};

/** Terlewat · Hari ini · Minggu ini (next 7 days) · Nanti · Selesai (done in the last 7 days). */
export function deadlineGroup(v: DeadlineView, now: Date): DeadlineGroup | undefined {
  const today = toDateStr(now);
  if (v.done) {
    return v.occ?.doneAt && Date.parse(v.occ.doneAt) >= now.getTime() - 7 * 86400_000 ? 'selesai' : undefined;
  }
  if (wallToDate(v.dueAt).getTime() < now.getTime()) return 'terlewat';
  const d = wallDate(v.dueAt);
  if (d === today) return 'hari-ini';
  if (d <= addDays(today, 7)) return 'minggu-ini';
  return 'nanti';
}

/** Unfinished deadline occurrences whose time has passed (looked back `days`). */
export function overdueDeadlines(tasks: Task[], occs: Record<string, Occurrence>, now: Date, days = 60): DeadlineView[] {
  const today = toDateStr(now);
  return deadlineOccurrences(tasks, occs, addDays(today, -days), today)
    .filter((v) => !v.done && wallToDate(v.dueAt).getTime() < now.getTime());
}

/** When each chosen reminder will fire, skipping ones already in the past. */
export function deadlineReminderTimes(dueAt: string, offsets: number[], now?: Date): { offset: number; at: string }[] {
  return [...new Set(offsets)].sort((a, b) => b - a)
    .map((offset) => ({ offset, at: addMinutesWall(dueAt, -offset) }))
    .filter((r) => !now || wallToDate(r.at).getTime() >= now.getTime() - 60_000);
}

export function deadlineReminderText(title: string, offset: number, dueAt: string) {
  const time = wallTime(dueAt).replace(':', '.');
  if (offset === 0) return { title: `Waktunya habis: ${title}`, body: `Deadline pukul ${time} sudah tiba. Sudah selesai?` };
  return { title: `${OFFSET_SHORT[offset] ?? `${offset} menit`} lagi: ${title}`, body: `Deadline pukul ${time}. Yuk selesaikan sekarang, kamu pasti bisa!` };
}

/** Is completing now early enough for the bonus? Measured against the original deadline. */
export function earlyBonus(task: Pick<Task, 'dueTime'>, date: string, doneAt: Date): boolean {
  return wallToDate(originalDueAt(task, date)).getTime() - doneAt.getTime() >= EARLY_BONUS_MIN * 60_000;
}

/** Snooze target for a deadline notification: +15 min, capped at the deadline. */
export function deadlineSnoozeAt(nowWall: string, dueAt: string): string {
  const s = addMinutesWall(nowWall, DEADLINE_SNOOZE_MIN);
  return s < dueAt ? s : dueAt;
}

/**
 * Time span to show an occurrence in an external calendar: scheduled = start → end;
 * deadline = the 15 minutes ending at the deadline. Untimed scheduled tasks have none.
 */
export function calendarSpan(task: Task, date: string, occ?: Pick<Occurrence, 'dueAt'>): { start: string; end: string; deadline: boolean } | undefined {
  if (isDeadline(task)) {
    const due = dueAtOf(task, date, occ);
    return { start: addMinutesWall(due, -15), end: due, deadline: true };
  }
  if (!task.start) return undefined;
  const startMin = toMinutes(task.start);
  const len = task.end && toMinutes(task.end) > startMin ? toMinutes(task.end) - startMin : task.durationMin && task.durationMin > 0 ? task.durationMin : 25;
  const start = wall(date, task.start);
  return { start, end: addMinutesWall(start, len), deadline: false };
}

/** Description line about the due time / hard stop for calendar events and details. */
export function deadlineNote(task: Task, date: string, occ?: Pick<Occurrence, 'dueAt'>): string {
  if (isDeadline(task)) return `🚩 Deadline: ${wallDate(dueAtOf(task, date, occ))} ${wallTime(dueAtOf(task, date, occ)).replace(':', '.')}`;
  if (task.hardStop) return `Batas akhir: ${wallDate(task.hardStop)} ${wallTime(task.hardStop).replace(':', '.')}`;
  return '';
}
