import { endOf, occursOn } from './occurrences';
import { toMinutes } from './dates';
import type { Occurrence, Task } from './types';
import { occKey } from './occurrences';

export const TOO_CLOSE_MIN = 10;

export interface TimeSlot { start: number; end: number }

export function slotOf(t: Pick<Task, 'start' | 'end' | 'durationMin'>): TimeSlot | undefined {
  if (!t.start) return undefined;
  const end = endOf(t);
  return end === undefined ? undefined : { start: toMinutes(t.start), end };
}

export function overlaps(a: TimeSlot, b: TimeSlot): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Gap between two non-overlapping slots is less than 10 minutes. */
export function tooClose(a: TimeSlot, b: TimeSlot, gap = TOO_CLOSE_MIN): boolean {
  if (overlaps(a, b)) return false;
  const g = a.end <= b.start ? b.start - a.end : a.start - b.end;
  return g < gap;
}

export interface ConflictResult { overlap: Task[]; close: Task[] }

/** Check a candidate slot on `date` against other tasks occurring that day. Warnings only. */
export function findConflicts(
  candidate: Pick<Task, 'start' | 'end' | 'durationMin'> & { id?: string },
  date: string,
  tasks: Task[],
  occs: Record<string, Occurrence> = {},
): ConflictResult {
  const res: ConflictResult = { overlap: [], close: [] };
  const a = slotOf(candidate);
  if (!a) return res;
  for (const t of tasks) {
    if (t.id === candidate.id || !occursOn(t, date)) continue;
    if (occs[occKey(t.id, date)]?.skipped) continue;
    const b = slotOf(t);
    if (!b) continue;
    if (overlaps(a, b)) res.overlap.push(t);
    else if (tooClose(a, b)) res.close.push(t);
  }
  return res;
}

/** Task ids on a given day that overlap with any other. */
export function conflictingIds(tasks: Task[], date: string, occs: Record<string, Occurrence> = {}): Set<string> {
  const day = tasks.filter((t) => occursOn(t, date) && !occs[occKey(t.id, date)]?.skipped);
  const ids = new Set<string>();
  for (let i = 0; i < day.length; i++) {
    const a = slotOf(day[i]);
    if (!a) continue;
    for (let j = i + 1; j < day.length; j++) {
      const b = slotOf(day[j]);
      if (b && overlaps(a, b)) { ids.add(day[i].id); ids.add(day[j].id); }
    }
  }
  return ids;
}

/** Assign side-by-side columns to overlapping timed items (for the day timeline). */
export function layoutColumns<T extends { slot: TimeSlot }>(items: T[]): (T & { col: number; cols: number })[] {
  const sorted = [...items].sort((x, y) => x.slot.start - y.slot.start || y.slot.end - x.slot.end);
  const out: (T & { col: number; cols: number })[] = [];
  let cluster: (T & { col: number; cols: number })[] = [];
  let clusterEnd = -1;
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((c) => c.col + 1));
    cluster.forEach((c) => (c.cols = cols));
    out.push(...cluster);
    cluster = [];
  };
  for (const it of sorted) {
    if (cluster.length && it.slot.start >= clusterEnd) flush();
    const used = new Set(cluster.filter((c) => c.slot.end > it.slot.start).map((c) => c.col));
    let col = 0;
    while (used.has(col)) col++;
    cluster.push({ ...it, col, cols: 1 });
    clusterEnd = Math.max(clusterEnd, it.slot.end);
  }
  if (cluster.length) flush();
  return out;
}
