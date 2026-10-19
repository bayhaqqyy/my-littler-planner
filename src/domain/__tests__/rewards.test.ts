import { equip, defaultWardrobe, pickItem, rollRarity, tierOrder, streakItem } from '../rewards';
import { ITEMS, MEMORY_FLOWER } from '../items';
import { task } from './helpers';

const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };

describe('rarity odds', () => {
  it('normal 70/25/5', () => {
    expect(rollRarity(task(), seq(0.69))).toBe('biasa');
    expect(rollRarity(task(), seq(0.7))).toBe('langka');
    expect(rollRarity(task(), seq(0.949))).toBe('langka');
    expect(rollRarity(task(), seq(0.95))).toBe('super');
  });
  it('boosted 55/35/10 for high priority or >= 60 minutes', () => {
    expect(rollRarity(task({ priority: 'tinggi' }), seq(0.56))).toBe('langka');
    expect(rollRarity(task({ start: '08:00', end: '09:00' }), seq(0.91))).toBe('super');
    expect(rollRarity(task({ start: '08:00', end: '08:59' }), seq(0.91))).toBe('langka');
  });
});

describe('pickItem', () => {
  it('picks an unowned item of the tier', () => {
    const id = pickItem('langka', [], seq(0));
    expect(ITEMS.find((i) => i.id === id)?.rarity).toBe('langka');
  });
  it('falls back down then up', () => {
    expect(tierOrder('langka')).toEqual(['langka', 'biasa', 'super']);
    const allBiasa = ITEMS.filter((i) => i.rarity === 'biasa').map((i) => i.id);
    expect(ITEMS.find((i) => i.id === pickItem('biasa', allBiasa, seq(0)))?.rarity).toBe('langka');
  });
  it('memory flower when all owned', () => {
    expect(pickItem('super', ITEMS.map((i) => i.id))).toBe(MEMORY_FLOWER);
  });
  it('streak items', () => expect(streakItem(7)).toBe('outfit-gaun-sakura'));
});

it('outfit slot can never be empty', () => {
  const w = defaultWardrobe();
  expect(equip(w, 'outfit', undefined).equipped.outfit).toBe('outfit-kaos-pink');
  expect(equip(w, 'hair', undefined).equipped.hair).toBeUndefined();
});
