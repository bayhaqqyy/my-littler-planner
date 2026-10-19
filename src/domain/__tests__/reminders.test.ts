import { notifyOn, pendingReminders, REMINDER_EVENT, remindersFor, snoozeReminder } from '../reminders';
import { task } from './helpers';

describe('reminders', () => {
  const t = task({ start: '18:00', end: '19:00', remindBeforeMin: 10 });
  it('before, start, end', () => {
    const r = remindersFor(t, '2026-10-16');
    expect(r.map((x) => [x.kind, x.time])).toEqual([['before', '17:50'], ['start', '18:00'], ['end', '19:00']]);
    expect(r[1].title).toBe('Waktunya Belajar Matematika! 📚');
  });
  it('each can be switched off; 0 = off', () => {
    expect(remindersFor(task({ start: '18:00', remindBeforeMin: 0, remindAtStart: false, remindAtEnd: false }), '2026-10-16')).toEqual([]);
  });
  it('untimed tasks have none', () => expect(remindersFor(task(), '2026-10-16')).toEqual([]));
  it('before reminder rolls over to previous day', () => {
    const r = remindersFor(task({ start: '00:10', remindBeforeMin: 30, remindAtStart: false, remindAtEnd: false }), '2026-10-16');
    expect([r[0].date, r[0].time]).toEqual(['2026-10-15', '23:40']);
  });
  it('no reminders for done or skipped occurrences', () => {
    const occs = { 't1@2026-10-16': { key: 't1@2026-10-16', taskId: 't1', date: '2026-10-16', doneAt: 'x', focusSec: 0, rewarded: true } };
    expect(pendingReminders([t], occs, '2026-10-16', 7, '2026-10-16 00:00', '2026-10-17 00:00')).toHaveLength(0);
    expect(pendingReminders([t], {}, '2026-10-16', 7, '2026-10-16 17:55', '2026-10-17 00:00').map((r) => r.kind)).toEqual(['start', 'end']);
  });
  it('snooze is 5 minutes later', () => {
    const s = snoozeReminder(t, 't1@2026-10-16', '2026-10-16', '23:58');
    expect([s.date, s.time, s.kind]).toEqual(['2026-10-17', '00:03', 'snooze']);
  });
});

it('notification kinds default to on and can be switched off', () => {
  expect(notifyOn(undefined, 'start')).toBe(true);
  expect(notifyOn({ start: false }, 'start')).toBe(false);
  expect(notifyOn({ start: false }, 'end')).toBe(true);
  expect(REMINDER_EVENT.snooze).toBe('start');
});
