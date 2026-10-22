import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  addTime as tAddTime, afterBreak, afterFocus, currentStreak, durationOf, equip as wEquip, focusDelta, ITEM_BY_ID,
  MEMORY_FLOWER, newMilestones, newPhase, occKey, occurrencesOn, pause as tPause, phaseMinutes, pickItem, presetConfig,
  remainingSec, reschedule as dReschedule, reset as tReset, rollGift, DEFAULT_NEW_CHANCE, splitOccKey, start as tStart,
  streakItem, toDateStr, isDeadline, earlyBonus, wallToDate, dueAtOf, migrateTask, DEFAULT_DEADLINE_REMINDERS,
} from '@/domain';
import type {
  CompletionLog, DailyNote, FocusLog, GiftBox, Occurrence, PomodoroConfig, Profile, Progress, Settings, Slot, Task,
  TimerPhase, TimerState, Wardrobe,
} from '@/domain';
import { idbStorage } from '@/services/storage';
import { FEATURES } from '@/config/features';
import { uid } from '@/services/ids';
import { defaultProgress, defaultSettings, defaultWardrobe } from './defaults';

/** Synced tables. Single-row tables use the id "me". */
export type Table =
  | 'profiles' | 'settings' | 'tasks' | 'occurrences' | 'focus_logs' | 'completion_logs'
  | 'gift_boxes' | 'wardrobe' | 'daily_notes' | 'progress' | 'push_subscriptions';

export const TABLES: Table[] = [
  'profiles', 'settings', 'tasks', 'occurrences', 'focus_logs', 'completion_logs',
  'gift_boxes', 'wardrobe', 'daily_notes', 'progress', 'push_subscriptions',
];

export type CompletionEntry = CompletionLog & { id: string };
export type ActiveTimer = TimerState & { accruedRemaining: number };

export interface RowMeta { updatedAt: string; deleted?: boolean }

export interface DataState {
  /** Account the local data belongs to. Data is never shown to, or synced for, another account. */
  ownerId?: string;
  profile?: Profile;
  settings: Settings;
  tasks: Record<string, Task>;
  occurrences: Record<string, Occurrence>;
  focusLogs: Record<string, FocusLog>;
  completionLogs: Record<string, CompletionEntry>;
  giftBoxes: Record<string, GiftBox>;
  wardrobe: Wardrobe;
  notes: Record<string, DailyNote>;
  progress: Progress;
  pushSubs: Record<string, { id: string; endpoint: string; p256dh: string; auth: string; userAgent: string; createdAt: string }>;
  timer?: ActiveTimer;
  /** Per-row last local write time, used for last-write-wins sync. */
  meta: Partial<Record<Table, Record<string, RowMeta>>>;
  /** Rows changed locally and not yet pushed. */
  dirty: Partial<Record<Table, Record<string, true>>>;
  /** Pull cursor (server_updated_at) per table. */
  cursor: Partial<Record<Table, string>>;
}

export interface CompleteResult {
  gift?: GiftBox;
  /** Deadline task finished ≥ 24 h before its original deadline (better gift odds). */
  early?: boolean;
  /** Deadline task finished after its deadline. */
  late?: boolean;
  streakGifts: GiftBox[];
  streak?: number;
  firstToday: boolean;
  allDone: boolean;
}

/** `duplicate`: the box held an item you already own (nothing new). */
export interface OpenResult { itemId: string; memory: boolean; duplicate: boolean }

