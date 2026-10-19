import { buildIcs, icsEscape, icsFold, zonedToUtc } from '../ics';
import { task } from './helpers';

const opts = { timeZone: 'Asia/Jakarta', appUrl: 'https://todo.example.com', now: new Date('2026-10-17T00:00:00Z'), today: '2026-10-17' };

describe('ics', () => {
  it('converts wall clock in a zone to UTC', () => {
    expect(zonedToUtc('2026-10-17', 18 * 60, 'Asia/Jakarta').toISOString()).toBe('2026-10-17T11:00:00.000Z');
    expect(zonedToUtc('2026-07-01', 9 * 60, 'Europe/Amsterdam').toISOString()).toBe('2026-07-01T07:00:00.000Z'); // DST
    expect(zonedToUtc('2026-01-01', 9 * 60, 'Europe/Amsterdam').toISOString()).toBe('2026-01-01T08:00:00.000Z');
  });
  it('escapes and folds per RFC 5545', () => {
    expect(icsEscape('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    const folded = icsFold('SUMMARY:' + 'x'.repeat(100));
    expect(folded.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
    expect(folded.split('\r\n')[1].startsWith(' ')).toBe(true);
  });
  it('builds a feed with timed, non-skipped occurrences', () => {
    const t = task({ id: 'a', start: '18:00', end: '19:30', date: '2026-10-17', title: 'Belajar, bab 1' });
    const untimed = task({ id: 'b', date: '2026-10-17' });
    const ics = buildIcs([t, untimed], {}, opts, 0, 0);
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain('UID:a@2026-10-17@mylittleplanner');
    expect(ics).toContain('DTSTART:20261017T110000Z');
    expect(ics).toContain('DTEND:20261017T123000Z');
    expect(ics).toContain('SUMMARY:📚 Belajar\\, bab 1');
  });
  it('marks done and drops skipped', () => {
    const t = task({ id: 'r', start: '06:00', repeat: 'daily', date: '2026-10-16' });
    const occs = {
      'r@2026-10-16': { key: 'r@2026-10-16', taskId: 'r', date: '2026-10-16', doneAt: 'x', focusSec: 0, rewarded: true },
      'r@2026-10-17': { key: 'r@2026-10-17', taskId: 'r', date: '2026-10-17', skipped: true, focusSec: 0, rewarded: false },
    };
    const ics = buildIcs([t], occs, opts, 1, 1);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('SUMMARY:✅');
    expect(ics).not.toContain('UID:r@2026-10-17@');
  });
});
