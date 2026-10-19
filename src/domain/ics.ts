import { addDays, fromMinutes, toMinutes } from './dates';
import { occKey, occursOn } from './occurrences';
import { calendarSpan, deadlineNote, wallDate, wallTime } from './deadline';
import { CATEGORY_EMOJI, CATEGORY_LABEL, PRIORITY_LABEL } from './types';
import type { Occurrence, Task } from './types';

/** Window published in the calendar feed. */
export const ICS_PAST_DAYS = 30;
export const ICS_FUTURE_DAYS = 90;

/** Offset (minutes, east positive) of `timeZone` at the given UTC instant. */
export function tzOffsetMinutes(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second'));
  return Math.round((asUtc - utcMs) / 60000);
}

/** UTC instant of a wall-clock date + minutes-of-day in `timeZone` (handles DST by re-checking). */
export function zonedToUtc(date: string, minutes: number, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  let utc = guess - tzOffsetMinutes(guess, timeZone) * 60000;
  utc = guess - tzOffsetMinutes(utc, timeZone) * 60000;
  return new Date(utc);
}

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** RFC 5545 text escaping. */
export const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold content lines at 75 octets (continuation lines start with a space). */
export function icsFold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  let len = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (len + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; len = 0; }
    cur += ch; len += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export interface IcsOptions { timeZone: string; appUrl: string; now: Date; today: string; name?: string }

/** A full iCalendar feed of the timed task occurrences around `today`. */
export function buildIcs(tasks: Task[], occs: Record<string, Occurrence>, o: IcsOptions, past = ICS_PAST_DAYS, future = ICS_FUTURE_DAYS): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//My Little Planner//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(o.name ?? 'Little Planner 🌷')}`,
    `X-WR-TIMEZONE:${o.timeZone}`,
    'X-WR-CALDESC:Tugas dari My Little Planner',
    // Hints for how often apps should re-fetch (Apple/Outlook honour these).
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M',
    'X-PUBLISHED-TTL:PT15M',
  ];
  const stamp = icsStamp(o.now);
  for (let i = -past; i <= future; i++) {
    const date = addDays(o.today, i);
    for (const t of tasks) {
      if (!occursOn(t, date)) continue;
      const key = occKey(t.id, date);
      const occ = occs[key];
      if (occ?.skipped) continue;
      const span = calendarSpan(t, date, occ);
      if (!span) continue;
      const done = !!occ?.doneAt;
      const desc = [
        `${CATEGORY_LABEL[t.category]} · Prioritas ${PRIORITY_LABEL[t.priority]}`,
        deadlineNote(t, date, occ),
        t.description ?? '',
        ...t.subtasks.map((s) => `${s.done ? '☑' : '☐'} ${s.text}`),
        `${o.appUrl}/task/${t.id}?date=${date}`,
      ].filter(Boolean).join('\n');
      lines.push(
        'BEGIN:VEVENT',
        `UID:${key}@mylittleplanner`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icsStamp(zonedToUtc(wallDate(span.start), toMinutes(wallTime(span.start)), o.timeZone))}`,
        `DTEND:${icsStamp(zonedToUtc(wallDate(span.end), toMinutes(wallTime(span.end)), o.timeZone))}`,
        `SUMMARY:${icsEscape(`${done ? '✅' : span.deadline ? '🚩' : CATEGORY_EMOJI[t.category]} ${t.title}`)}`,
        `DESCRIPTION:${icsEscape(desc)}`,
        `CATEGORIES:${icsEscape(CATEGORY_LABEL[t.category])}`,
        `URL:${o.appUrl}/task/${t.id}?date=${date}`,
        `STATUS:${done ? 'CONFIRMED' : 'TENTATIVE'}`,
        'TRANSP:OPAQUE',
        'END:VEVENT',
      );
    }
  }
  lines.push('END:VCALENDAR');
  return lines.map(icsFold).join('\r\n') + '\r\n';
}

/** Wall-clock HH:mm helper re-exported for the feed's tests. */
export { fromMinutes };
