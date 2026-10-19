import { LEVELS, levelFor, levelMin, MAX_LEVEL, points, POINTS, titleFor } from '../levels';
import { badges, nextBadges } from '../badges';
import type { CompletionLog } from '../types';

const log = (p: Partial<CompletionLog> = {}): CompletionLog => ({
  occurrenceKey: 'k', title: 't', category: 'belajar', completedAt: new Date('2026-10-16T10:00:00').toISOString(), durationMin: 25, timed: false, ...p,
});
const at = (d: string, h = 10) => new Date(`${d}T${String(h).padStart(2, '0')}:00:00`).toISOString();

describe('points', () => {
  it('5 per task, +2 with timer, 2 per 10 focus minutes', () => {
    expect(points([log(), log({ timed: true })], [])).toBe(12);
    expect(points([], [{ seconds: 1199 }])).toBe(2);
    expect(points([], [{ seconds: 600 }, { seconds: 600 }])).toBe(4);
  });
  it('only the first 12 completions per day count', () => {
    const many = Array.from({ length: 20 }, (_, i) => log({ completedAt: at('2026-10-16', 6 + (i % 12)) }));
    expect(points(many, [])).toBe(POINTS.dailyTaskCap * POINTS.task);
    expect(points([...many, log({ completedAt: at('2026-10-17') })], [])).toBe(13 * POINTS.task);
  });
});

describe('levels', () => {
  it('60 levels with growing gaps', () => {
    expect(LEVELS).toHaveLength(MAX_LEVEL);
    expect([levelMin(1), levelMin(2), levelMin(10), levelMin(30), levelMin(60)]).toEqual([0, 20, 756, 7076, 28556]);
    for (let l = 3; l <= MAX_LEVEL; l++) expect(levelMin(l) - levelMin(l - 1)).toBeGreaterThan(levelMin(l - 1) - levelMin(l - 2));
  });
  it('levelFor and titles', () => {
    expect(levelFor(0)).toMatchObject({ level: 1, title: 'Pemula' });
    expect(levelFor(19).level).toBe(1);
    expect(levelFor(20).level).toBe(2);
    expect(titleFor(6)).toBe('Baru Belajar');
    expect(titleFor(60)).toBe('Legenda');
    expect(levelFor(30000)).toMatchObject({ level: 60, next: undefined, progress: 1 });
    expect(levelFor(10).progress).toBeCloseTo(0.5);
  });
});

describe('badges', () => {
  const empty = { completions: [], focus: [], progress: { celebratedDates: [] } };
  it('has many tiered badges, none earned at start', () => {
    const b = badges(empty);
    expect(b.length).toBe(68);
    expect(b.some((x) => x.earned)).toBe(false);
    expect(new Set(b.map((x) => x.id)).size).toBe(b.length);
  });
  it('first tiers are easy', () => {
    const b = Object.fromEntries(badges({ ...empty, completions: [log({ category: 'olahraga', timed: true, completedAt: at('2026-10-17', 7) })], notes: [{ date: '2026-10-17', text: 'hai', reflection: '', mood: 'senang' }] }).map((x) => [x.name, x.earned]));
    expect(b).toMatchObject({ 'First Bloom': true, 'Move It': true, 'Timer Rookie': true, 'Early Bird': true, 'Weekend Warrior': true, 'Dear Diary': true, 'Mood Check': true, 'Busy Bee': false });
  });
  it('progress values and next badges', () => {
    const logs = Array.from({ length: 7 }, () => log());
    const b = badges({ ...empty, completions: logs, focus: [{ date: '2026-10-16', category: 'belajar', seconds: 3 * 3600 }] });
    const busy = b.find((x) => x.name === 'Busy Bee')!;
    expect([busy.current, busy.target, busy.earned]).toEqual([7, 10, false]);
    expect(b.find((x) => x.name === 'Focus Master')!.current).toBe(3);
    expect(b.find((x) => x.name === 'Marathon')!.earned).toBe(true);
    expect(nextBadges(b, 2).map((x) => x.name)).toEqual(['Ultra Marathon', 'Busy Bee']);
  });
  it('visual rank grows with tier, from 0 to 6', () => {
    const tasks = badges(empty).filter((x) => x.group === 'Tugas selesai').map((x) => x.rank);
    expect(tasks).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(badges(empty).filter((x) => x.group === 'Olahraga').map((x) => x.rank)).toEqual([0, 3, 6]);
    expect(badges(empty).find((x) => x.name === 'Explorer')!.rank).toBe(3);
  });
  it('streak and perfect-day series', () => {
    const logs = ['2026-10-10', '2026-10-11', '2026-10-12'].map((d) => log({ completedAt: at(d) }));
    const b = Object.fromEntries(badges({ ...empty, completions: logs, progress: { celebratedDates: ['2026-10-10', '2026-10-11', '2026-10-12'] } }).map((x) => [x.name, x.earned]));
    expect(b).toMatchObject({ 'Warming Up': true, 'Consistency Star': false, 'Super Planner': true, 'Flawless Trio': true });
  });
});
