import { addTime, afterBreak, afterFocus, focusDelta, pause, presetConfig, remainingSec, start, newPhase } from '../pomodoro';
import type { TimerState } from '../types';

const base: TimerState = { occurrenceKey: 'k', mode: 'pomodoro', phase: 'focus', completedSessions: 0, totalSec: 1500, remainingSec: 1500, state: 'idle' };

describe('pomodoro', () => {
  it('presets', () => {
    expect(presetConfig('klasik')).toMatchObject({ focusMin: 25, shortBreakMin: 5, longBreakMin: 15, sessionsBeforeLong: 4, autoStartNext: false });
    expect(presetConfig('santai')).toMatchObject({ focusMin: 15, shortBreakMin: 3, longBreakMin: 15, sessionsBeforeLong: 4 });
    expect(presetConfig('fokus-panjang')).toMatchObject({ focusMin: 50, shortBreakMin: 10, longBreakMin: 30, sessionsBeforeLong: 3 });
  });
  it('custom is clamped', () => {
    expect(presetConfig('custom', { focusMin: 200, shortBreakMin: 0, longBreakMin: 3, sessionsBeforeLong: 10 })).toMatchObject({ focusMin: 90, shortBreakMin: 1, longBreakMin: 5, sessionsBeforeLong: 8 });
  });
  it('long break after N sessions, reset after long break', () => {
    const cfg = presetConfig('klasik');
    expect(afterFocus(2, cfg)).toEqual({ completedSessions: 3, nextBreak: 'short-break' });
    expect(afterFocus(3, cfg)).toEqual({ completedSessions: 4, nextBreak: 'long-break' });
    expect(afterBreak('long-break', 4)).toBe(0);
    expect(afterBreak('short-break', 2)).toBe(2);
  });
  it('remaining derives from endsAt', () => {
    const t = start(base, 0);
    expect(remainingSec(t, 60_000)).toBe(1440);
    expect(remainingSec(t, 10_000_000)).toBe(0);
    const p = pause(t, 100_000);
    expect(p).toMatchObject({ state: 'paused', remainingSec: 1400, endsAt: undefined });
    expect(remainingSec(p, 999_999_999)).toBe(1400);
  });
  it('+5 minutes', () => {
    const t = addTime(start(base, 0), 5, 0);
    expect(remainingSec(t, 0)).toBe(1800);
    expect(t.totalSec).toBe(1800);
  });
  it('only focus counts', () => {
    expect(focusDelta('focus', 100, 40)).toBe(60);
    expect(focusDelta('short-break', 100, 40)).toBe(0);
  });
  it('newPhase', () => {
    expect(newPhase(base, 'short-break', 5, 0, false)).toMatchObject({ phase: 'short-break', totalSec: 300, state: 'idle' });
  });
});
