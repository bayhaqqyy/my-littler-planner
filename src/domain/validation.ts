import { z } from 'zod';
import { isValidDate, isValidTime, toMinutes } from './dates';
import { CATEGORIES, PRIORITIES } from './types';

export const usernameSchema = z
  .string()
  .trim()
  .min(2, 'Username minimal 2 karakter')
  .max(20, 'Username maksimal 20 karakter')
  .regex(/^[\p{L}\p{N} ]+$/u, 'Hanya huruf, angka, dan spasi');

export const taskFormSchema = z
  .object({
    kind: z.enum(['scheduled', 'deadline']).default('scheduled'),
    title: z.string().trim().min(1, 'Nama tugas wajib diisi').max(80, 'Maksimal 80 karakter'),
    description: z.string().max(2000).optional(),
    category: z.enum(CATEGORIES as [string, ...string[]]),
    priority: z.enum(PRIORITIES as [string, ...string[]]),
    date: z.string().refine(isValidDate, 'Tanggal tidak valid'),
    start: z.string().optional().refine((v) => !v || isValidTime(v), 'Jam mulai tidak valid'),
    end: z.string().optional().refine((v) => !v || isValidTime(v), 'Jam selesai tidak valid'),
    durationMin: z.number().int().min(1).max(24 * 60).optional(),
    dueTime: z.string().optional().refine((v) => !v || isValidTime(v), 'Jam deadline tidak valid'),
    deadlineRemindersMin: z.array(z.number().int().min(0)).default([]),
    /** "Batas akhir" of a scheduled task: 'YYYY-MM-DDTHH:mm' */
    hardStop: z.string().optional().refine((v) => !v || (isValidDate(v.slice(0, 10)) && isValidTime(v.slice(11, 16))), 'Batas akhir tidak valid'),
    remindBeforeMin: z.number().int().min(0),
    remindAtStart: z.boolean(),
    remindAtEnd: z.boolean(),
    repeat: z.enum(['none', 'daily', 'weekdays', 'weekly']),
    weekdays: z.array(z.number().int().min(0).max(6)),
  })
  .superRefine((v, ctx) => {
    if (v.kind === 'deadline') {
      // Start/end/duration don't apply to deadline tasks.
      if (!v.dueTime) ctx.addIssue({ code: 'custom', path: ['dueTime'], message: 'Pilih jam deadline' });
    } else {
      if (v.end && !v.start) ctx.addIssue({ code: 'custom', path: ['start'], message: 'Isi jam mulai dulu' });
      if (v.start && v.end && toMinutes(v.end) <= toMinutes(v.start))
        ctx.addIssue({ code: 'custom', path: ['end'], message: 'Jam selesai harus setelah jam mulai' });
    }
    if (v.repeat === 'weekly' && v.weekdays.length === 0)
      ctx.addIssue({ code: 'custom', path: ['weekdays'], message: 'Pilih minimal satu hari' });
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;

/** Map a zod error to `{ field: message }` (first message per field). */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? '_');
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
