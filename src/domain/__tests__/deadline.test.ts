import {
  calendarSpan, completionText, countdown, deadlineGroup, deadlineOccurrences, deadlineReminderTimes, deadlineSnoozeAt,
  dueAtOf, dueLabel, earlyBonus, migrateTask, overdueDeadlines, urgencyOf, wallToDate,
} from '../deadline';
import { deadlineRemindersFor, pendingReminders } from '../reminders';
import { occurrencesOn, overdue } from '../occurrences';
import { findConflicts } from '../conflicts';
import { rollRarity } from '../rewards';
import { taskFormSchema } from '../validation';
import { task } from './helpers';

const H = 3600_000;
const dl = (p = {}) => task({ id: 'd', kind: 'deadline', title: 'Kumpulkan laporan praktikum', date: '2026-10-19', dueTime: '23:59', deadlineRemindersMin: [1440, 60, 0], remindAtStart: false, remindAtEnd: false, ...p });
const at = (s: string) => new Date(s); // local time strings like '2026-10-18T20:00'

describe('urgency (PRD: > 48 h aman, 6–48 h dekat, < 6 h mendesak, past terlewat)', () => {
  const now = 0;
  it('changes exactly at the boundaries', () => {
    expect(urgencyOf(48 * H + 1, now)).toBe('aman');
    expect(urgencyOf(48 * H, now)).toBe('dekat');
    expect(urgencyOf(6 * H, now)).toBe('dekat');
    expect(urgencyOf(6 * H - 1, now)).toBe('mendesak');
    expect(urgencyOf(0, now)).toBe('mendesak');
    expect(urgencyOf(-1, now)).toBe('terlewat');
    expect(urgencyOf(-1, now, true)).toBe('selesai');
  });
});

describe('countdown format', () => {
  const now = 0;
  it.each([
    [3 * 24 * H, 'Sisa 3 hari'],
    [2 * 24 * H, 'Sisa 2 hari'],
    [30 * H, 'Sisa 1 hari'],
    [2 * H + 15 * 60_000, 'Sisa 2 jam 15 mnt'],
    [45 * 60_000, 'Sisa 45 mnt'],
    [20_000, 'Sisa 1 mnt'],
    [-2 * H, 'Terlewat 2 jam'],
    [-30 * 60_000, 'Terlewat 30 mnt'],
    [-50 * H, 'Terlewat 2 hari'],
  ])('%d ms → %s', (ms, text) => expect(countdown(now + (ms as number), now).text).toBe(text));
  it('two lines for the badge', () => expect(countdown(2 * H + 15 * 60_000, 0)).toMatchObject({ top: 'Sisa', bottom: '2 jam 15 mnt' }));
});

describe('labels', () => {
  it('relative when near, full otherwise', () => {
    expect(dueLabel('2026-10-19T23:59', '2026-10-19')).toBe('Hari ini, 23.59');
    expect(dueLabel('2026-10-20T12:00', '2026-10-19')).toBe('Besok, 12.00');
    expect(dueLabel('2026-10-23T23:59', '2026-10-19')).toBe('Jum, 23 Okt, 23.59');
  });
  it('completion text', () => {
    const due = wallToDate('2026-10-19T23:59').getTime();
    expect(completionText(new Date(due - 5 * H).toISOString(), due)).toBe('Selesai 5 jam sebelum deadline');
    expect(completionText(new Date(due + 2 * H).toISOString(), due)).toBe('Selesai terlambat 2 jam');
  });
});

describe('reminders (PRD test 1 & 2)', () => {
  it('Monday 23.59 with default reminders, made Sunday 20.00 → Sun 23.59, Mon 22.59, Mon 23.59', () => {
    const r = deadlineRemindersFor(dl(), '2026-10-19', undefined, at('2026-10-18T20:00'));
    expect(r.map((x) => [x.date, x.time, x.kind])).toEqual([
      ['2026-10-18', '23:59', 'deadline-before'], ['2026-10-19', '22:59', 'deadline-before'], ['2026-10-19', '23:59', 'deadline-due'],
    ]);
    expect(r[1].title).toBe('1 jam lagi: Kumpulkan laporan praktikum');
    expect(r[1].body).toContain('Deadline pukul 23.59');
    expect(r[2].title).toBe('Waktunya habis: Kumpulkan laporan praktikum');
    expect(r[0].id).toBe('d@2026-10-19|dl1440');
  });
  it('reminders already in the past are not scheduled', () => {
    const times = deadlineReminderTimes('2026-10-19T12:30', [1440, 60, 0], at('2026-10-19T12:00'));
    expect(times.map((t) => t.offset)).toEqual([0]);
  });
  it('pendingReminders includes deadline reminders and skips done ones', () => {
    const due = pendingReminders([dl()], {}, '2026-10-19', 1, '2026-10-19 22:00', '2026-10-20 00:30');
    expect(due.map((r) => r.kind)).toEqual(['deadline-before', 'deadline-due']);
    const done = { 'd@2026-10-19': { key: 'd@2026-10-19', taskId: 'd', date: '2026-10-19', doneAt: 'x', focusSec: 0, rewarded: true } };
    expect(pendingReminders([dl()], done, '2026-10-19', 1, '2026-10-19 22:00', '2026-10-20 00:30')).toHaveLength(0);
  });
  it('snooze is 15 minutes but never past the deadline', () => {
    expect(deadlineSnoozeAt('2026-10-19T20:00', '2026-10-19T23:59')).toBe('2026-10-19T20:15');
    expect(deadlineSnoozeAt('2026-10-19T23:50', '2026-10-19T23:59')).toBe('2026-10-19T23:59');
  });
});

