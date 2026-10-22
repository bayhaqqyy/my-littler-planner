import { durationOf } from './occurrences';
import { ITEMS, MEMORY_FLOWER, STREAK_ITEMS } from './items';
import type { Category, Task, Wardrobe } from './types';
import { DEFAULT_OUTFIT, DEFAULT_HAIR } from './items';

export type Rng = () => number;
export type GiftRarity = 'biasa' | 'langka' | 'super';
export type BoxRarity = GiftRarity | 'legenda';

/**
 * Every completed task gives a gift box. What the category changes is the chance that the box
 * holds a NEW item (not one you already own): study, assignments and sport are generous;
 * lectures, personal and rest tasks less so. High priority and finishing a deadline ≥ 24 h early
 * each add a little.
 */
export const NEW_ITEM_CHANCE: Record<Category, number> = {
  belajar: 0.6, tugas: 0.6, olahraga: 0.6, istirahat: 0.35, kuliah: 0.25, pribadi: 0.25,
};
export const NEW_ITEM_BONUS = 0.1;
export const NEW_ITEM_MAX = 0.85;
/** Boxes made before newChance existed. */
export const DEFAULT_NEW_CHANCE = 0.4;

/** What's inside a box — rare contents are hard to get. */
export const ODDS = {
  normal: { biasa: 0.82, langka: 0.15, super: 0.03 },
  /** High priority (or ≥ 60 min), or a deadline finished ≥ 24 h early. */
  boosted: { biasa: 0.72, langka: 0.22, super: 0.06 },
  /** High priority AND a deadline finished ≥ 24 h early. */
  double: { biasa: 0.64, langka: 0.28, super: 0.08 },
};

export function isBoosted(task: Pick<Task, 'priority' | 'start' | 'end' | 'durationMin' | 'kind'>): boolean {
  // Deadline tasks have no session length; only priority counts (the early bonus is separate).
  if (task.kind === 'deadline') return task.priority === 'tinggi';
  return task.priority === 'tinggi' || durationOf(task) >= 60;
}

type GiftTask = Pick<Task, 'priority' | 'start' | 'end' | 'durationMin' | 'kind' | 'category'>;

/** Chance that a box from this task holds an item you don't own yet. */
export function newItemChance(task: GiftTask, early = false): number {
  const base = NEW_ITEM_CHANCE[task.category] ?? DEFAULT_NEW_CHANCE;
  const bonus = (task.priority === 'tinggi' ? NEW_ITEM_BONUS : 0) + (early && task.kind === 'deadline' ? NEW_ITEM_BONUS : 0);
  return Math.min(NEW_ITEM_MAX, base + bonus);
}

/** `early`: a deadline task finished ≥ 24 h before its original deadline (never for scheduled tasks). */
export function rollRarity(task: Pick<Task, 'priority' | 'start' | 'end' | 'durationMin' | 'kind'>, rng: Rng = Math.random, early = false): GiftRarity {
  const level = (isBoosted(task) ? 1 : 0) + (early && task.kind === 'deadline' ? 1 : 0);
  const o = level === 2 ? ODDS.double : level === 1 ? ODDS.boosted : ODDS.normal;
  const r = rng();
  if (r < o.biasa) return 'biasa';
  if (r < o.biasa + o.langka) return 'langka';
  return 'super';
}

/** The box every completed task gives: its rarity and its chance of holding a new item. */
export function rollGift(task: GiftTask, rng: Rng = Math.random, early = false): { rarity: GiftRarity; newChance: number } {
  return { rarity: rollRarity(task, rng, early), newChance: newItemChance(task, early) };
}

export interface PickResult { itemId: string; duplicate: boolean }

/**
 * What's in a box. With probability `newChance` it's an item of that rarity you don't own yet;
 * otherwise it's one you already have (no new item). If you own nothing to repeat yet, it's new
 * anyway. Legend boxes always try for a new legendary item.
 */
export function pickItem(rarity: BoxRarity, owned: string[], rng: Rng = Math.random, newChance = DEFAULT_NEW_CHANCE): PickResult {
  const have = new Set(owned);
  const tier = ITEMS.filter((i) => i.rarity === rarity);
  if (!tier.length) return { itemId: MEMORY_FLOWER, duplicate: false };
  const fresh = tier.filter((i) => !have.has(i.id));
  const known = tier.filter((i) => have.has(i.id));
  const wantNew = rarity === 'legenda' || rng() < newChance;
  const pool = (wantNew && fresh.length) || !known.length ? (fresh.length ? fresh : tier) : known;
  const itemId = pool[Math.floor(rng() * pool.length) % pool.length].id;
  return { itemId, duplicate: have.has(itemId) };
}

export function streakItem(milestone: number): string | undefined {
  return STREAK_ITEMS[milestone];
}

export function defaultWardrobe(): Wardrobe {
  return { owned: [DEFAULT_HAIR, DEFAULT_OUTFIT], equipped: { hair: DEFAULT_HAIR, outfit: DEFAULT_OUTFIT } };
}

/** Equip an item; outfit slot can never be emptied. Passing undefined itemId unequips the slot. */
export function equip(w: Wardrobe, slot: keyof Wardrobe['equipped'], itemId?: string): Wardrobe {
  if (slot === 'outfit' && !itemId) return w;
  return { ...w, equipped: { ...w.equipped, [slot]: itemId } };
}
