import { badges, levelOf, type Badge } from '@/domain';
import type { DataState } from './store';

/** Badge list for the current local data. */
export function badgesFromState(s: Pick<DataState, 'completionLogs' | 'focusLogs' | 'progress' | 'notes' | 'wardrobe'>): Badge[] {
  return badges({
    completions: Object.values(s.completionLogs),
    focus: Object.values(s.focusLogs),
    progress: s.progress,
    notes: Object.values(s.notes),
    owned: s.wardrobe.owned,
  });
}

export function levelFromState(s: Pick<DataState, 'completionLogs' | 'focusLogs'>) {
  return levelOf(Object.values(s.completionLogs), Object.values(s.focusLogs));
}