export interface Actions {
  hydrated: boolean;
  setProfile(p: Profile): void;
  setUsername(name: string): void;
  updateSettings(patch: Partial<Settings>): void;
  saveTask(t: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'> & { id?: string; subtasks?: Task['subtasks'] }): Task;
  deleteTask(id: string): void;
  addSubtask(taskId: string, text: string): void;
  toggleSubtask(taskId: string, subId: string): void;
  removeSubtask(taskId: string, subId: string): void;
  complete(key: string, opts?: { timed?: boolean }): CompleteResult;
  uncomplete(key: string): void;
  skip(key: string): void;
  rescheduleOcc(key: string, toDate: string, times?: { start?: string; end?: string }): void;
  /** Move one deadline occurrence to a new 'YYYY-MM-DDTHH:mm' (other occurrences unchanged). */
  rescheduleDeadline(key: string, dueAt: string): void;
  /** Convert v1 tasks (date-only `deadline`) to the deadline model; pushes the result. */
  migrateTasks(): void;
  addFocus(key: string, seconds: number): void;
  // timer
  startTimer(key: string, mode: 'task' | 'pomodoro', cfg?: PomodoroConfig): void;
  timerPlay(): void;
  timerPause(): void;
  timerReset(): void;
  timerAdd(min: number): void;
  timerCancel(): void;
  timerTick(force?: boolean): { finished?: TimerPhase };
  timerNextPhase(phase: TimerPhase, run: boolean): void;
  setTimerPomodoro(cfg: PomodoroConfig): void;
  // rewards
  openGift(id: string): OpenResult | undefined;
  /** Give one Legenda box per newly earned Legend-rank badge (each badge once). */
  claimLegendGifts(badges: { id: string; name: string }[]): GiftBox[];
  equip(slot: Slot, itemId?: string): void;
  markCelebrated(date: string): boolean;
  // notes
  saveNote(date: string, patch: Partial<DailyNote>): void;
  // push
  savePushSub(sub: DataState['pushSubs'][string]): void;
  // sync plumbing
  applyRemote(table: Table, id: string, data: unknown, updatedAt: string, deleted: boolean): void;
  clearDirty(table: Table, ids: { id: string; updatedAt: string }[]): void;
  setCursor(table: Table, c: string): void;
  /** Wipe all local data and mark it as belonging to `ownerId` (or nobody). */
  resetAll(ownerId?: string): void;
  setOwner(ownerId: string): void;
}

export type Store = DataState & Actions;

const nowIso = () => new Date().toISOString();
const today = () => toDateStr(new Date());
export const focusKey = (date: string, category: string) => `${date}|${category}`;

export const emptyData = (): DataState => ({
  ownerId: undefined,
  profile: undefined,
  settings: defaultSettings(),
  tasks: {},
  occurrences: {},
  focusLogs: {},
  completionLogs: {},
  giftBoxes: {},
  wardrobe: defaultWardrobe(),
  notes: {},
  progress: defaultProgress(),
  pushSubs: {},
  timer: undefined,
  meta: {},
  dirty: {},
  cursor: {},
});

/** Mark rows as written now (and dirty for sync). */
function touch(s: DataState, entries: [Table, string, boolean?][]): Pick<DataState, 'meta' | 'dirty'> {
  const meta = { ...s.meta };
  const dirty = { ...s.dirty };
  const at = nowIso();
  for (const [t, id, deleted] of entries) {
    meta[t] = { ...meta[t], [id]: { updatedAt: at, ...(deleted ? { deleted: true } : {}) } };
    dirty[t] = { ...dirty[t], [id]: true };
  }
  return { meta, dirty };
}

function getOcc(s: DataState, key: string): Occurrence {
  const { taskId, date } = splitOccKey(key);
  return s.occurrences[key] ?? { key, taskId, date, focusSec: 0, rewarded: false };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...emptyData(),
      hydrated: false,

      setProfile: (p) => set((s) => ({ profile: p, ...touch(s, [['profiles', 'me']]) })),

      setUsername: (name) => set((s) => (s.profile ? { profile: { ...s.profile, username: name.trim() }, ...touch(s, [['profiles', 'me']]) } : {})),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch }, ...touch(s, [['settings', 'me']]) })),

      saveTask: (input) => {
        const s = get();
        const at = nowIso();
        const prev = input.id ? s.tasks[input.id] : undefined;
        const task: Task = {
          ...prev,
          ...input,
          id: input.id ?? uid(),
          subtasks: input.subtasks ?? prev?.subtasks ?? [],
          createdAt: prev?.createdAt ?? at,
          updatedAt: at,
        } as Task;
        set({ tasks: { ...s.tasks, [task.id]: task }, ...touch(s, [['tasks', task.id]]) });
        return task;
      },

      deleteTask: (id) => set((s) => {
        const t = s.tasks[id];
        if (!t) return {};
        const at = nowIso();
        return { tasks: { ...s.tasks, [id]: { ...t, deletedAt: at, updatedAt: at } }, ...touch(s, [['tasks', id]]),
          timer: s.timer && splitOccKey(s.timer.occurrenceKey).taskId === id ? undefined : s.timer };
      }),

      addSubtask: (taskId, text) => set((s) => {
        const t = s.tasks[taskId];
        if (!t || !text.trim()) return {};
        const nt = { ...t, subtasks: [...t.subtasks, { id: uid(), text: text.trim(), done: false }], updatedAt: nowIso() };
        return { tasks: { ...s.tasks, [taskId]: nt }, ...touch(s, [['tasks', taskId]]) };
      }),

      toggleSubtask: (taskId, subId) => set((s) => {
        const t = s.tasks[taskId];
        if (!t) return {};
        const nt = { ...t, subtasks: t.subtasks.map((x) => (x.id === subId ? { ...x, done: !x.done } : x)), updatedAt: nowIso() };
        return { tasks: { ...s.tasks, [taskId]: nt }, ...touch(s, [['tasks', taskId]]) };
      }),

      removeSubtask: (taskId, subId) => set((s) => {
        const t = s.tasks[taskId];
        if (!t) return {};
        const nt = { ...t, subtasks: t.subtasks.filter((x) => x.id !== subId), updatedAt: nowIso() };
        return { tasks: { ...s.tasks, [taskId]: nt }, ...touch(s, [['tasks', taskId]]) };
      }),

      complete: (key, opts) => {
        const s = get();
        const occ = getOcc(s, key);
        const task = s.tasks[occ.taskId];
        const res: CompleteResult = { streakGifts: [], firstToday: false, allDone: false };
        if (!task || occ.doneAt) return res;
        const at = nowIso();
        const day = today();
        const logs = Object.values(s.completionLogs);
        res.firstToday = !logs.some((l) => toDateStr(new Date(l.completedAt)) === day);

        const entries: [Table, string, boolean?][] = [['occurrences', key]];
        const giftBoxes = { ...s.giftBoxes };
        const now = new Date(at);
        if (isDeadline(task)) {
          res.early = earlyBonus(task, occ.date, now);
          res.late = wallToDate(dueAtOf(task, occ.date, occ)).getTime() < now.getTime();
        }
        // Every task gives a box; the category sets how likely it holds a NEW item (NEW_ITEM_CHANCE).
        const roll = FEATURES.gifts && !occ.rewarded ? rollGift(task, Math.random, !!res.early) : undefined;
        if (roll) {
          const gift: GiftBox = { id: uid(), rarity: roll.rarity, newChance: roll.newChance, source: task.title, createdAt: at, ...(res.early ? { early: true } : {}) };
          giftBoxes[gift.id] = gift;
          entries.push(['gift_boxes', gift.id]);
          res.gift = gift;
        }
        const logId = uid();
        const log: CompletionEntry = {
          id: logId, occurrenceKey: key, title: task.title, category: task.category, completedAt: at,
          durationMin: isDeadline(task) ? Math.round(occ.focusSec / 60) : durationOf(task), timed: (opts?.timed ?? false) || occ.focusSec > 0,
        };
        entries.push(['completion_logs', logId]);
        const completionLogs = { ...s.completionLogs, [logId]: log };

        // Streak milestones → special gift boxes (each once).
        const streak = currentStreak(Object.values(completionLogs), day);
        res.streak = streak;
        const progress = { ...s.progress };
        // Milestones aren't claimed while gifts are off, so they can still be given if gifts come back.
        for (const m of FEATURES.gifts ? newMilestones(streak, s.progress.streakClaimed) : []) {
          const gift: GiftBox = { id: uid(), rarity: 'streak', source: `Streak ${m} hari`, itemId: streakItem(m), createdAt: at };
          giftBoxes[gift.id] = gift;
          entries.push(['gift_boxes', gift.id]);
          res.streakGifts.push(gift);
          progress.streakClaimed = [...progress.streakClaimed, m];
        }
        if (res.streakGifts.length) entries.push(['progress', 'me']);

        const occurrences = { ...s.occurrences, [key]: { ...occ, doneAt: at, rewarded: true, ...(res.late ? { completedLate: true } : {}) } };
        const tasksArr = Object.values(s.tasks);
        const views = occurrencesOn(tasksArr, occ.date, occurrences);
        res.allDone = occ.date === day && views.length > 0 && views.every((v) => v.done);

        set({
          occurrences, giftBoxes, completionLogs, progress, ...touch(s, entries),
          timer: s.timer?.occurrenceKey === key ? undefined : s.timer,
        });
        return res;
      },

      uncomplete: (key) => set((s) => {
        const occ = s.occurrences[key];
        if (!occ?.doneAt) return {};
        const logs = Object.values(s.completionLogs).filter((l) => l.occurrenceKey === key);
        const completionLogs = { ...s.completionLogs };
        logs.forEach((l) => delete completionLogs[l.id]);
        return {
          occurrences: { ...s.occurrences, [key]: { ...occ, doneAt: undefined, completedLate: undefined } },
          completionLogs,
          ...touch(s, [['occurrences', key], ...logs.map((l) => ['completion_logs', l.id, true] as [Table, string, boolean])]),
        };
      }),

      skip: (key) => set((s) => ({
        occurrences: { ...s.occurrences, [key]: { ...getOcc(s, key), skipped: true } },
        ...touch(s, [['occurrences', key]]),
        timer: s.timer?.occurrenceKey === key ? undefined : s.timer,
      })),

      rescheduleOcc: (key, toDate, times) => {
        const s = get();
        const { taskId, date } = splitOccKey(key);
        const t = s.tasks[taskId];
        if (!t) return;
        const r = dReschedule(t, date, toDate, uid(), nowIso(), times);
        const tasks = { ...s.tasks };
        const occurrences = { ...s.occurrences };
        const entries: [Table, string][] = [];
        if (r.updated) {
          tasks[taskId] = r.updated;
          entries.push(['tasks', taskId]);
          // carry the occurrence record (focus, reward) to the new date
          const old = s.occurrences[key];
          if (old && date !== toDate) {
            const nk = occKey(taskId, toDate);
            occurrences[nk] = { ...old, key: nk, date: toDate };
            delete occurrences[key];
            entries.push(['occurrences', nk]);
          }
        }
        if (r.created) { tasks[r.created.id] = r.created; entries.push(['tasks', r.created.id]); }
        if (r.skipKey) { occurrences[r.skipKey] = { ...getOcc(s, r.skipKey), skipped: true }; entries.push(['occurrences', r.skipKey]); }
        set({ tasks, occurrences, ...touch(s, entries) });
      },

      rescheduleDeadline: (key, dueAt) => set((s) => ({
        occurrences: { ...s.occurrences, [key]: { ...getOcc(s, key), dueAt } },
        ...touch(s, [['occurrences', key]]),
      })),

      migrateTasks: () => set((s) => {
        const reminders = s.settings.defaultDeadlineRemindersMin ?? DEFAULT_DEADLINE_REMINDERS;
        const changed = Object.values(s.tasks).map((t) => [t, migrateTask(t, reminders)] as const).filter(([a, b]) => a !== b);
        if (!changed.length) return {};
        const tasks = { ...s.tasks };
        for (const [, m] of changed) tasks[m.id] = { ...m, updatedAt: nowIso() };
        return { tasks, ...touch(s, changed.map(([, m]) => ['tasks', m.id] as [Table, string])) };
      }),

      addFocus: (key, seconds) => {
        if (seconds <= 0) return;
        set((s) => {
          const occ = getOcc(s, key);
          const task = s.tasks[occ.taskId];
          if (!task) return {};
          const day = today();
          const fk = focusKey(day, task.category);
          const prev = s.focusLogs[fk] ?? { date: day, category: task.category, seconds: 0 };
          return {
            occurrences: { ...s.occurrences, [key]: { ...occ, focusSec: occ.focusSec + seconds } },
            focusLogs: { ...s.focusLogs, [fk]: { ...prev, seconds: prev.seconds + seconds } },
            ...touch(s, [['occurrences', key], ['focus_logs', fk]]),
          };
        });
      },

      startTimer: (key, mode, cfg) => {
        const s = get();
        const { taskId } = splitOccKey(key);
        const task = s.tasks[taskId];
        if (!task) return;
        // Deadline tasks have no session length: their timer is always Pomodoro (PRD).
        if (isDeadline(task)) mode = 'pomodoro';
        const pomodoro = mode === 'pomodoro' ? cfg ?? s.settings.pomodoro : undefined;
        const minutes = pomodoro ? pomodoro.focusMin : durationOf(task);
        const base: TimerState = { occurrenceKey: key, mode, pomodoro, phase: 'focus', completedSessions: 0, totalSec: 0, remainingSec: 0, state: 'idle' };
        const t = newPhase(base, 'focus', minutes, Date.now(), false);
        set({ timer: { ...t, accruedRemaining: t.remainingSec } });
      },

      timerPlay: () => set((s) => (s.timer ? { timer: { ...tStart(s.timer, Date.now()), accruedRemaining: s.timer.accruedRemaining } } : {})),

      timerPause: () => {
        get().timerTick(true);
        set((s) => (s.timer ? { timer: { ...tPause(s.timer, Date.now()), accruedRemaining: s.timer.accruedRemaining } } : {}));
      },

      timerReset: () => {
        get().timerTick(true);
        set((s) => {
          if (!s.timer) return {};
          const t = tReset(s.timer);
          return { timer: { ...t, accruedRemaining: t.remainingSec } };
        });
      },

      timerAdd: (min) => {
        get().timerTick(true);
        set((s) => {
          if (!s.timer) return {};
          const t = tAddTime(s.timer, min, Date.now());
          return { timer: { ...t, accruedRemaining: s.timer.accruedRemaining + min * 60 } };
        });
      },

      timerCancel: () => {
        get().timerTick(true);
        set({ timer: undefined });
      },

      /** Accrue focus time and detect the end of a phase. Safe to call often. */
      timerTick: (force) => {
        const s = get();
        const t = s.timer;
        if (!t) return {};
        const rem = remainingSec(t, Date.now());
        const delta = focusDelta(t.phase, t.accruedRemaining, rem);
        // Accrue in chunks to avoid writing/syncing every second.
        const accrue = force || rem <= 0 || delta >= 15;
        if (accrue && delta > 0) get().addFocus(t.occurrenceKey, delta);
        const cur = get().timer;
        if (!cur) return {};
        if (cur.state === 'running' && rem <= 0) {
          let completedSessions = cur.completedSessions;
          if (cur.mode === 'pomodoro' && cur.pomodoro) {
            completedSessions = cur.phase === 'focus' ? afterFocus(cur.completedSessions, cur.pomodoro).completedSessions : afterBreak(cur.phase, cur.completedSessions);
          }
          set({ timer: { ...cur, state: 'finished', remainingSec: 0, endsAt: undefined, accruedRemaining: 0, completedSessions } });
          return { finished: cur.phase };
        }
        if (accrue && rem !== cur.accruedRemaining) set({ timer: { ...cur, accruedRemaining: rem } });
        return {};
      },

      timerNextPhase: (phase, run) => set((s) => {
        const t = s.timer;
        if (!t) return {};
        const cfg = t.pomodoro ?? s.settings.pomodoro;
        const nt = newPhase({ ...t, mode: t.mode === 'task' && phase === 'focus' ? 'task' : t.mode }, phase, phaseMinutes(cfg, phase), Date.now(), run);
        return { timer: { ...nt, pomodoro: t.pomodoro ?? cfg, accruedRemaining: nt.remainingSec } };
      }),

      setTimerPomodoro: (cfg) => set((s) => {
        const t = s.timer;
        if (!t || t.state === 'running') return {};
        const nt = newPhase({ ...t, mode: 'pomodoro', pomodoro: cfg, completedSessions: 0 }, 'focus', cfg.focusMin, Date.now(), false);
        return { timer: { ...nt, accruedRemaining: nt.remainingSec } };
      }),

      openGift: (id) => {
        const s = get();
        const box = s.giftBoxes[id];
        if (!box) return undefined;
        // Streak boxes hold their fixed item (a super one if it's already owned); other boxes are random
        // within their rarity and may repeat something you already have.
        let pick = box.itemId && !s.wardrobe.owned.includes(box.itemId)
          ? { itemId: box.itemId, duplicate: false }
          : pickItem(box.rarity === 'streak' ? 'super' : box.rarity, s.wardrobe.owned, Math.random, box.newChance ?? DEFAULT_NEW_CHANCE);
        const itemId = pick.itemId;
        const giftBoxes = { ...s.giftBoxes };
        delete giftBoxes[id];
        const entries: [Table, string, boolean?][] = [['gift_boxes', id, true]];
        const memory = itemId === MEMORY_FLOWER;
        const isNew = !memory && !pick.duplicate;
        const wardrobe = isNew ? { ...s.wardrobe, owned: [...s.wardrobe.owned, itemId] } : s.wardrobe;
        if (isNew) entries.push(['wardrobe', 'me']);
        set({ giftBoxes, wardrobe, ...touch(s, entries) });
        return { itemId, memory, duplicate: pick.duplicate };
      },

      claimLegendGifts: (badges) => {
        if (!FEATURES.gifts) return [];
        const s = get();
        const claimed = s.progress.legendClaimed ?? [];
        const fresh = badges.filter((b) => !claimed.includes(b.id));
        if (!fresh.length) return [];
        const at = nowIso();
        const giftBoxes = { ...s.giftBoxes };
        const boxes = fresh.map((b) => ({ id: uid(), rarity: 'legenda' as const, source: `Badge ${b.name}`, createdAt: at }));
        boxes.forEach((g) => { giftBoxes[g.id] = g; });
        set({
          giftBoxes,
          progress: { ...s.progress, legendClaimed: [...claimed, ...fresh.map((b) => b.id)] },
          ...touch(s, [...boxes.map((g) => ['gift_boxes', g.id] as [Table, string]), ['progress', 'me']]),
        });
        return boxes;
      },

      equip: (slot, itemId) => set((s) => {
        if (itemId && !ITEM_BY_ID[itemId]) return {};
        return { wardrobe: wEquip(s.wardrobe, slot, itemId), ...touch(s, [['wardrobe', 'me']]) };
      }),

      markCelebrated: (date) => {
        const s = get();
        if (s.progress.celebratedDates.includes(date)) return false;
        set({ progress: { ...s.progress, celebratedDates: [...s.progress.celebratedDates, date] }, ...touch(s, [['progress', 'me']]) });
        return true;
      },

      saveNote: (date, patch) => set((s) => {
        const prev = s.notes[date] ?? { date, text: '', reflection: '' };
        return { notes: { ...s.notes, [date]: { ...prev, ...patch, date } }, ...touch(s, [['daily_notes', date]]) };
      }),

      savePushSub: (sub) => set((s) => ({ pushSubs: { ...s.pushSubs, [sub.id]: sub }, ...touch(s, [['push_subscriptions', sub.id]]) })),

      applyRemote: (table, id, data, updatedAt, deleted) => set((s) => {
        const local = s.meta[table]?.[id];
        if (local && local.updatedAt > updatedAt) return {};
        const meta = { ...s.meta, [table]: { ...s.meta[table], [id]: { updatedAt, ...(deleted ? { deleted: true } : {}) } } };
        const dirty = { ...s.dirty, [table]: { ...s.dirty[table] } };
        delete dirty[table]![id];
        const patch = applyRow(s, table, id, data, deleted);
        return { ...patch, meta, dirty };
      }),

      clearDirty: (table, ids) => set((s) => {
        const d = { ...s.dirty[table] };
        for (const { id, updatedAt } of ids) if (s.meta[table]?.[id]?.updatedAt === updatedAt) delete d[id];
        return { dirty: { ...s.dirty, [table]: d } };
      }),

      setCursor: (table, c) => set((s) => ({ cursor: { ...s.cursor, [table]: c } })),

      resetAll: (ownerId) => set({ ...emptyData(), ownerId }),

      setOwner: (ownerId) => set({ ownerId }),
    }),
    {
      name: 'mlp-store',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => {
        const { hydrated: _h, ...rest } = s;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as Partial<Store>;
      },
      onRehydrateStorage: () => () => {
        useStore.getState().migrateTasks();
        useStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Merge a remote row into local state. */
function applyRow(s: DataState, table: Table, id: string, data: any, deleted: boolean): Partial<DataState> {
  const drop = <T,>(rec: Record<string, T>) => { const r = { ...rec }; delete r[id]; return r; };
  switch (table) {
    case 'profiles': return deleted ? {} : { profile: { ...s.profile, ...data } };
    case 'settings': return deleted ? {} : { settings: { ...defaultSettings(), ...data } };
    case 'wardrobe': return deleted ? {} : { wardrobe: data };
    case 'progress': return deleted ? {} : { progress: { ...defaultProgress(), ...data } };
    // Rows from older app versions get the deadline model on arrival.
    case 'tasks': return { tasks: deleted ? drop(s.tasks) : { ...s.tasks, [id]: migrateTask(data, s.settings.defaultDeadlineRemindersMin ?? DEFAULT_DEADLINE_REMINDERS) } };
    case 'occurrences': return { occurrences: deleted ? drop(s.occurrences) : { ...s.occurrences, [id]: data } };
    case 'focus_logs': return { focusLogs: deleted ? drop(s.focusLogs) : { ...s.focusLogs, [id]: data } };
    case 'completion_logs': return { completionLogs: deleted ? drop(s.completionLogs) : { ...s.completionLogs, [id]: { ...data, id } } };
    case 'gift_boxes': return { giftBoxes: deleted ? drop(s.giftBoxes) : { ...s.giftBoxes, [id]: data } };
    case 'daily_notes': return { notes: deleted ? drop(s.notes) : { ...s.notes, [id]: data } };
    case 'push_subscriptions': return { pushSubs: deleted ? drop(s.pushSubs) : { ...s.pushSubs, [id]: data } };
  }
}

/** Current local value of a row, for pushing. */
export function rowData(s: DataState, table: Table, id: string): unknown {
  switch (table) {
    case 'profiles': return s.profile;
    case 'settings': return s.settings;
    case 'wardrobe': return s.wardrobe;
    case 'progress': return s.progress;
    case 'tasks': return s.tasks[id];
    case 'occurrences': return s.occurrences[id];
    case 'focus_logs': return s.focusLogs[id];
    case 'completion_logs': return s.completionLogs[id];
    case 'gift_boxes': return s.giftBoxes[id];
    case 'daily_notes': return s.notes[id];
    case 'push_subscriptions': return s.pushSubs[id];
  }
}

export const presetFor = presetConfig;
