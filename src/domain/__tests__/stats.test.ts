import { categoryMinutes, daySummary, studyDetail, studyMinutes, uniqueCompletions, weekDots, routineDots } from '../stats';
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

it('studyMinutes: timer focus + study tasks done without timer, no duplicates', () => {
  const at = (d: string) => new Date(`${d}T15:00:00`).toISOString();
  const l = (k: string, category: any, durationMin: number, timed: boolean, d: string) => ({ occurrenceKey: k, title: k, category, durationMin, timed, completedAt: at(d) });
  const logs = [
    l('a@1', 'belajar', 53, true, '2026-10-19'),   // timed: counted through focus instead
    l('a@1', 'belajar', 53, true, '2026-10-19'),   // same occurrence logged twice
    l('b@1', 'belajar', 81, false, '2026-10-19'),
    l('b@1', 'belajar', 81, false, '2026-10-19'),  // duplicate from a second device
    l('c@1', 'tugas', 60, false, '2026-10-20'),
    l('d@1', 'istirahat', 30, false, '2026-10-20'), // not study
    l('e@1', 'kuliah', 100, false, '2026-10-10'),   // out of range
  ];
  const focus = [
    { date: '2026-10-19', category: 'belajar' as const, seconds: 2400 },
    { date: '2026-10-19', category: 'belajar' as const, seconds: 780 }, // another device's log
    { date: '2026-10-19', category: 'istirahat' as const, seconds: 600 },
  ];
  expect(uniqueCompletions(logs)).toHaveLength(5);
  expect(studyMinutes(logs, focus, '2026-10-18', '2026-10-24')).toBe(53 + 81 + 60);
});

it('studyDetail matches studyMinutes and groups per day', () => {
  const at = (d: string) => new Date(`${d}T15:00:00`).toISOString();
  const logs = [
    { occurrenceKey: 'b@1', title: 'Belajar A', category: 'belajar' as const, durationMin: 81, timed: false, completedAt: at('2026-10-19') },
    { occurrenceKey: 'c@1', title: 'Tugas B', category: 'tugas' as const, durationMin: 60, timed: false, completedAt: at('2026-10-20') },
  ];
  const focus = [
    { date: '2026-10-19', category: 'belajar' as const, seconds: 2400 },
    { date: '2026-10-19', category: 'belajar' as const, seconds: 780 },
  ];
  const d = studyDetail(logs, focus, '2026-10-18', '2026-10-24');
  expect(d.map((x) => [x.date, x.timerMin, x.taskMin])).toEqual([['2026-10-20', 0, 60], ['2026-10-19', 53, 81]]);
  expect(d.reduce((s, x) => s + x.total, 0)).toBe(studyMinutes(logs, focus, '2026-10-18', '2026-10-24'));
});
