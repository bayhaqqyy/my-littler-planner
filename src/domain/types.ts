export type Category = 'kuliah' | 'belajar' | 'tugas' | 'istirahat' | 'olahraga' | 'pribadi';
export type Priority = 'rendah' | 'sedang' | 'tinggi';
export type Repeat = 'none' | 'daily' | 'weekdays' | 'weekly';
/** 'scheduled' has start/end times; 'deadline' has one due time (PRD Fitur Deadline). */
export type TaskKind = 'scheduled' | 'deadline';
/** 'legenda': only from Legend-rank badges. */
export type Rarity = 'default' | 'biasa' | 'langka' | 'super' | 'streak' | 'legenda';
export type Mood = 'senang' | 'biasa' | 'sedih' | 'capek' | 'semangat';
export type Slot = 'hair' | 'outfit' | 'glasses' | 'pet' | 'extra';

export interface Profile {
  userId: string;
  username: string;
  googleName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Subtask { id: string; text: string; done: boolean }

export interface Task {
  id: string;
  /** Missing on data from before the deadline feature = 'scheduled' (see migrateTask). */
  kind?: TaskKind;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  date: string;
  start?: string;
  end?: string;
  durationMin?: number;
  /** @deprecated date-only deadline from v1; converted by migrateTask(). */
  deadline?: string;
  /** HH:mm — due time for kind 'deadline' (date = due date). */
  dueTime?: string;
  /** Minutes before the due time to remind, e.g. [1440, 60, 0]. Empty for 'scheduled'. */
  deadlineRemindersMin?: number[];
  /** Local 'YYYY-MM-DDTHH:mm' — optional "Batas akhir" of a scheduled task (no reminders). */
  hardStop?: string;
  remindBeforeMin: number;
  remindAtStart: boolean;
  remindAtEnd: boolean;
  repeat: Repeat;
  weekdays: number[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Occurrence {
  key: string;
  taskId: string;
  date: string;
  doneAt?: string;
  skipped?: boolean;
  focusSec: number;
  rewarded: boolean;
  /** Local 'YYYY-MM-DDTHH:mm' — this occurrence's deadline when rescheduled (else date + dueTime). */
  dueAt?: string;
  completedLate?: boolean;
}

export type PomodoroPreset = 'klasik' | 'santai' | 'fokus-panjang' | 'custom';

export interface PomodoroConfig {
  preset: PomodoroPreset;
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsBeforeLong: number;
  autoStartNext: boolean;
}

export type TimerPhase = 'focus' | 'short-break' | 'long-break';

export interface TimerState {
  occurrenceKey: string;
  mode: 'task' | 'pomodoro';
  pomodoro?: PomodoroConfig;
  phase: TimerPhase;
  completedSessions: number;
  totalSec: number;
  remainingSec: number;
  endsAt?: string;
  state: 'idle' | 'running' | 'paused' | 'finished';
}

export interface FocusLog { date: string; category: Category; seconds: number }

export interface CompletionLog {
  occurrenceKey: string;
  title: string;
  category: Category;
  completedAt: string;
  durationMin: number;
  timed: boolean;
}

export interface GiftBox {
  id: string; rarity: Exclude<Rarity, 'default'>; source: string; itemId?: string; createdAt: string;
  /** Finished a deadline ≥ 24 h early: better odds, extra sparkle on the box. */
  early?: boolean;
  /** Chance (0–1) the box holds a new item, set from the task's category when earned. */
  newChance?: number;
}

export interface Item {
  id: string;
  slot: Slot;
  rarity: Rarity;
  name: string;
  description: string;
}

export interface Wardrobe {
  owned: string[];
  equipped: { hair?: string; outfit: string; glasses?: string; pet?: string; extra?: string };
}

export interface DailyNote { date: string; text: string; mood?: Mood; reflection: string }

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
  createdAt: string;
}

export type AlarmTone = 'lonceng' | 'chime' | 'kucing' | 'lembut';

/** Moments that make a sound. Each can use a different sound (Settings → Suara). */
export type SoundEvent = 'remind-before' | 'start' | 'end' | 'break' | 'back' | 'done';
/** Recorded voice clips (public/sounds) + synthesized tones + silence. */
export type SoundId = 'v-remind' | 'v-start' | 'v-break' | 'v-back' | 'v-done' | AlarmTone | 'none';

export interface Settings {
  alarmTone: AlarmTone;
  /** Sound per moment; missing entries use DEFAULT_SOUNDS. */
  sounds?: Partial<Record<SoundEvent, SoundId>>;
  /** Which kinds of notification are on (missing = on). Respected in the app and by the push server. */
  notify?: Partial<Record<SoundEvent, boolean>>;
  volume: number;
  defaultRemindBeforeMin: number;
  defaultTimerMode: 'task' | 'pomodoro';
  pomodoro: PomodoroConfig;
  /** Deadline reminders preselected on new deadline tasks (minutes before). */
  defaultDeadlineRemindersMin?: number[];
  /** Last due time used, prefilled on the next deadline task. */
  lastDueTime?: string;
  /** IANA time zone of the device, used by the push sender. */
  timezone?: string;
}

export interface Progress {
  streakClaimed: number[];
  celebratedDates: string[];
  /** Legend-rank badges whose legendary gift was already given. */
  legendClaimed?: string[];
}

export const CATEGORIES: Category[] = ['kuliah', 'belajar', 'tugas', 'istirahat', 'olahraga', 'pribadi'];
export const PRIORITIES: Priority[] = ['tinggi', 'sedang', 'rendah'];
export const MOODS: Mood[] = ['senang', 'biasa', 'sedih', 'capek', 'semangat'];
export const REMIND_OPTIONS = [0, 1, 5, 10, 15, 30, 60];

export const CATEGORY_LABEL: Record<Category, string> = {
  kuliah: 'Kuliah', belajar: 'Belajar', tugas: 'Tugas', istirahat: 'Istirahat', olahraga: 'Olahraga', pribadi: 'Pribadi',
};
export const CATEGORY_EMOJI: Record<Category, string> = {
  kuliah: '🎓', belajar: '📚', tugas: '📝', istirahat: '☕', olahraga: '🏃‍♀️', pribadi: '🌷',
};
export const PRIORITY_LABEL: Record<Priority, string> = { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' };
export const MOOD_LABEL: Record<Mood, string> = { senang: 'Senang', biasa: 'Biasa', sedih: 'Sedih', capek: 'Capek', semangat: 'Semangat' };
export const RARITY_LABEL: Record<Rarity, string> = { default: 'Bawaan', biasa: 'Biasa', langka: 'Langka', super: 'Super Langka', streak: 'Edisi Streak', legenda: 'Legenda' };