describe('occurrences, overdue, reschedule', () => {
  it('counts on the due date and sorts with scheduled tasks by time', () => {
    const lecture = task({ id: 'c', title: 'Kuliah', start: '08:00', end: '09:40', date: '2026-10-19' });
    const v = occurrencesOn([dl({ dueTime: '12:00' }), lecture], '2026-10-19', {});
    expect(v.map((x) => x.task.id)).toEqual(['c', 'd']);
    expect(v[1].dueAt).toBe('2026-10-19T12:00');
  });
  it('rescheduling one occurrence of a weekly quiz moves only that one (PRD test 6)', () => {
    const quiz = dl({ id: 'q', repeat: 'weekly', weekdays: [5], date: '2026-10-23', dueTime: '09:00' });
    const occs = { 'q@2026-10-23': { key: 'q@2026-10-23', taskId: 'q', date: '2026-10-23', focusSec: 0, rewarded: false, dueAt: '2026-10-25T21:00' } };
    expect(occurrencesOn([quiz], '2026-10-23', occs)).toHaveLength(0);
    expect(occurrencesOn([quiz], '2026-10-25', occs).map((v) => v.dueAt)).toEqual(['2026-10-25T21:00']);
    expect(occurrencesOn([quiz], '2026-10-30', occs).map((v) => v.dueAt)).toEqual(['2026-10-30T09:00']);
  });
  it('overdue = not done and past the deadline (PRD test 4)', () => {
    const now = at('2026-10-20T02:00');
    expect(overdueDeadlines([dl()], {}, now).map((v) => v.key)).toEqual(['d@2026-10-19']);
    expect(countdown(wallToDate('2026-10-19T23:59').getTime(), now.getTime()).text).toBe('Terlewat 2 jam');
    // scheduled-overdue list does not double count deadline tasks
    expect(overdue([dl()], '2026-10-20', {})).toHaveLength(0);
  });
  it('groups for the Deadline tab', () => {
    const now = at('2026-10-19T21:00');
    const views = deadlineOccurrences([dl(), dl({ id: 'e', date: '2026-10-23' }), dl({ id: 'f', date: '2026-11-10' }), dl({ id: 'g', date: '2026-10-19', dueTime: '09:00' })], {}, '2026-10-01', '2026-11-30');
    const g = Object.fromEntries(views.map((v) => [v.task.id, deadlineGroup(v, now)]));
    expect(g).toEqual({ d: 'hari-ini', e: 'minggu-ini', f: 'nanti', g: 'terlewat' });
  });
  it('deadline tasks never count as a schedule conflict (PRD test 8)', () => {
    const r = findConflicts({ start: '23:00', end: '23:59' }, '2026-10-19', [dl()]);
    expect(r.overlap).toHaveLength(0);
  });
  it('dueAt falls back to date + dueTime', () => expect(dueAtOf(dl(), '2026-10-19')).toBe('2026-10-19T23:59'));
});

describe('early bonus (PRD odds table)', () => {
  const seq = (v: number) => () => v;
  it('≥ 24 h before the original deadline', () => {
    expect(earlyBonus(dl(), '2026-10-19', at('2026-10-18T23:00'))).toBe(true);
    expect(earlyBonus(dl(), '2026-10-19', at('2026-10-19T01:00'))).toBe(false);
  });
  it('odds: normal 82/15/3 · one of (high, early) 72/22/6 · both 64/28/8', () => {
    expect(rollRarity(dl(), seq(0.81))).toBe('biasa');
    expect(rollRarity(dl(), seq(0.73), true)).toBe('langka');
    expect(rollRarity(dl({ priority: 'tinggi' }), seq(0.65), true)).toBe('langka');
    expect(rollRarity(dl({ priority: 'tinggi' }), seq(0.93), true)).toBe('super');
    expect(rollRarity(dl({ priority: 'tinggi' }), seq(0.93))).toBe('langka');
  });
  it('scheduled tasks never get the early bonus', () => {
    expect(rollRarity(task({ start: '08:00', end: '08:30' }), seq(0.73), true)).toBe('biasa');
  });
});

describe('migration of the old date-only deadline (PRD test 9)', () => {
  it('no start time → deadline task at 23.59 with default reminders', () => {
    const m = migrateTask(task({ deadline: '2026-10-25', date: '2026-10-19' }));
    expect(m).toMatchObject({ kind: 'deadline', date: '2026-10-25', dueTime: '23:59', deadlineRemindersMin: [1440, 60, 0] });
    expect('deadline' in m).toBe(false);
  });
  it('with a start time → stays scheduled with a hard stop', () => {
    const m = migrateTask(task({ deadline: '2026-10-25', start: '08:00' }));
    expect(m).toMatchObject({ kind: 'scheduled', hardStop: '2026-10-25T23:59', start: '08:00' });
  });
  it('plain tasks just get kind scheduled; migrated ones are untouched', () => {
    expect(migrateTask(task()).kind).toBe('scheduled');
    const d = dl();
    expect(migrateTask(d)).toBe(d);
  });
});

it('calendar span: 15 minutes ending at the deadline', () => {
  expect(calendarSpan(dl(), '2026-10-19')).toEqual({ start: '2026-10-19T23:44', end: '2026-10-19T23:59', deadline: true });
});

it('form validation: deadline needs a due time, ignores start/end', () => {
  const base = { title: 'x', category: 'tugas', priority: 'sedang', date: '2026-10-19', remindBeforeMin: 0, remindAtStart: false, remindAtEnd: false, repeat: 'none', weekdays: [] };
  expect(taskFormSchema.safeParse({ ...base, kind: 'deadline', dueTime: '23:59', start: '10:00', end: '09:00' }).success).toBe(true);
  expect(taskFormSchema.safeParse({ ...base, kind: 'deadline' }).success).toBe(false);
});
