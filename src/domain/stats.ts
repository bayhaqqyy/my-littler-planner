import { addDays, range, startOfWeek, toDateStr, weekdayOf } from './dates';
import { occKey, occurrencesOn, occursOn } from './occurrences';
import type { Category, CompletionLog, FocusLog, Occurrence, Task } from './types';
import { CATEGORIES } from './types';

export function daySummary(tasks: Task[], date: string, occs: Record<string, Occurrence>) {
  const views = occurrencesOn(tasks, date, occs);
  const done = views.filter((v) => v.done).length;
  const total = views.length;
  return { total, done, pending: total - done, pct: total ? Math.round((done / total) * 100) : 0 };
}

export type DotStatus = 'done' | 'partial' | 'missed' | 'pending' | 'empty' | 'skipped' | 'off';

/** Week dots for all tasks: done when everything that day is done. */
export function weekDots(tasks: Task[], weekStart: string, today: string, occs: Record<string, Occurrence>): { date: string; status: DotStatus }[] {
  return range(weekStart, 7).map((date) => {
    const s = daySummary(tasks, date, occs);
    let status: DotStatus;
    if (!s.total) status = 'empty';
    else if (s.done === s.total) status = 'done';
    else if (date > today) status = 'pending';
    else if (date === today) status = s.done ? 'partial' : 'pending';
    else status = s.done ? 'partial' : 'missed';
    return { date, status };
  });
}

/** Week dots for one repeating task. */
export function routineDots(task: Task, weekStart: string, today: string, occs: Record<string, Occurrence>): { date: string; status: DotStatus }[] {
  return range(weekStart, 7).map((date) => {
    if (!occursOn(task, date)) return { date, status: 'off' as DotStatus };
    const o = occs[occKey(task.id, date)];
    if (o?.skipped) return { date, status: 'skipped' as DotStatus };
    if (o?.doneAt) return { date, status: 'done' as DotStatus };
    return { date, status: (date < today ? 'missed' : 'pending') as DotStatus };
  });
}

/** Completion ratio for Mon..Sun of the current week (only days up to today count). */
export function weeklyCompletion(tasks: Task[], today: string, occs: Record<string, Occurrence>) {
  const ws = startOfWeek(today);
  let done = 0, total = 0;
  for (const d of range(ws, 7)) {
    if (d > today) break;
    const s = daySummary(tasks, d, occs);
    done += s.done; total += s.total;
  }
  return { done, total, ratio: total ? done / total : 0 };
}

export function focusMinutesOn(focus: FocusLog[], date: string): number {
  return Math.round(focus.filter((f) => f.date === date).reduce((s, f) => s + f.seconds, 0) / 60);
}

export function completionsOn(logs: CompletionLog[], date: string): number {
  return logs.filter((l) => toDateStr(new Date(l.completedAt)) === date).length;
}

/** Last 7 days ending today. */
export function last7(logs: CompletionLog[], focus: FocusLog[], today: string) {
  return range(addDays(today, -6), 7).map((date) => ({ date, done: completionsOn(logs, date), focusMin: focusMinutesOn(focus, date) }));
}

/** Last 4 weeks (Mon-based), oldest first. */
export function last4Weeks(logs: CompletionLog[], focus: FocusLog[], today: string) {
  const ws = startOfWeek(today);
  return [-3, -2, -1, 0].map((w) => {
    const start = addDays(ws, w * 7);
    const days = range(start, 7);
    return {
      start,
      done: days.reduce((s, d) => s + completionsOn(logs, d), 0),
      focusMin: days.reduce((s, d) => s + focusMinutesOn(focus, d), 0),
    };
  });
}

/** Categories that count as "Waktu belajar". */
export const STUDY_CATEGORIES: Category[] = ['kuliah', 'belajar', 'tugas'];

/** One log per occurrence (the latest): two devices can each log the same completion. */
export function uniqueCompletions<L extends CompletionLog>(logs: L[]): L[] {
  const by = new Map<string, L>();
  for (const l of logs) { const p = by.get(l.occurrenceKey); if (!p || p.completedAt < l.completedAt) by.set(l.occurrenceKey, l); }
  return [...by.values()];
}

