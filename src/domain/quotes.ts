import { parseDate } from './dates';

/** 31 kata penyemangat: tiap tanggal dapat satu, jadi sebulan penuh tidak ada yang berulang. */
export const QUOTES = [
  { text: 'Langkah kecil tiap hari, lama-lama jadi kebun yang besar.', author: 'Mini Azza' },
  { text: 'Bunga tidak mekar dalam sehari, kamu juga tidak harus langsung bisa.', author: 'Mini Azza' },
  { text: 'Pelan-pelan asal sampai, yang penting terus jalan.', author: 'Mini Azza' },
  { text: 'Satu tugas selesai sudah cukup untuk disyukuri hari ini.', author: 'Mini Azza' },
  { text: 'Mulai saja dulu, semangatnya nanti ikut datang.', author: 'Mini Azza' },
  { text: 'Istirahat juga bagian dari menanam.', author: 'Mini Azza' },
  { text: 'Kamu sudah sejauh ini, bangga sama diri sendiri ya.', author: 'Mini Azza' },
  { text: 'Hari yang berat juga bikin akar makin kuat.', author: 'Mini Azza' },
  { text: 'Selesai lebih baik daripada sempurna.', author: 'Mini Azza' },
  { text: 'Siram sedikit demi sedikit, nanti tumbuh juga.', author: 'Mini Azza' },
  { text: 'Fokus ke satu hal dulu, sisanya bisa menunggu.', author: 'Mini Azza' },
  { text: 'Tidak apa-apa pelan, siput juga sampai ke tujuan.', author: 'Mini Azza' },
  { text: 'Matahari selalu terbit lagi, begitu juga semangatmu.', author: 'Mini Azza' },
  { text: 'Belajar hari ini adalah bibit untuk dirimu besok.', author: 'Mini Azza' },
  { text: 'Tarik napas, minum air, lalu kita lanjut lagi.', author: 'Mini Azza' },
  { text: 'Tugas besar juga habis kalau dicicil.', author: 'Mini Azza' },
  { text: 'Kamu tidak harus sempurna, cukup terus mencoba.', author: 'Mini Azza' },
  { text: 'Setiap centang kecil itu kemenangan.', author: 'Mini Azza' },
  { text: 'Kebun yang rapi dimulai dari satu pot bunga.', author: 'Mini Azza' },
  { text: 'Capek boleh, menyerah jangan dulu.', author: 'Mini Azza' },
  { text: 'Hari ini cukup lakukan yang terbaik yang kamu bisa.', author: 'Mini Azza' },
  { text: 'Setelah hujan, biasanya bunga mekar lebih cantik.', author: 'Mini Azza' },
  { text: 'Deadline itu teman, bukan musuh, asal disapa dari awal.', author: 'Mini Azza' },
  { text: 'Kamu lebih rajin dari yang kamu kira.', author: 'Mini Azza' },
  { text: 'Satu jam fokus lebih berarti dari tiga jam setengah hati.', author: 'Mini Azza' },
  { text: 'Tumbuh itu tidak selalu kelihatan, tapi pasti terjadi.', author: 'Mini Azza' },
  { text: 'Pagi yang baru, kesempatan yang baru.', author: 'Mini Azza' },
  { text: 'Jangan bandingkan kebunmu dengan kebun orang lain.', author: 'Mini Azza' },
  { text: 'Hal kecil yang dikerjakan rutin akan jadi hal besar.', author: 'Mini Azza' },
  { text: 'Kamu boleh bangga, bahkan untuk kemajuan kecil.', author: 'Mini Azza' },
  { text: 'Besok kebunmu pasti lebih berbunga dari hari ini.', author: 'Mini Azza' },
];

/** Kutipan berganti tiap hari mengikuti tanggal (sama di semua perangkat, tanpa disimpan). */
export function quoteOfDay(date: string) {
  const day = Math.floor(parseDate(date).getTime() / 86400000);
  return QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length];
}

export const CHEERS = [
  'Yay, satu tugas selesai!',
  'Hebat, kamu berhasil!',
  'Satu bunga mekar lagi! 🌷',
  'Satu lagi beres, bangga deh!',
  'Kerja bagus hari ini! ✨',
  'Terus mekar ya! 🌸',
  'Lagi semangat banget nih! 🔥',
];
