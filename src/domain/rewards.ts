import { durationOf } from './occurrences';
import { ITEMS, MEMORY_FLOWER, STREAK_ITEMS } from './items';
import type { Rarity, Task, Wardrobe } from './types';
import { DEFAULT_OUTFIT, DEFAULT_HAIR } from './items';

export type Rng = () => number;
export type GiftRarity = 'biasa' | 'langka' | 'super';

export const ODDS = {
  normal: { biasa: 0.7, langka: 0.25, super: 0.05 },
  boosted: { biasa: 0.55, langka: 0.35, super: 0.1 },
  /** High priority AND a deadline finished ≥ 24 h early. */
  double: { biasa: 0.45, langka: 0.4, super: 0.15 },
};

export function isBoosted(task: Pick<Task, 'priority' | 'start' | 'end' | 'durationMin' | 'kind'>): boolean {
  // Deadline tasks have no session length; only priority counts (the early bonus is separate).
  if (task.kind === 'deadline') return task.priority === 'tinggi';
  return task.priority === 'tinggi' || durationOf(task) >= 60;
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

const TIERS: GiftRarity[] = ['biasa', 'langka', 'super'];

/** Fallback order: the tier itself, then lower tiers (closest first), then higher tiers. */
export function tierOrder(r: GiftRarity): GiftRarity[] {
  const i = TIERS.indexOf(r);
  return [r, ...TIERS.slice(0, i).reverse(), ...TIERS.slice(i + 1)];
}

/** Pick an unowned item for the rarity, falling back across tiers; memory flower if everything is owned. */
export function pickItem(rarity: GiftRarity, owned: string[], rng: Rng = Math.random): string {
  const have = new Set(owned);
  for (const tier of tierOrder(rarity)) {
    const pool = ITEMS.filter((i) => i.rarity === tier && !have.has(i.id));
    if (pool.length) return pool[Math.floor(rng() * pool.length) % pool.length].id;
  }
  return MEMORY_FLOWER;
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
