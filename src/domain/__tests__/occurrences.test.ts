import { durationOf, occurrencesOn, occursOn, overdue, reschedule, matchesSearch, occKey } from '../occurrences';
import { task } from './helpers';

// 2026-10-16 is a Friday
describe('occursOn', () => {
  it('one-off only on its date', () => {
    const t = task();
    expect(occursOn(t, '2026-10-16')).toBe(true);
    expect(occursOn(t, '2026-10-17')).toBe(false);
  });
  it('daily from creation date', () => {
    const t = task({ repeat: 'daily' });
    expect(occursOn(t, '2026-10-15')).toBe(false);
    expect(occursOn(t, '2026-10-20')).toBe(true);
  });
  it('weekdays Mon-Fri', () => {
    const t = task({ repeat: 'weekdays' });
    expect(occursOn(t, '2026-10-17')).toBe(false); // Sat
    expect(occursOn(t, '2026-10-19')).toBe(true); // Mon
  });
  it('weekly on selected days', () => {
    const t = task({ repeat: 'weekly', weekdays: [2, 4] });
    expect(occursOn(t, '2026-10-20')).toBe(true); // Tue
    expect(occursOn(t, '2026-10-21')).toBe(false);
  });
  it('deleted never occurs', () => {
    expect(occursOn(task({ deletedAt: 'x' }), '2026-10-16')).toBe(false);
  });
});

describe('durationOf', () => {
  it('uses end - start', () => expect(durationOf({ start: '18:00', end: '19:00' })).toBe(60));
  it('falls back to manual', () => expect(durationOf({ durationMin: 40 })).toBe(40));
  it('defaults to 25', () => expect(durationOf({})).toBe(25));
});

describe('ordering', () => {
  it('sorts by start, priority, untimed last, done at bottom', () => {
    const ts = [
      task({ id: 'a', title: 'A' }),
      task({ id: 'b', title: 'B', start: '09:00', priority: 'rendah' }),
      task({ id: 'c', title: 'C', start: '09:00', priority: 'tinggi' }),
      task({ id: 'd', title: 'D', start: '07:00' }),
    ];
    const occs = { [occKey('d', '2026-10-16')]: { key: 'd@2026-10-16', taskId: 'd', date: '2026-10-16', doneAt: 'x', focusSec: 0, rewarded: true } };
    expect(occurrencesOn(ts, '2026-10-16', occs).map((v) => v.task.id)).toEqual(['c', 'b', 'a', 'd']);
  });
  it('hides skipped occurrences', () => {
    const occs = { 't1@2026-10-16': { key: 't1@2026-10-16', taskId: 't1', date: '2026-10-16', skipped: true, focusSec: 0, rewarded: false } };
    expect(occurrencesOn([task()], '2026-10-16', occs)).toHaveLength(0);
  });
});

describe('overdue', () => {
  it('only non-repeating, before today, not done', () => {
    const ts = [task({ id: 'x', date: '2026-10-10' }), task({ id: 'y', date: '2026-10-10', repeat: 'daily' }), task({ id: 'z', date: '2026-10-16' })];
    expect(overdue(ts, '2026-10-16', {}).map((v) => v.task.id)).toEqual(['x']);
  });
});

describe('reschedule', () => {
  it('moves a one-off task', () => {
    const r = reschedule(task(), '2026-10-16', '2026-10-18', 'new', 'now');
    expect(r.updated?.date).toBe('2026-10-18');
    expect(r.created).toBeUndefined();
  });
  it('repeating: skips that occurrence and creates a one-off copy', () => {
    const r = reschedule(task({ repeat: 'daily' }), '2026-10-17', '2026-10-18', 'new', 'now');
    expect(r.skipKey).toBe('t1@2026-10-17');
    expect(r.created).toMatchObject({ id: 'new', date: '2026-10-18', repeat: 'none' });
    expect(r.updated).toBeUndefined();
  });
});

it('search matches title and description', () => {
  expect(matchesSearch(task({ description: 'bab integral' }), 'INTEGRAL')).toBe(true);
  expect(matchesSearch(task(), 'fisika')).toBe(false);
});
