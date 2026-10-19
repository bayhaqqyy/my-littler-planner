import { categoryMinutes, daySummary, weekDots, routineDots } from '../stats';
import { greeting } from '../dates';
import { taskFormSchema, usernameSchema } from '../validation';
import { task } from './helpers';

it('greeting by hour', () => {
  expect([10, 11, 14, 15, 18, 19].map(greeting)).toEqual(['Good morning', 'Good afternoon', 'Good afternoon', 'Good evening', 'Good evening', 'Good night']);
});

it('daySummary', () => {
  const occs = { 'a@2026-10-16': { key: 'a@2026-10-16', taskId: 'a', date: '2026-10-16', doneAt: 'x', focusSec: 0, rewarded: true } };
  expect(daySummary([task({ id: 'a' }), task({ id: 'b' })], '2026-10-16', occs)).toEqual({ total: 2, done: 1, pending: 1, pct: 50 });
});

it('weekDots and routineDots', () => {
  const t = task({ repeat: 'weekdays', date: '2026-10-12' });
  const occs = { 't1@2026-10-12': { key: 't1@2026-10-12', taskId: 't1', date: '2026-10-12', doneAt: 'x', focusSec: 0, rewarded: true } };
  expect(weekDots([t], '2026-10-12', '2026-10-16', occs).map((d) => d.status)).toEqual(['done', 'missed', 'missed', 'missed', 'pending', 'empty', 'empty']);
  expect(routineDots(t, '2026-10-12', '2026-10-14', occs).map((d) => d.status)).toEqual(['done', 'missed', 'pending', 'pending', 'pending', 'off', 'off']);
});

it('categoryMinutes uses focus + untimed completions', () => {
  const r = categoryMinutes([{ occurrenceKey: 'k', title: 't', category: 'olahraga', completedAt: new Date().toISOString(), durationMin: 30, timed: false }], [{ date: '2026-10-16', category: 'belajar', seconds: 1800 }]);
  expect(r.find((c) => c.category === 'belajar')).toMatchObject({ minutes: 30, pct: 50 });
  expect(r.find((c) => c.category === 'olahraga')).toMatchObject({ minutes: 30, pct: 50 });
});

describe('validation', () => {
  const ok = { title: 'x', category: 'belajar', priority: 'sedang', date: '2026-10-16', remindBeforeMin: 0, remindAtStart: true, remindAtEnd: true, repeat: 'none', weekdays: [] };
  it('valid', () => expect(taskFormSchema.safeParse(ok).success).toBe(true));
  it('title required, max 80', () => {
    expect(taskFormSchema.safeParse({ ...ok, title: ' ' }).success).toBe(false);
    expect(taskFormSchema.safeParse({ ...ok, title: 'a'.repeat(81) }).success).toBe(false);
  });
  it('end after start', () => expect(taskFormSchema.safeParse({ ...ok, start: '10:00', end: '10:00' }).success).toBe(false));
  it('weekly needs a day', () => expect(taskFormSchema.safeParse({ ...ok, repeat: 'weekly' }).success).toBe(false));
  it('username', () => {
    expect(usernameSchema.safeParse('Azza').success).toBe(true);
    expect(usernameSchema.safeParse('A').success).toBe(false);
    expect(usernameSchema.safeParse('Azza!').success).toBe(false);
    expect(usernameSchema.safeParse('a'.repeat(21)).success).toBe(false);
  });
});
