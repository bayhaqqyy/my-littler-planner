import { toDateStr, weekdayOf } from './dates';
import { ITEMS } from './items';
import { longestStreak, activeDays } from './streak';
import { totalFocusSec } from './levels';
import { CATEGORIES } from './types';
import type { CompletionLog, DailyNote, FocusLog, Progress } from './types';

export interface Badge {
  id: string;
  name: string;
  rule: string;
  emoji: string;
  earned: boolean;
  current: number;
  target: number;
  group: string;
  /** 0 = first (easiest) tier of its series */
  tier: number;
  /** Visual rank 0..6 for the medal art, comparable across series of different lengths. */
  rank: number;
}

export const MAX_BADGE_RANK = 6;
/** Spread a series' tiers over ranks 0..6; a single-tier badge sits in the middle. */
export const badgeRank = (tier: number, tiers: number) =>
  tiers <= 1 ? 3 : Math.round((tier * MAX_BADGE_RANK) / (tiers - 1));

export interface BadgeInput {
  completions: CompletionLog[];
  focus: FocusLog[];
  progress: Pick<Progress, 'celebratedDates'>;
  notes?: DailyNote[];
  owned?: string[];
}

/** Longest run of consecutive dates in a list of YYYY-MM-DD. */
function longestRun(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  let best = 0, run = 0, prev = 0;
  for (const d of sorted) {
    const t = Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
    run = prev && t - prev === 86400000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

function maxPerDay(dates: string[]): number {
  const m = new Map<string, number>();
  for (const d of dates) m.set(d, (m.get(d) ?? 0) + 1);
  return Math.max(0, ...m.values());
}

type Tier = [target: number, name: string];
interface Series { group: string; emoji: string; rule: (t: number) => string; tiers: Tier[]; value: number }

/** All badges with progress. Early tiers are easy (often the first time), later tiers take months. */
export function badges(input: BadgeInput): Badge[] {
  const { completions, focus, progress, notes = [], owned = [] } = input;
  const local = completions.map((c) => ({ ...c, d: new Date(c.completedAt) }));
  const dates = local.map((c) => toDateStr(c.d));
  const count = (cats: string[]) => completions.filter((c) => cats.includes(c.category)).length;
  const focusByDay = new Map<string, number>();
  for (const f of focus) focusByDay.set(f.date, (focusByDay.get(f.date) ?? 0) + f.seconds);
  const extraItems = ITEMS.filter((i) => i.rarity !== 'default').map((i) => i.id);
  const ownedExtra = owned.filter((id) => extraItems.includes(id)).length;
  const hours = totalFocusSec(focus) / 3600;

  const series: Series[] = [
    { group: 'Tugas selesai', emoji: '🌸', rule: (t) => `Selesaikan ${t} tugas`, value: completions.length,
      tiers: [[1, 'First Bloom'], [10, 'Busy Bee'], [50, 'Task Tamer'], [100, 'Centurion'], [250, 'Task Wizard'], [500, 'Task Legend'], [1000, 'Thousand Petals']] },
    { group: 'Waktu fokus', emoji: '⏱️', rule: (t) => `Total fokus ${t} jam`, value: hours,
      tiers: [[1, 'Focus Seedling'], [5, 'Focus Master'], [10, 'Deep Diver'], [25, 'Focus Ninja'], [50, 'Zen Scholar'], [100, 'Time Bender'], [250, 'Focus Legend']] },
    { group: 'Streak', emoji: '🔥', rule: (t) => `Streak ${t} hari berturut-turut`, value: longestStreak(completions),
      tiers: [[3, 'Warming Up'], [7, 'Consistency Star'], [14, 'Two-Week Glow'], [30, 'Monthly Magic'], [60, 'Unstoppable'], [100, 'Hundred Days'], [365, 'Year of Bloom']] },
    { group: 'Hari aktif', emoji: '📅', rule: (t) => `Aktif menyelesaikan tugas di ${t} hari berbeda`, value: activeDays(completions).size,
      tiers: [[7, 'Week One'], [30, 'Regular'], [100, 'Devoted'], [365, 'Lifer']] },
    { group: 'Belajar & kuliah', emoji: '📚', rule: (t) => `${t} tugas Belajar/Kuliah selesai`, value: count(['belajar', 'kuliah']),
      tiers: [[5, 'Bookworm'], [10, 'Study Star'], [50, 'Scholar'], [150, 'Professor'], [400, 'Genius']] },
    { group: 'Olahraga', emoji: '🏃‍♀️', rule: (t) => `${t} tugas Olahraga selesai`, value: count(['olahraga']),
      tiers: [[1, 'Move It'], [10, 'Sporty'], [50, 'Athlete']] },
    { group: 'Istirahat', emoji: '☕', rule: (t) => `${t} tugas Istirahat selesai`, value: count(['istirahat']),
      tiers: [[1, 'Take a Break'], [5, 'Self-Care'], [15, 'Calm Cloud']] },
    { group: 'Pakai timer', emoji: '🍅', rule: (t) => `${t} tugas diselesaikan dengan timer`, value: completions.filter((c) => c.timed).length,
      tiers: [[1, 'Timer Rookie'], [25, 'Pomodoro Pal'], [100, 'Tomato Farmer']] },
    { group: 'Pagi hari', emoji: '🐤', rule: (t) => `${t} tugas selesai sebelum 08.00`, value: local.filter((c) => c.d.getHours() < 8).length,
      tiers: [[1, 'Early Bird'], [10, 'Morning Person'], [50, 'Sunrise Club']] },
    { group: 'Malam hari', emoji: '🦉', rule: (t) => `${t} tugas selesai setelah 21.00`, value: local.filter((c) => c.d.getHours() >= 21).length,
      tiers: [[1, 'Night Owl'], [10, 'Midnight Scholar'], [50, 'Moonlight Club']] },
    { group: 'Akhir pekan', emoji: '🎈', rule: (t) => `Aktif di ${t} hari Sabtu/Minggu`, value: new Set(dates.filter((d) => [0, 6].includes(weekdayOf(d)))).size,
      tiers: [[1, 'Weekend Warrior'], [10, 'Weekend Hero'], [30, 'Weekend Legend']] },
    { group: 'Hari sempurna', emoji: '👑', rule: (t) => `Semua tugas selesai di ${t} hari`, value: progress.celebratedDates.length,
      tiers: [[1, 'Super Planner'], [7, 'Perfect Week'], [30, 'Perfect Month']] },
    { group: 'Sempurna beruntun', emoji: '💎', rule: (t) => `Semua tugas selesai ${t} hari berturut-turut`, value: longestRun(progress.celebratedDates),
      tiers: [[3, 'Flawless Trio'], [7, 'Flawless Week']] },
    { group: 'Hari produktif', emoji: '⚡', rule: (t) => `${t} tugas selesai dalam satu hari`, value: maxPerDay(dates),
      tiers: [[5, 'Power Day'], [10, 'Super Day']] },
    { group: 'Maraton fokus', emoji: '🏅', rule: (t) => `Fokus ${t} jam dalam satu hari`, value: Math.max(0, ...focusByDay.values()) / 3600,
      tiers: [[2, 'Marathon'], [4, 'Ultra Marathon']] },
    { group: 'Penjelajah', emoji: '🧭', rule: () => 'Selesaikan tugas di semua 6 kategori', value: new Set(completions.map((c) => c.category)).size,
      tiers: [[CATEGORIES.length, 'Explorer']] },
    { group: 'Catatan harian', emoji: '📝', rule: (t) => `Tulis catatan atau refleksi di ${t} hari`, value: notes.filter((n) => n.text.trim() || n.reflection.trim()).length,
      tiers: [[1, 'Dear Diary'], [7, 'Journaler'], [30, 'Storyteller'], [100, 'Memoir']] },
    { group: 'Mood', emoji: '😊', rule: (t) => `Catat mood di ${t} hari`, value: notes.filter((n) => n.mood).length,
      tiers: [[1, 'Mood Check'], [7, 'Feelings Friend'], [30, 'Mood Keeper']] },
    { group: 'Lemari', emoji: '👗', rule: (t) => (t >= extraItems.length ? 'Kumpulkan semua item lemari' : `Kumpulkan ${t} item lemari`), value: ownedExtra,
      tiers: [[5, 'Fashionista'], [15, 'Stylist'], [extraItems.length, 'Collector']] },
  ];

  return series.flatMap((s) =>
    s.tiers.map(([target, name], tier) => ({
      id: `${s.group}-${tier}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name, emoji: s.emoji, group: s.group, tier, target, rank: badgeRank(tier, s.tiers.length),
      rule: s.rule(target),
      current: Math.min(target, Math.floor(s.value * 10) / 10),
      earned: s.value >= target,
    })),
  );
}

/** Unearned badges closest to completion — the "almost there" list. */
export function nextBadges(list: Badge[], n = 3): Badge[] {
  // Only the next tier of each series, so the list isn't three tiers of the same thing.
  const next = new Map<string, Badge>();
  for (const b of list) if (!b.earned && !next.has(b.group)) next.set(b.group, b);
  return [...next.values()].filter((b) => b.current > 0).sort((a, b) => b.current / b.target - a.current / a.target).slice(0, n);
}
