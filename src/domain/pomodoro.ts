import type { PomodoroConfig, PomodoroPreset, TimerPhase, TimerState } from './types';

export const PRESETS: Record<Exclude<PomodoroPreset, 'custom'>, Omit<PomodoroConfig, 'autoStartNext'>> = {
  klasik: { preset: 'klasik', focusMin: 25, shortBreakMin: 5, longBreakMin: 15, sessionsBeforeLong: 4 },
  santai: { preset: 'santai', focusMin: 15, shortBreakMin: 3, longBreakMin: 15, sessionsBeforeLong: 4 },
  'fokus-panjang': { preset: 'fokus-panjang', focusMin: 50, shortBreakMin: 10, longBreakMin: 30, sessionsBeforeLong: 3 },
};

export const PRESET_LABEL: Record<PomodoroPreset, string> = {
  klasik: 'Klasik 25/5', santai: 'Santai 15/3', 'fokus-panjang': 'Fokus panjang 50/10', custom: 'Custom',
};

export const LIMITS = {
  focusMin: [5, 90], shortBreakMin: [1, 30], longBreakMin: [5, 60], sessionsBeforeLong: [2, 8],
} as const;

export const DEFAULT_POMODORO: PomodoroConfig = { ...PRESETS.klasik, autoStartNext: false };

const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, Math.round(Number.isFinite(v) ? v : lo)));

export function presetConfig(preset: PomodoroPreset, custom?: Partial<PomodoroConfig>, autoStartNext = false): PomodoroConfig {
  if (preset !== 'custom') return { ...PRESETS[preset], autoStartNext };
  const base = { ...DEFAULT_POMODORO, ...custom };
  return {
    preset: 'custom',
    focusMin: clamp(base.focusMin, LIMITS.focusMin),
    shortBreakMin: clamp(base.shortBreakMin, LIMITS.shortBreakMin),
    longBreakMin: clamp(base.longBreakMin, LIMITS.longBreakMin),
    sessionsBeforeLong: clamp(base.sessionsBeforeLong, LIMITS.sessionsBeforeLong),
    autoStartNext,
  };
}

export function phaseMinutes(cfg: PomodoroConfig, phase: TimerPhase): number {
  return phase === 'focus' ? cfg.focusMin : phase === 'short-break' ? cfg.shortBreakMin : cfg.longBreakMin;
}

/** After a focus phase ends: count the session and pick the break kind. */
export function afterFocus(completedSessions: number, cfg: PomodoroConfig): { completedSessions: number; nextBreak: TimerPhase } {
  const n = completedSessions + 1;
  return { completedSessions: n, nextBreak: n >= cfg.sessionsBeforeLong ? 'long-break' : 'short-break' };
}

/** After a break ends: long break resets the session count. */
export function afterBreak(phase: TimerPhase, completedSessions: number): number {
  return phase === 'long-break' ? 0 : completedSessions;
}

/** Remaining seconds derived from `endsAt` (never from an in-memory tick counter). */
export function remainingSec(t: Pick<TimerState, 'state' | 'endsAt' | 'remainingSec'>, nowMs: number): number {
  if (t.state === 'running' && t.endsAt) return Math.max(0, Math.ceil((Date.parse(t.endsAt) - nowMs) / 1000));
  return t.remainingSec;
}

export function newPhase(t: TimerState, phase: TimerPhase, minutes: number, nowMs: number, run: boolean): TimerState {
  const totalSec = Math.round(minutes * 60);
  return {
    ...t,
    phase,
    totalSec,
    remainingSec: totalSec,
    state: run ? 'running' : 'idle',
    endsAt: run ? new Date(nowMs + totalSec * 1000).toISOString() : undefined,
  };
}

export function start(t: TimerState, nowMs: number): TimerState {
  if (t.state === 'running') return t;
  return { ...t, state: 'running', endsAt: new Date(nowMs + t.remainingSec * 1000).toISOString() };
}

export function pause(t: TimerState, nowMs: number): TimerState {
  if (t.state !== 'running') return t;
  return { ...t, state: 'paused', remainingSec: remainingSec(t, nowMs), endsAt: undefined };
}

export function addTime(t: TimerState, minutes: number, nowMs: number): TimerState {
  const add = minutes * 60;
  const rem = remainingSec(t, nowMs) + add;
  const base = { ...t, totalSec: t.totalSec + add, remainingSec: rem };
  if (t.state === 'running' || t.state === 'finished') return { ...base, state: 'running', endsAt: new Date(nowMs + rem * 1000).toISOString() };
  return base;
}

export function reset(t: TimerState): TimerState {
  return { ...t, state: 'idle', remainingSec: t.totalSec, endsAt: undefined };
}

/** Seconds of focus elapsed between two remaining values; breaks never count. */
export function focusDelta(phase: TimerPhase, prevRemaining: number, nextRemaining: number): number {
  return phase === 'focus' ? Math.max(0, prevRemaining - nextRemaining) : 0;
}
