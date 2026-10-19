import { desiredEvents, eventFor, gcalEventId, planSync } from '../gcal';
import { task } from './helpers';

const TZ = 'Asia/Jakarta';
const URL = 'https://todo.example.com';

describe('gcal', () => {
  it('event id is stable and uses Google-allowed characters', () => {
    const id = gcalEventId('abc-123@2026-10-16');
    expect(id).toBe(gcalEventId('abc-123@2026-10-16'));
    expect(id).toMatch(/^[a-v0-9]{5,1024}$/);
    expect(gcalEventId('a@2026-10-16')).not.toBe(gcalEventId('a@2026-10-17'));
  });
  it('maps a timed task to an event; untimed has none', () => {
    const e = eventFor(task({ start: '18:00', end: '19:00' }), '2026-10-16', undefined, TZ, URL)!;
    expect(e.start).toEqual({ dateTime: '2026-10-16T18:00:00', timeZone: TZ });
    expect(e.end.dateTime).toBe('2026-10-16T19:00:00');
    expect(e.summary).toBe('📚 Belajar Matematika');
    expect(e.colorId).toBe('1');
    expect(eventFor(task(), '2026-10-16', undefined, TZ, URL)).toBeUndefined();
  });
  it('event ending after midnight ends the next day', () => {
    const e = eventFor(task({ start: '23:30', durationMin: 60 }), '2026-10-16', undefined, TZ, URL)!;
    expect(e.end.dateTime).toBe('2026-10-17T00:30:00');
  });
  it('done occurrences get a check mark', () => {
    const e = eventFor(task({ start: '08:00' }), '2026-10-16', { key: 'k', taskId: 't1', date: '2026-10-16', doneAt: 'x', focusSec: 0, rewarded: true }, TZ, URL)!;
    expect(e.summary.startsWith('✅')).toBe(true);
  });
  it('expands repeats in the window and drops skipped / deleted', () => {
    const daily = task({ id: 'd', start: '06:00', repeat: 'daily', date: '2026-10-16' });
    const gone = task({ id: 'x', start: '07:00', deletedAt: 'now' });
    const occs = { 'd@2026-10-17': { key: 'd@2026-10-17', taskId: 'd', date: '2026-10-17', skipped: true, focusSec: 0, rewarded: false } };
    const keys = desiredEvents([daily, gone], occs, '2026-10-16', TZ, URL, 0, 3).map((d) => d.key);
    expect(keys).toEqual(['d@2026-10-16', 'd@2026-10-18', 'd@2026-10-19']);
  });
  it('planSync: upsert changed/new, remove gone', () => {
    const d = desiredEvents([task({ start: '08:00' })], {}, '2026-10-16', TZ, URL, 0, 0);
    expect(planSync(d, {}).upsert).toHaveLength(1);
    expect(planSync(d, { [d[0].key]: d[0].hash })).toEqual({ upsert: [], remove: [] });
    expect(planSync([], { 'old@2026-10-01': 'h' }).remove).toEqual(['old@2026-10-01']);
  });
});
