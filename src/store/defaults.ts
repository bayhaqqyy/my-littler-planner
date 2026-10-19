import { DEFAULT_POMODORO, defaultWardrobe } from '@/domain';
import type { Progress, Settings } from '@/domain';

export const defaultSettings = (): Settings => ({
  alarmTone: 'lonceng',
  volume: 0.7,
  defaultRemindBeforeMin: 10,
  defaultTimerMode: 'pomodoro',
  pomodoro: { ...DEFAULT_POMODORO },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

export const defaultProgress = (): Progress => ({ streakClaimed: [], celebratedDates: [] });
export { defaultWardrobe };
