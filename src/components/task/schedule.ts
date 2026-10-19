import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { parseDate, type Task } from '@/domain';

export const WEEKDAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/** Human text for a task's repeat rule. */
export function repeatText(t: Pick<Task, 'repeat' | 'weekdays'>): string {
  switch (t.repeat) {
    case 'none': return 'Tidak berulang';
    case 'daily': return 'Setiap hari';
    case 'weekdays': return 'Senin–Jumat';
    case 'weekly': return [...t.weekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => WEEKDAY_SHORT[d]).join(', ');
  }
}

export const fmtDate = (d: string, pattern = 'EEEE, d MMMM yyyy') => format(parseDate(d), pattern, { locale: localeId });
