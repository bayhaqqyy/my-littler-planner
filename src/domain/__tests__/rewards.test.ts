import { equip, defaultWardrobe, newItemChance, pickItem, rollGift, rollRarity, streakItem } from '../rewards';
import { ITEMS } from '../items';
import { task } from './helpers';

const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };

describe('every task gives a box; the category sets the chance of a NEW item', () => {
  it('generous for belajar / tugas / olahraga, smaller for istirahat / kuliah / pribadi', () => {
    expect(newItemChance(task({ category: 'belajar' }))).toBe(0.6);
    expect(newItemChance(task({ category: 'tugas' }))).toBe(0.6);
    expect(newItemChance(task({ category: 'olahraga' }))).toBe(0.6);
    expect(newItemChance(task({ category: 'istirahat' }))).toBe(0.35);
    expect(newItemChance(task({ category: 'kuliah' }))).toBe(0.25);
    expect(newItemChance(task({ category: 'pribadi' }))).toBe(0.25);
  });
  it('high priority and an early deadline each add 10%, capped', () => {
    expect(newItemChance(task({ category: 'kuliah', priority: 'tinggi' }))).toBeCloseTo(0.35);
    expect(newItemChance(task({ category: 'belajar', priority: 'tinggi', kind: 'deadline' }), true)).toBeCloseTo(0.8);
  });
  it('always returns a box', () => {
    for (const category of ['belajar', 'kuliah', 'pribadi'] as const) {
      expect(rollGift(task({ category }), seq(0.99))).toMatchObject({ rarity: expect.any(String) });
    }
  });
});

describe('rarity odds (harder)', () => {
  it('normal 82/15/3', () => {
    expect(rollRarity(task(), seq(0.819))).toBe('biasa');
    expect(rollRarity(task(), seq(0.82))).toBe('langka');
    expect(rollRarity(task(), seq(0.969))).toBe('langka');
    expect(rollRarity(task(), seq(0.97))).toBe('super');
  });
  it('boosted 72/22/6 for high priority or >= 60 minutes', () => {
    expect(rollRarity(task({ priority: 'tinggi' }), seq(0.73))).toBe('langka');
    expect(rollRarity(task({ start: '08:00', end: '09:00' }), seq(0.95))).toBe('super');
    expect(rollRarity(task({ start: '08:00', end: '08:59' }), seq(0.95))).toBe('langka');
  });
});

describe('what is inside a box', () => {
  const biasa = ITEMS.filter((i) => i.rarity === 'biasa').map((i) => i.id);
  it('lucky roll (below newChance) → an item you do not own yet', () => {
    const r = pickItem('biasa', biasa.slice(0, 3), seq(0.1, 0), 0.6);
    expect(r.duplicate).toBe(false);
    expect(biasa.slice(0, 3)).not.toContain(r.itemId);
  });
  it('unlucky roll → something you already have (no new item)', () => {
    const r = pickItem('biasa', biasa.slice(0, 3), seq(0.7, 0), 0.6);
    expect(r).toEqual({ itemId: biasa[0], duplicate: true });
  });
  it('nothing to repeat yet → new anyway', () => {
    expect(pickItem('biasa', [], seq(0.99, 0), 0.25).duplicate).toBe(false);
  });
  it('everything owned → a repeat', () => {
    expect(pickItem('biasa', biasa, seq(0.1, 0), 0.6).duplicate).toBe(true);
  });
  it('legend boxes prefer an item you do not own yet', () => {
    const legend = ITEMS.filter((i) => i.rarity === 'legenda').map((i) => i.id);
    const r = pickItem('legenda', legend.slice(0, -1), seq(0));
    expect(r).toEqual({ itemId: legend[legend.length - 1], duplicate: false });
    expect(pickItem('legenda', legend, seq(0)).duplicate).toBe(true);
  });
  it('item counts per rarity', () => {
    const count = (r: string) => ITEMS.filter((i) => i.rarity === r).length;
    expect([count('biasa'), count('langka'), count('super'), count('legenda')]).toEqual([18, 17, 11, 8]);
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
  });
  it('streak items', () => expect(streakItem(7)).toBe('outfit-gaun-sakura'));
});

it('outfit slot can never be empty', () => {
  const w = defaultWardrobe();
  expect(equip(w, 'outfit', undefined).equipped.outfit).toBe('outfit-kaos-pink');
  expect(equip(w, 'hair', undefined).equipped.hair).toBeUndefined();
});
