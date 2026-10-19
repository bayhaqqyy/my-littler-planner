import { currentStreak, longestStreak, newMilestones } from '../streak';

const at = (d: string, h = 10) => ({ completedAt: new Date(`${d}T${String(h).padStart(2, '0')}:00:00`).toISOString() });

describe('streak', () => {
  it('counts back from today', () => {
    expect(currentStreak([at('2026-10-14'), at('2026-10-15'), at('2026-10-16')], '2026-10-16')).toBe(3);
  });
  it('starts from yesterday when nothing done today yet', () => {
    expect(currentStreak([at('2026-10-14'), at('2026-10-15')], '2026-10-16')).toBe(2);
  });
  it('breaks on a gap', () => {
    expect(currentStreak([at('2026-10-13'), at('2026-10-15')], '2026-10-16')).toBe(1);
    expect(currentStreak([at('2026-10-13')], '2026-10-16')).toBe(0);
  });
  it('uses local completion date', () => {
    expect(currentStreak([at('2026-10-16', 23)], '2026-10-16')).toBe(1);
  });
  it('longest', () => expect(longestStreak([at('2026-10-01'), at('2026-10-02'), at('2026-10-05')])).toBe(2));
  it('milestones once each', () => expect(newMilestones(8, [3])).toEqual([7]));
});