/**
 * Study minutes between two dates (inclusive): timer focus on study categories, plus the planned
 * duration of study tasks completed without the timer (same rule as categoryMinutes).
 */
export function studyMinutes(logs: CompletionLog[], focus: FocusLog[], from: string, to: string): number {
  let min = 0;
  for (const f of focus) if (f.date >= from && f.date <= to && STUDY_CATEGORIES.includes(f.category)) min += f.seconds / 60;
  for (const l of uniqueCompletions(logs)) {
    if (l.timed || !STUDY_CATEGORIES.includes(l.category)) continue;
    const d = toDateStr(new Date(l.completedAt));
    if (d >= from && d <= to) min += l.durationMin;
  }
  return Math.round(min);
}

export interface StudyItem { title: string; category: Category; min: number; timed: boolean }
export interface StudyDay { date: string; timerMin: number; taskMin: number; total: number; items: StudyItem[] }

/** Day-by-day breakdown behind studyMinutes (newest first): timer sessions per category + tasks done without timer. */
export function studyDetail(logs: CompletionLog[], focus: FocusLog[], from: string, to: string): StudyDay[] {
  const days = new Map<string, StudyDay>();
  const day = (d: string) => { let x = days.get(d); if (!x) { x = { date: d, timerMin: 0, taskMin: 0, total: 0, items: [] }; days.set(d, x); } return x; };
  const timer = new Map<string, number>(); // date|category → seconds (summed over devices)
  for (const f of focus) {
    if (f.date < from || f.date > to || !STUDY_CATEGORIES.includes(f.category)) continue;
    const k = `${f.date}|${f.category}`;
    timer.set(k, (timer.get(k) ?? 0) + f.seconds);
  }
  for (const [k, sec] of timer) {
    const [d, c] = k.split('|') as [string, Category];
    const min = Math.round(sec / 60);
    if (!min) continue;
    const x = day(d);
    x.timerMin += min;
    x.items.push({ title: 'Sesi timer', category: c, min, timed: true });
  }
  for (const l of uniqueCompletions(logs)) {
    if (l.timed || !STUDY_CATEGORIES.includes(l.category) || l.durationMin <= 0) continue;
    const d = toDateStr(new Date(l.completedAt));
    if (d < from || d > to) continue;
    const x = day(d);
    x.taskMin += l.durationMin;
    x.items.push({ title: l.title, category: l.category, min: l.durationMin, timed: false });
  }
  for (const x of days.values()) { x.total = x.timerMin + x.taskMin; x.items.sort((a, b) => b.min - a.min); }
  return [...days.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Minutes per category: focus time + planned duration of tasks completed without the timer. */
export function categoryMinutes(logs: CompletionLog[], focus: FocusLog[], fromDate?: string) {
  const mins: Record<Category, number> = { kuliah: 0, belajar: 0, tugas: 0, istirahat: 0, olahraga: 0, pribadi: 0 };
  for (const f of focus) if (!fromDate || f.date >= fromDate) mins[f.category] += f.seconds / 60;
  for (const l of logs) {
    if (l.timed) continue;
    if (fromDate && toDateStr(new Date(l.completedAt)) < fromDate) continue;
    mins[l.category] += l.durationMin;
  }
  const total = CATEGORIES.reduce((s, c) => s + mins[c], 0);
  return CATEGORIES.map((c) => ({ category: c, minutes: Math.round(mins[c]), pct: total ? Math.round((mins[c] / total) * 100) : 0 }));
}

/** Weekday (0=Sun) with the most completions, or undefined when there are none. */
export function mostProductiveWeekday(logs: CompletionLog[]): number | undefined {
  if (!logs.length) return undefined;
  const counts = Array(7).fill(0);
  for (const l of logs) counts[new Date(l.completedAt).getDay()]++;
  return counts.indexOf(Math.max(...counts));
}

/** Weekday of a YYYY-MM-DD string, re-exported for convenience. */
export { weekdayOf };
