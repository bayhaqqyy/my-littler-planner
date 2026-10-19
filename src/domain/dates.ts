/** Date helpers. All dates are local `YYYY-MM-DD`, times are `HH:mm` in device time zone. */
const pad = (n: number) => String(n).padStart(2, '0');

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

/** 0 = Sunday ... 6 = Saturday */
export function weekdayOf(s: string): number {
  return parseDate(s).getDay();
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function fromMinutes(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Local Date for a date + HH:mm. */
export function atTime(date: string, hhmm: string): Date {
  const d = parseDate(date);
  const [h, m] = hhmm.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Monday of the week containing `s`. */
export function startOfWeek(s: string): string {
  const wd = weekdayOf(s);
  return addDays(s, wd === 0 ? -6 : 1 - wd);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000);
}

export function range(from: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(from, i));
}

export function isValidTime(s?: string): s is string {
  return !!s && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

export function isValidDate(s?: string): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseDate(s).getTime());
}

export function greeting(hour: number): string {
  if (hour < 11) return 'Good morning';
  if (hour < 15) return 'Good afternoon';
  if (hour < 19) return 'Good evening';
  return 'Good night';
}
