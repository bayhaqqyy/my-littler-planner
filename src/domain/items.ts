import type { Item, Slot } from './types';

export const DEFAULT_OUTFIT = 'outfit-kaos-pink';
export const DEFAULT_HAIR = 'hair-cepol';

export const ITEMS: Item[] = [
  // Rambut
  { id: 'hair-cepol', slot: 'hair', rarity: 'default', name: 'Cepol Cokelat', description: 'Gaya rambut andalan, rapi dan imut.' },
  { id: 'hair-pita-pink', slot: 'hair', rarity: 'biasa', name: 'Pita Pink', description: 'Pita manis untuk hari yang manis.' },
  { id: 'hair-jepit-bintang', slot: 'hair', rarity: 'biasa', name: 'Jepit Bintang', description: 'Biar idenya ikut berkilau.' },
  { id: 'hair-bando-kelinci', slot: 'hair', rarity: 'langka', name: 'Bando Telinga Kelinci', description: 'Hop hop, semangat belajar!' },
  { id: 'hair-baret', slot: 'hair', rarity: 'langka', name: 'Baret Lavender', description: 'Gaya seniman yang lagi fokus.' },
  { id: 'hair-mahkota-bunga', slot: 'hair', rarity: 'super', name: 'Mahkota Bunga', description: 'Ratu taman yang rajin.' },
  { id: 'hair-bando-pelangi', slot: 'hair', rarity: 'streak', name: 'Bando Pelangi', description: 'Hadiah streak 3 hari.' },
  { id: 'hair-mahkota-bulan', slot: 'hair', rarity: 'streak', name: 'Mahkota Bulan', description: 'Hadiah streak 30 hari. Luar biasa!' },
  // Baju
  { id: 'outfit-kaos-pink', slot: 'outfit', rarity: 'default', name: 'Kaos Pink', description: 'Kaos favorit yang nyaman.' },
  { id: 'outfit-sweater-mint', slot: 'outfit', rarity: 'biasa', name: 'Sweater Mint', description: 'Hangat untuk belajar malam.' },
  { id: 'outfit-overall-biru', slot: 'outfit', rarity: 'biasa', name: 'Overall Biru', description: 'Siap mengerjakan semua tugas.' },
  { id: 'outfit-dress-lavender', slot: 'outfit', rarity: 'langka', name: 'Dress Lavender', description: 'Anggun dan tenang.' },
  { id: 'outfit-hoodie-kucing', slot: 'outfit', rarity: 'langka', name: 'Hoodie Kucing', description: 'Meong! Nyaman sekali.' },
  { id: 'outfit-gaun-bintang', slot: 'outfit', rarity: 'super', name: 'Gaun Bintang', description: 'Berkilau seperti langit malam.' },
  { id: 'outfit-gaun-sakura', slot: 'outfit', rarity: 'streak', name: 'Gaun Sakura', description: 'Hadiah streak 7 hari.' },
  // Kacamata
  { id: 'glasses-bulat', slot: 'glasses', rarity: 'biasa', name: 'Kacamata Bulat', description: 'Kacamata belajar yang pintar.' },
  { id: 'glasses-hati', slot: 'glasses', rarity: 'langka', name: 'Kacamata Hati', description: 'Melihat dunia penuh cinta.' },
  { id: 'glasses-bintang', slot: 'glasses', rarity: 'super', name: 'Kacamata Bintang', description: 'Bintang kelas!' },
  // Teman
  { id: 'pet-kelinci', slot: 'pet', rarity: 'biasa', name: 'Kelinci Kecil', description: 'Teman setia yang lembut.' },
  { id: 'pet-anak-ayam', slot: 'pet', rarity: 'biasa', name: 'Anak Ayam', description: 'Ciap ciap, ayo mulai!' },
  { id: 'pet-kucing', slot: 'pet', rarity: 'langka', name: 'Kucing Krem', description: 'Suka tidur di samping buku.' },
  { id: 'pet-beruang', slot: 'pet', rarity: 'langka', name: 'Beruang Bunga', description: 'Pelukan hangat setiap hari.' },
  { id: 'pet-domba', slot: 'pet', rarity: 'super', name: 'Domba Awan', description: 'Selembut awan.' },
  // Spesial
  { id: 'extra-balon', slot: 'extra', rarity: 'biasa', name: 'Balon Hati', description: 'Untuk merayakan hal kecil.' },
  { id: 'extra-tas-stroberi', slot: 'extra', rarity: 'langka', name: 'Tas Stroberi', description: 'Muat banyak catatan.' },
  { id: 'extra-awan', slot: 'extra', rarity: 'super', name: 'Awan Kecil', description: 'Awan pribadi yang ikut ke mana-mana.' },
  { id: 'extra-sayap', slot: 'extra', rarity: 'streak', name: 'Sayap Kupu-kupu', description: 'Hadiah streak 14 hari.' },
];

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const STREAK_ITEMS: Record<number, string> = {
  3: 'hair-bando-pelangi',
  7: 'outfit-gaun-sakura',
  14: 'extra-sayap',
  30: 'hair-mahkota-bulan',
};

export const SLOT_LABEL: Record<Slot, string> = { hair: 'Rambut', outfit: 'Baju', glasses: 'Kacamata', pet: 'Teman', extra: 'Spesial' };
export const SLOTS: Slot[] = ['hair', 'outfit', 'glasses', 'pet', 'extra'];

export const MEMORY_FLOWER = 'memory-flower';
