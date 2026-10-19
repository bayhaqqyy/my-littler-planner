// Types for the generated bundle (see scripts/build-edge-domain.mjs).
export interface Reminder {
  id: string; occurrenceKey: string; taskId: string; kind: 'before' | 'start' | 'end' | 'snooze' | 'deadline-before' | 'deadline-due';
  date: string; time: string; title: string; body: string;
}
// deno-lint-ignore no-explicit-any
export function pendingReminders(tasks: any[], occs: Record<string, any>, today: string, days: number, fromStamp: string, toStamp: string): Reminder[];
// deno-lint-ignore no-explicit-any
export function reminderText(task: any, kind: Reminder['kind'], beforeMin?: number): { title: string; body: string };
export function splitOccKey(key: string): { taskId: string; date: string };
export function occKey(taskId: string, date: string): string;
export function stamp(r: { date: string; time: string }): string;
export function addDays(s: string, n: number): string;
export function toMinutes(hhmm: string): number;
export function fromMinutes(min: number): string;
export const SNOOZE_MIN: number;
export function toDateStr(d: Date): string;
export interface GcalEvent {
  summary: string; description: string;
  start: { dateTime: string; timeZone: string }; end: { dateTime: string; timeZone: string };
  colorId: string; reminders: { useDefault: false; overrides: [] };
  extendedProperties: { private: { mlp: '1'; occurrenceKey: string } };
}
export interface DesiredEvent { key: string; eventId: string; event: GcalEvent; hash: string }
// deno-lint-ignore no-explicit-any
export function desiredEvents(tasks: any[], occs: Record<string, any>, today: string, timeZone: string, appUrl: string, pastDays?: number, futureDays?: number): DesiredEvent[];
export function planSync(desired: DesiredEvent[], pushed: Record<string, string>): { upsert: DesiredEvent[]; remove: string[] };
export function gcalEventId(key: string): string;
// deno-lint-ignore no-explicit-any
export function buildIcs(tasks: any[], occs: Record<string, any>, o: { timeZone: string; appUrl: string; now: Date; today: string; name?: string }, past?: number, future?: number): string;
export const REMINDER_EVENT: Record<Reminder['kind'], 'remind-before' | 'start' | 'end'>;
export function notifyOn(notify: Partial<Record<string, boolean>> | undefined, event: string): boolean;
export function zonedToUtc(date: string, minutes: number, timeZone: string): Date;
// deno-lint-ignore no-explicit-any
export function migrateTask<T = any>(t: T, reminders?: number[]): T;
// deno-lint-ignore no-explicit-any
export function isDeadline(t: any): boolean;
// deno-lint-ignore no-explicit-any
export function dueAtOf(task: any, date: string, occ?: any): string;
export function deadlineSnoozeAt(nowWall: string, dueAt: string): string;
export function wallDate(w: string): string;
export function wallTime(w: string): string;
export const DEADLINE_SNOOZE_MIN: number;
