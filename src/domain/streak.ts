import { addDays, toDateStr } from './dates';
import type { CompletionLog } from './types';

export const STREAK_MILESTONES = [3, 7, 14, 30];

/** Set of local dates on which at least one task was completed (by completion time). */
export function activeDays(logs: Pick<CompletionLog, 'completedAt'>[]): Set<string> {
  return new Set(logs.map((l) => toDateStr(new Date(l.completedAt))));
}

/** Current streak counted back from today; if nothing done today yet, start from yesterday. */
export function currentStreak(logs: Pick<CompletionLog, 'completedAt'>[], today: string): number {
  const days = activeDays(logs);
  let d = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

export function longestStreak(logs: Pick<CompletionLog, 'completedAt'>[]): number {
  const days = [...activeDays(logs)].sort();
  let best = 0, run = 0, prev = '';
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/** Milestones reached by `streak` that have not been claimed yet. */
export function newMilestones(streak: number, claimed: number[]): number[] {
  return STREAK_MILESTONES.filter((m) => streak >= m && !claimed.includes(m));
}
