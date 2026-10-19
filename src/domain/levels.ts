import { toDateStr } from './dates';
import type { CompletionLog, FocusLog } from './types';

/**
 * Points are earned slowly on purpose so levels last for months:
 *  - 5 per completed task, +2 when it was done with the timer
 *  - only the first 12 completions of a day count (no farming with tiny tasks)
 *  - 2 per full 10 minutes of focus
 */
export const POINTS = { task: 5, timedBonus: 2, focusPer10Min: 2, dailyTaskCap: 12 };
export const MAX_LEVEL = 60;

/** Title (with emoji) per band of 5 levels: from beginner to legend. */
export const LEVEL_TITLES = [
  { title: 'Pemula', emoji: '🌱' },
  { title: 'Baru Belajar', emoji: '🌿' },
  { title: 'Mulai Rajin', emoji: '🌷' },
  { title: 'Rajin', emoji: '📚' },
  { title: 'Tekun', emoji: '✏️' },
  { title: 'Disiplin', emoji: '⏰' },
  { title: 'Konsisten', emoji: '🔥' },
  { title: 'Andalan', emoji: '⭐' },
  { title: 'Ahli', emoji: '🎓' },
  { title: 'Master', emoji: '🏆' },
  { title: 'Inspirasi', emoji: '🌈' },
  { title: 'Legenda', emoji: '👑' },
];
const band = (level: number) => LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 5))];

/** Points needed to reach `level`: grows quadratically (Lv 10 ≈ 760, Lv 30 ≈ 7 100, Lv 60 ≈ 28 600). */
export function levelMin(level: number): number {
  const n = level - 1;
  return n <= 0 ? 0 : 8 * n * n + 12 * n;
}

export const titleFor = (level: number) => band(level).title;
export const levelEmoji = (level: number) => band(level).emoji;

export const LEVELS = Array.from({ length: MAX_LEVEL }, (_, i) => ({ level: i + 1, min: levelMin(i + 1), title: titleFor(i + 1) }));

export function totalFocusSec(focus: Pick<FocusLog, 'seconds'>[]): number {
  return focus.reduce((s, f) => s + f.seconds, 0);
}

export function taskPoints(completions: Pick<CompletionLog, 'completedAt' | 'timed'>[]): number {
  const perDay = new Map<string, number>();
  let pts = 0;
  for (const c of [...completions].sort((a, b) => (a.completedAt < b.completedAt ? -1 : 1))) {
    const day = toDateStr(new Date(c.completedAt));
    const n = (perDay.get(day) ?? 0) + 1;
    perDay.set(day, n);
    if (n <= POINTS.dailyTaskCap) pts += POINTS.task + (c.timed ? POINTS.timedBonus : 0);
  }
  return pts;
}

export function points(completions: Pick<CompletionLog, 'completedAt' | 'timed'>[], focus: Pick<FocusLog, 'seconds'>[]): number {
  return taskPoints(completions) + Math.floor(totalFocusSec(focus) / 600) * POINTS.focusPer10Min;
}

export function levelFor(pts: number) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (pts >= l.min) cur = l;
  const next = LEVELS.find((l) => l.min > pts);
  const progress = next ? (pts - cur.min) / (next.min - cur.min) : 1;
  return { ...cur, points: pts, next, progress };
}

export function levelOf(completions: CompletionLog[], focus: FocusLog[]) {
  return levelFor(points(completions, focus));
}
