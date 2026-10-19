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
