import { addDays } from './dates';
import { occKey, occursOn } from './occurrences';
import { calendarSpan, deadlineNote } from './deadline';
import { CATEGORY_EMOJI, CATEGORY_LABEL, PRIORITY_LABEL } from './types';
import type { Category, Occurrence, Task } from './types';

/** Google Calendar event colors (colorId) closest to each category's pastel. */
export const GCAL_COLOR: Record<Category, string> = {
  kuliah: '7',     // Peacock
  belajar: '1',    // Lavender
  tugas: '5',      // Banana
  istirahat: '2',  // Sage
  olahraga: '10',  // Basil
  pribadi: '4',    // Flamingo
};

/** Days synced around today: a week back (so ✅ shows on recent days) and two months ahead. */
export const GCAL_PAST_DAYS = 7;
export const GCAL_FUTURE_DAYS = 60;

/**
 * Deterministic Google event id for an occurrence. Google allows [a-v0-9]{5,1024};
 * lowercase hex of the key fits that alphabet, is stable, and never collides.
 */
export function gcalEventId(key: string): string {
  let hex = '';
  for (const b of new TextEncoder().encode(key)) hex += b.toString(16).padStart(2, '0');
  return 'mlp' + hex;
}

export interface GcalEvent {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  colorId: string;
  reminders: { useDefault: false; overrides: [] };
  extendedProperties: { private: { mlp: '1'; occurrenceKey: string } };
}

export interface DesiredEvent { key: string; eventId: string; event: GcalEvent; hash: string }

/** Small stable string hash (djb2) to detect whether an event needs an update. */
export function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Calendar event for one timed occurrence (untimed tasks have no event). */
export function eventFor(task: Task, date: string, occ: Occurrence | undefined, timeZone: string, appUrl: string): GcalEvent | undefined {
  const span = calendarSpan(task, date, occ);
  if (!span) return undefined;
  const done = !!occ?.doneAt;
  const lines = [
    `${CATEGORY_LABEL[task.category]} · Prioritas ${PRIORITY_LABEL[task.priority]}`,
    deadlineNote(task, date, occ),
    task.description ? `\n${task.description}` : '',
    task.subtasks.length ? '\n' + task.subtasks.map((s) => `${s.done ? '☑' : '☐'} ${s.text}`).join('\n') : '',
    `\nDibuat dari My Little Planner: ${appUrl}/task/${task.id}?date=${date}`,
  ].filter(Boolean);
  return {
    summary: `${done ? '✅' : span.deadline ? '🚩' : CATEGORY_EMOJI[task.category]} ${task.title}`,
    description: lines.join('\n'),
    start: { dateTime: `${span.start}:00`, timeZone },
    end: { dateTime: `${span.end}:00`, timeZone },
    colorId: GCAL_COLOR[task.category],
    // The app sends its own reminders; avoid double notifications from Google.
    reminders: { useDefault: false, overrides: [] },
    extendedProperties: { private: { mlp: '1', occurrenceKey: occKey(task.id, date) } },
  };
}

/** Every event that should exist in the Little Planner calendar for the window around `today`. */
export function desiredEvents(
  tasks: Task[],
  occs: Record<string, Occurrence>,
  today: string,
  timeZone: string,
  appUrl: string,
  pastDays = GCAL_PAST_DAYS,
  futureDays = GCAL_FUTURE_DAYS,
): DesiredEvent[] {
  const out: DesiredEvent[] = [];
  for (let i = -pastDays; i <= futureDays; i++) {
    const date = addDays(today, i);
    for (const t of tasks) {
      if (!occursOn(t, date)) continue;
      const key = occKey(t.id, date);
      const occ = occs[key];
      if (occ?.skipped) continue;
      const event = eventFor(t, date, occ, timeZone, appUrl);
      if (!event) continue;
      out.push({ key, eventId: gcalEventId(key), event, hash: hashString(JSON.stringify(event)) });
    }
  }
  return out;
}

/** Diff desired events against what was pushed before ({ key → hash }). */
export function planSync(desired: DesiredEvent[], pushed: Record<string, string>) {
  const want = new Map(desired.map((d) => [d.key, d]));
  const upsert = desired.filter((d) => pushed[d.key] !== d.hash);
  const remove = Object.keys(pushed).filter((k) => !want.has(k));
  return { upsert, remove };
}
