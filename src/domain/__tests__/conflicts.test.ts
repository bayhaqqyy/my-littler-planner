import { findConflicts, overlaps, tooClose, layoutColumns, conflictingIds } from '../conflicts';
import { task } from './helpers';

describe('conflicts', () => {
  it('overlap rule', () => {
    expect(overlaps({ start: 60, end: 120 }, { start: 119, end: 130 })).toBe(true);
    expect(overlaps({ start: 60, end: 120 }, { start: 120, end: 130 })).toBe(false);
  });
  it('too close when gap < 10 min', () => {
    expect(tooClose({ start: 60, end: 120 }, { start: 125, end: 130 })).toBe(true);
    expect(tooClose({ start: 60, end: 120 }, { start: 130, end: 140 })).toBe(false);
  });
  it('findConflicts against same-day tasks only, excluding itself', () => {
    const ts = [
      task({ id: 'a', start: '18:00', end: '19:00' }),
      task({ id: 'b', start: '19:05', end: '19:30' }),
      task({ id: 'c', start: '18:30', end: '19:00', date: '2026-10-17' }),
    ];
    const r = findConflicts({ id: 'n', start: '18:30', end: '19:00' }, '2026-10-16', ts);
    expect(r.overlap.map((t) => t.id)).toEqual(['a']);
    expect(r.close.map((t) => t.id)).toEqual(['b']);
    expect(findConflicts({ id: 'a', start: '18:00', end: '19:00' }, '2026-10-16', ts).overlap).toHaveLength(0);
  });
  it('conflictingIds', () => {
    const ts = [task({ id: 'a', start: '08:00', end: '09:00' }), task({ id: 'b', start: '08:30', end: '09:30' }), task({ id: 'c', start: '10:00' })];
    expect([...conflictingIds(ts, '2026-10-16')].sort()).toEqual(['a', 'b']);
  });
  it('layoutColumns puts overlapping items side by side', () => {
    const r = layoutColumns([{ id: 1, slot: { start: 0, end: 60 } }, { id: 2, slot: { start: 30, end: 90 } }, { id: 3, slot: { start: 120, end: 150 } }]);
    const by = Object.fromEntries(r.map((x) => [x.id, x]));
    expect([by[1].col, by[2].col, by[1].cols, by[3].cols]).toEqual([0, 1, 2, 1]);
  });
});
