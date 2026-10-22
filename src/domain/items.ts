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

  // ---- Biasa (tambahan) ----
  { id: 'hair-jepit-hati', slot: 'hair', rarity: 'biasa', name: 'Jepit Hati', description: 'Jepit kecil penuh cinta.' },
  { id: 'hair-pita-biru', slot: 'hair', rarity: 'biasa', name: 'Pita Biru', description: 'Biru langit yang menenangkan.' },
  { id: 'hair-bando-polkadot', slot: 'hair', rarity: 'biasa', name: 'Bando Polkadot', description: 'Titik-titik ceria.' },
  { id: 'outfit-kaos-kuning', slot: 'outfit', rarity: 'biasa', name: 'Kaos Kuning', description: 'Cerah seperti pagi hari.' },
  { id: 'outfit-cardigan-krem', slot: 'outfit', rarity: 'biasa', name: 'Cardigan Krem', description: 'Hangat untuk di perpustakaan.' },
  { id: 'outfit-kaos-stroberi', slot: 'outfit', rarity: 'biasa', name: 'Kaos Stroberi', description: 'Manis dan segar.' },
  { id: 'glasses-kotak', slot: 'glasses', rarity: 'biasa', name: 'Kacamata Kotak', description: 'Gaya kutu buku yang keren.' },
  { id: 'pet-bebek', slot: 'pet', rarity: 'biasa', name: 'Bebek Kuning', description: 'Kwek kwek, ayo semangat!' },
  { id: 'extra-pensil', slot: 'extra', rarity: 'biasa', name: 'Pensil Raksasa', description: 'Siap mencatat semua ide.' },
  { id: 'extra-bunga', slot: 'extra', rarity: 'biasa', name: 'Buket Bunga', description: 'Hadiah kecil untuk diri sendiri.' },

  // ---- Langka (tambahan) ----
  { id: 'hair-earmuff', slot: 'hair', rarity: 'langka', name: 'Penutup Telinga Bulu', description: 'Fokus tanpa suara bising.' },
  { id: 'hair-topi-penyihir', slot: 'hair', rarity: 'langka', name: 'Topi Penyihir', description: 'Sim salabim, tugas selesai!' },
  { id: 'outfit-jaket-jeans', slot: 'outfit', rarity: 'langka', name: 'Jaket Jeans', description: 'Santai tapi tetap keren.' },
  { id: 'outfit-sweater-rajut', slot: 'outfit', rarity: 'langka', name: 'Sweater Rajut', description: 'Dirajut dengan sabar, seperti belajarmu.' },
  { id: 'glasses-hitam', slot: 'glasses', rarity: 'langka', name: 'Kacamata Hitam', description: 'Terlalu keren untuk deadline.' },
  { id: 'pet-penguin', slot: 'pet', rarity: 'langka', name: 'Penguin Kecil', description: 'Pelan-pelan tapi pasti.' },
  { id: 'pet-anjing', slot: 'pet', rarity: 'langka', name: 'Anak Anjing', description: 'Teman paling setia.' },
  { id: 'extra-ransel', slot: 'extra', rarity: 'langka', name: 'Ransel Kelinci', description: 'Muat semua buku kuliah.' },
  { id: 'extra-payung', slot: 'extra', rarity: 'langka', name: 'Payung Polkadot', description: 'Siap hujan atau cerah.' },

  // ---- Super Langka (tambahan) ----
  { id: 'hair-tiara', slot: 'hair', rarity: 'super', name: 'Tiara Kristal', description: 'Bersinar setiap kali kamu fokus.' },
  { id: 'outfit-gaun-pesta', slot: 'outfit', rarity: 'super', name: 'Gaun Pesta Berkilau', description: 'Untuk merayakan kerja kerasmu.' },
  { id: 'glasses-pelangi', slot: 'glasses', rarity: 'super', name: 'Kacamata Pelangi', description: 'Hari-hari jadi lebih berwarna.' },
  { id: 'pet-unicorn', slot: 'pet', rarity: 'super', name: 'Unicorn Mungil', description: 'Langka, seperti kamu.' },
  { id: 'extra-pelangi', slot: 'extra', rarity: 'super', name: 'Pelangi Kecil', description: 'Selalu ada pelangi setelah hujan.' },
  { id: 'extra-bintang-jatuh', slot: 'extra', rarity: 'super', name: 'Bintang Jatuh', description: 'Buat permohonan!' },

  // ---- Legenda: hanya dari badge peringkat Legenda ----
  { id: 'hair-mahkota-legenda', slot: 'hair', rarity: 'legenda', name: 'Mahkota Legenda', description: 'Untuk yang sudah membuktikan diri.' },
  { id: 'outfit-jubah-galaksi', slot: 'outfit', rarity: 'legenda', name: 'Jubah Galaksi', description: 'Berisi bintang-bintang hasil kerja kerasmu.' },
  { id: 'glasses-berlian', slot: 'glasses', rarity: 'legenda', name: 'Kacamata Berlian', description: 'Melihat masa depan yang cerah.' },
  { id: 'pet-naga', slot: 'pet', rarity: 'legenda', name: 'Naga Mungil', description: 'Penjaga semangatmu.' },
  { id: 'pet-burung-api', slot: 'pet', rarity: 'legenda', name: 'Burung Api', description: 'Selalu bangkit lagi.' },
  { id: 'extra-sayap-malaikat', slot: 'extra', rarity: 'legenda', name: 'Sayap Malaikat', description: 'Terbang tinggi melampaui target.' },
  { id: 'extra-halo', slot: 'extra', rarity: 'legenda', name: 'Halo Emas', description: 'Cahaya untuk sang legenda.' },
  { id: 'extra-tongkat-bintang', slot: 'extra', rarity: 'legenda', name: 'Tongkat Bintang', description: 'Mengubah rencana jadi kenyataan.' },
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
