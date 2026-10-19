import type { Task } from '../types';
export function task(p: Partial<Task> = {}): Task {
  return {
    id: p.id ?? 't1', title: 'Belajar Matematika', category: 'belajar', priority: 'sedang', date: '2026-10-16',
    remindBeforeMin: 0, remindAtStart: true, remindAtEnd: true, repeat: 'none', weekdays: [], subtasks: [],
    createdAt: '2026-10-16T00:00:00.000Z', updatedAt: '2026-10-16T00:00:00.000Z', ...p,
  };
}
