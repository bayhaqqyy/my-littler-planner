# PRD — My Little Planner

Oct 16, 2026 · @Rafli Abdul Bay Haqqy

## Ringkasan produk

My Little Planner adalah aplikasi to-do list dan planner harian bertema pastel yang lucu, dibuat pertama kali untuk Azza, tetapi bisa dipakai siapa saja dengan namanya sendiri. Aplikasi ini membantu mencatat tugas kuliah dan kegiatan harian, mengatur waktu belajar dengan timer, mengingatkan jadwal, dan membuat Azza lebih semangat lewat hadiah, streak, dan karakter Mini Azza yang bisa didandani.

Versi prototipe sudah ada dalam bentuk satu file HTML. PRD ini menjadi acuan untuk membangun ulang aplikasi dengan React Native (Expo) dan merilisnya sebagai **web app (PWA)** yang berjalan di browser laptop atau desktop, HP Android, dan iPhone. Tidak ada rilis App Store atau Play Store di v1.

**Identitas:** nama aplikasi **My Little Planner**, ikon aplikasi wajah Mini Azza. Pengguna masuk dengan akun Google, dan karakter di dalam aplikasi mengikuti username: username Azza menjadi "Mini Azza", username Rina menjadi "Mini Rina". Username bisa diganti kapan saja.

**Masalah yang diselesaikan:**

- Aplikasi to-do biasa terasa kaku dan cepat ditinggalkan.
- Jadwal belajar sering terlewat karena tidak ada pengingat sebelum, saat mulai, dan saat selesai.
- Tidak ada rasa progres atau apresiasi setelah menyelesaikan tugas.

**Prinsip produk:** cute, estetik, interaktif, nyaman dipakai, dan tidak terlalu ramai sampai mengganggu tulisan.

## Tujuan dan metrik keberhasilan

Tujuan utamanya: Azza memakai aplikasi setiap hari untuk merencanakan, mengerjakan, dan menyelesaikan tugas tanpa merasa terbebani.

| Tujuan | Metrik | Target awal |
| --- | --- | --- |
| Dipakai rutin | Hari aktif per minggu | 5 dari 7 hari |
| Tugas benar-benar selesai | Persentase tugas harian selesai | 70% atau lebih |
| Belajar lebih fokus | Total waktu fokus per minggu dari timer | Naik dari minggu sebelumnya |
| Tidak ketinggalan jadwal | Tugas yang dimulai dalam 15 menit setelah pengingat | 60% atau lebih |
| Tetap semangat | Streak terpanjang | 7 hari dalam bulan pertama |

Target di atas adalah titik awal untuk dievaluasi setelah 4 minggu pemakaian.

**Non-tujuan untuk versi ini:**

- Kolaborasi atau berbagi tugas dengan orang lain.
- Integrasi dengan Google Calendar atau e-learning kampus.
- Fitur sosial seperti leaderboard atau berbagi pencapaian.
- Monetisasi.

## Pengguna dan skenario utama

Pengguna utamanya adalah Azza, mahasiswi yang punya jadwal kuliah, tugas, dan kegiatan pribadi. Ia membuka aplikasi dari iPhone dan laptop (aplikasi juga harus nyaman di HP Android), menyukai tampilan pastel yang lucu, dan butuh dorongan kecil supaya konsisten.

**Kebutuhan Azza:**

- Melihat semua yang harus dikerjakan hari ini dalam satu layar.
- Diingatkan sebelum, saat mulai, dan saat waktu kegiatan habis.
- Fokus belajar dengan timer, termasuk teknik Pomodoro.
- Merasa dihargai setiap kali menyelesaikan tugas.

**Skenario utama:**

1. **Pagi hari:** Azza membuka aplikasi, melihat sapaan "Good morning, Azza!", ringkasan tugas, jadwal terdekat, dan kutipan hari ini.
2. **Menambah tugas:** Azza menambahkan "Belajar Matematika" pukul 18.00 sampai 19.00, kategori Belajar, prioritas tinggi, pengingat 10 menit sebelum.
3. **Diingatkan:** pukul 17.50 muncul pengingat dengan suara lonceng. Pukul 18.00 muncul "Waktunya Belajar Matematika!" dengan tombol Mulai sekarang dan Tunda 5 menit.
4. **Belajar dengan timer:** Azza memilih Pomodoro, fokus 25 menit, lalu diingatkan istirahat 5 menit.
5. **Selesai:** Azza mencentang tugas, bunga mekar, Mini Azza bereaksi, progres bertambah, dan Azza mendapat satu kado.
6. **Malam hari:** Azza membuka kado, mendandani Mini Azza, menulis catatan harian, dan memilih mood hari itu.

## Ruang lingkup rilis

MVP memuat semua fitur yang sudah ada di prototipe HTML, ditambah sinkronisasi akun dan push notification yang tidak mungkin dibuat di versi satu file.

| Modul | MVP (v1.0) | Berikutnya (v1.1+) |
| --- | --- | --- |
| Platform | Web app (PWA) untuk browser desktop/laptop, Android, dan iPhone; bisa dipasang ke home screen | Aplikasi native App Store/Play Store bila dibutuhkan |
| Akun | Login wajib dengan Google, sinkron antar perangkat, username bisa diganti | Sinkron Google Calendar |
| Home | Sapaan, jam, ringkasan, progres, timer aktif, jadwal terdekat, kutipan, widget Minggu ini | Badge jumlah tugas di ikon aplikasi |
| To-Do List | Tambah, edit, hapus, jadwalkan ulang, tugas rutin, subtask, cari, filter | Lampiran file, tag bebas |
| Timer | Timer per tugas, Pomodoro dengan preset dan custom, istirahat pendek dan panjang, tambah waktu | Statistik per sesi, white noise |
| Pengingat | Sebelum mulai, saat mulai, saat selesai, tunda, Web Push, banner dalam aplikasi | Ringkasan harian pagi |
| Kalender | Bulan, minggu, hari per jam, deadline, jadwal bentrok | Tampilan agenda per tahun |
| Notes | Catatan harian, mood tracker, daily reflection | Grafik mood mingguan |
| Progress | Ringkasan, donat mingguan, grafik, kategori waktu, riwayat | Ekspor laporan PDF |
| Pencapaian | Kado berlevel, lemari Mini Azza, streak, level, badge, voucher | Item musiman, dekorasi kamar |

## Kebutuhan fungsional

Setiap modul ditulis sebagai user story dengan acceptance criteria (AC) yang bisa langsung dipakai sebagai daftar uji.

### 0. Login dan profil

Sebagai pengguna, saya ingin masuk dengan akun Google supaya data saya sama di laptop dan HP.

- AC1: Halaman pertama adalah layar login bertema (Mini Azza, kelinci, tulip) dengan satu tombol "Masuk dengan Google". Aplikasi tidak bisa dipakai tanpa login.
- AC2: Login memakai Supabase Auth dengan provider Google (OAuth, alur redirect supaya jalan juga di PWA iPhone).
- AC3: Saat login pertama, username terisi otomatis dari nama depan akun Google dan bisa diubah sebelum lanjut.
- AC4: Username 2 sampai 20 karakter (huruf, angka, spasi) dan tidak harus unik, karena hanya nama tampilan; akun dikenali dari id Supabase Auth. Nama karakter selalu "Mini " + username, dan sapaan memakai username.
- AC5: Username bisa diganti kapan saja di Settings; semua teks dan nama karakter langsung ikut berubah.
- AC6: Sesi login tersimpan; setelah login, aplikasi tetap bisa dipakai offline dan menyinkronkan perubahan saat online.
- AC7: Tombol Keluar di Settings.

Di seluruh dokumen ini, "Mini Azza" berarti "Mini " + username pengguna yang sedang login. Ikon aplikasi tetap wajah Mini Azza untuk semua pengguna.

### 1. Home (dashboard)

Sebagai Azza, saya ingin melihat ringkasan hari ini dalam satu layar supaya tahu harus mulai dari mana.

- AC1: Judul "My Little Planner" dan tombol Tambah serta Settings di header.
- AC2: Kartu sapaan berisi salam sesuai jam (Good morning sebelum 11.00, Good afternoon sebelum 15.00, Good evening sebelum 19.00, Good night setelahnya), nama, subjudul, tanggal lengkap, dan jam digital yang berjalan per detik.
- AC3: Ilustrasi Mini Azza, kelinci, dan anak ayam di antara tulip di tengah kartu sapaan.
- AC4: Lima kartu ringkasan: Total tugas, Selesai, Belum selesai, Streak (dengan api), dan Progres hari ini (persen + progress bar pelangi).
- AC5: Panel Timer saat ini, Jadwal terdekat (maks. 5 kegiatan dalam 7 hari), dan Kutipan hari ini yang berganti setiap hari.
- AC6: Daftar tugas hari ini, tugas selesai di bawah; tautan "Ada N tugas terlewat" bila ada.
- AC7: Widget Minggu ini: baris titik Senin sampai Minggu untuk semua tugas dan setiap tugas rutin.
- AC8: Kartu kado: jumlah kado belum dibuka dan streak, tombol ke Pencapaian.

### 2. To-Do List

Sebagai Azza, saya ingin mencatat tugas lengkap dengan waktu dan pengingat supaya tidak ada yang terlupa.

- AC1: Form tugas berisi nama (wajib, maks. 80 karakter), catatan, kategori (Kuliah, Belajar, Tugas, Istirahat, Olahraga, Pribadi), prioritas (Rendah, Sedang, Tinggi), tanggal, jam mulai, jam selesai, durasi, deadline, pengingat sebelum mulai (0, 1, 5, 10, 15, 30, 60 menit), ulangi, dan toggle pengingat saat mulai dan selesai.
- AC2: Durasi terisi otomatis dari jam mulai dan selesai; mengubah durasi menggeser jam selesai.
- AC3: Validasi: nama wajib, jam selesai harus setelah jam mulai, pengulangan mingguan wajib minimal satu hari.
- AC4: Peringatan langsung di form bila jadwal bentrok atau berjarak kurang dari 10 menit dengan kegiatan lain; tetap boleh disimpan.
- AC5: Tab Hari ini, Mendatang (14 hari), Terlewat, Selesai, dan Rutin; filter kategori; pencarian judul dan catatan.
- AC6: Detail tugas menampilkan waktu, tanggal, pengulangan, deadline, daftar pengingat, deskripsi, dan subtask yang bisa ditambah, dicentang, dan dihapus.
- AC7: Aksi: Mulai timer, Tandai selesai, Edit, Jadwalkan ulang, Lewati hari ini (khusus rutin), Hapus dengan konfirmasi.
- AC8: Jadwalkan ulang tugas rutin hanya memindahkan kejadian di tanggal itu; jadwal rutin lain tidak berubah.

### 3. Checklist interaktif

Sebagai Azza, saya ingin menyelesaikan tugas terasa menyenangkan.

- AC1: Lingkaran centang berwarna sesuai kategori; saat dicentang berubah menjadi bunga yang mekar (animasi skala dan rotasi, 700 ms).
- AC2: Percikan hati, bintang, dan bunga keluar dari tombol centang.
- AC3: Toast dengan wajah Mini Azza dan pesan acak: "Yay! One task completed!", "Good job, you did it!", dan lainnya.
- AC4: Progress bar bertambah dengan animasi.
- AC5: Tugas selesai tampil dengan latar lebih lembut dan coretan pink, tetap terbaca.
- AC6: Bila semua tugas hari itu selesai, tampil perayaan sekali per hari: confetti dan Mini Azza menari.

### 4. Timer dan Pomodoro

Sebagai Azza, saya ingin timer untuk setiap tugas supaya bisa fokus dan tahu kapan istirahat.

- AC1: Halaman Focus Time dengan timer berbentuk bunga, waktu besar, dan tombol bulat Start atau Pause di tengah.
- AC2: Tombol Start, Pause, Resume, Reset, +5 menit, Tandai selesai, dan Batalkan timer.
- AC3: Tiga mode: Sesuai tugas (durasi tugas), Pomodoro dengan preset Klasik 25/5, Santai 15/3, atau Fokus panjang 50/10, dan Custom (fokus, istirahat pendek, istirahat panjang, dan jumlah sesi diatur sendiri). Detail preset ada di Aturan bisnis.
- AC4: Saat waktu habis di mode Custom: tanya "Sudah selesai?" dengan pilihan Sudah selesai, +5 menit, +15 menit, Jadwalkan ulang.
- AC5: Saat sesi fokus Pomodoro selesai: tawarkan istirahat pendek, atau istirahat panjang bila jumlah sesi sudah tercapai, dengan pilihan Mulai istirahat, Lanjut fokus, atau Tugas selesai; saat istirahat habis: Mulai fokus lagi. Sesi yang selesai tampil sebagai titik tomat kecil.
- AC6: Saat di-pause, Mini Azza berganti pose istirahat dengan teh dan warna bunga berubah ke mint.
- AC7: Timer tetap berjalan saat pindah halaman (mini timer melayang) dan saat aplikasi ditutup (dihitung dari waktu selesai yang disimpan).
- AC8: Hanya waktu fase fokus yang dihitung sebagai waktu belajar.
- AC9: Panel samping: toggle Pengingat untuk tugas aktif, pilihan Mode belajar, dan Pilihan suara alarm.

### 5. Pengingat dan alarm

Sebagai Azza, saya ingin diingatkan dengan cara yang lucu dan tidak mengagetkan.

- AC1: Tiga jenis pengingat per tugas: sebelum mulai (N menit), saat mulai, saat selesai. Masing-masing bisa dimatikan.
- AC2: Pengingat dikirim sebagai Web Push lewat service worker, sehingga tetap muncul saat aplikasi ditutup di desktop dan Android. Di iPhone, Web Push hanya tersedia untuk web app yang sudah ditambahkan ke Home Screen (iOS 16.4 ke atas) ([WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)).
- AC3: Selama aplikasi terbuka, pengingat juga tampil sebagai banner lucu di dalam aplikasi dengan suara alarm.
- AC4: Isi notifikasi menyebut nama kegiatan, misalnya "Waktunya Belajar Matematika! 📚".
- AC5: Aksi notifikasi: Mulai sekarang (buka timer), Tunda 5 menit, Tandai selesai (khusus pengingat selesai).
- AC6: Pilihan suara: Lonceng, Chime, Suara kucing, Nada lembut, plus volume dan tombol coba nada.
- AC7: Notifikasi untuk tugas yang sudah selesai atau dilewati tidak dikirim; mengedit tugas menjadwalkan ulang notifikasinya.
- AC8: Di iPhone, sebelum meminta izin notifikasi, tampilkan panduan singkat "Tambahkan ke Home Screen". Izin notifikasi hanya diminta setelah pengguna menekan tombol, karena iOS mensyaratkan interaksi pengguna.

### 6. Kalender

- AC1: Tampilan Bulan, Minggu, dan Hari; tombol sebelumnya, berikutnya, dan Hari ini.
- AC2: Tampilan bulan: titik warna kategori per hari, tanda deadline, hari ini dilingkari pink.
- AC3: Panel "Jadwal hari ini" di samping kalender dengan garis warna kategori di kiri setiap kegiatan.
- AC4: Tampilan hari: linimasa per jam, kegiatan yang bertumpuk tampil berdampingan, kegiatan bentrok diberi garis putus merah, garis waktu sekarang.
- AC5: Daftar Kegiatan mendatang (7 hari) dan Deadline minggu ini.
- AC6: Tombol tambah tugas langsung di tanggal yang dipilih.

### 7. Notes dan mood tracker

- AC1: Catatan harian per tanggal dengan kertas bergaris, navigasi hari sebelumnya dan berikutnya (tidak bisa ke masa depan).
- AC2: Mood tracker dengan 5 wajah: Senang, Biasa, Sedih, Capek, Semangat; tersimpan langsung saat dipilih.
- AC3: Daily reflection: "Apa yang sudah kamu lakukan hari ini?".
- AC4: Daftar catatan sebelumnya dengan wajah mood dan cuplikan teks.

### 8. Progress

- AC1: Kartu Tugas selesai, Tugas tertunda, donat penyelesaian mingguan, dan Waktu belajar 7 hari.
- AC2: Grafik progres warna-warni: 7 hari per hari atau 4 minggu per minggu.
- AC3: Kategori waktu: menit dan persentase per kategori dengan bar berwarna.
- AC4: Pencapaian harian dan mingguan, hari paling produktif, streak, dan riwayat terbaru.

### 9. Pencapaian dan Lemari Mini Azza

- AC1: Setiap tugas selesai pertama kali memberi satu kado; mencentang ulang tugas yang sama tidak memberi kado lagi.
- AC2: Kado punya tingkat Biasa, Langka, Super Langka, atau Edisi Streak, terlihat dari warna kotaknya.
- AC3: Membuka kado: animasi kotak bergoyang, lalu item muncul dengan Mini Azza memakainya, tombol Pakai sekarang atau Simpan dulu.
- AC4: Lemari dengan tab Rambut, Baju, Kacamata, Teman, Spesial; item terkunci tampil buram dengan nama "???".
- AC5: Kartu Level dan badge, kartu streak dengan api dan milestone 3, 7, 14, 30 hari.
- AC6: Voucher hadiah dunia nyata dari daftar yang Azza tulis sendiri, dengan tombol Pakai.

### 10. Settings

- AC1: Username, foto akun Google, nada alarm, volume, pengingat bawaan, preset Pomodoro bawaan, izin notifikasi, daftar hadiah dunia nyata.
- AC2: Keluar dari akun, dan Hapus semua data (lokal dan server) dengan konfirmasi.
- AC3: Tampilan selalu terang (tidak mengikuti mode gelap perangkat).

## Aturan bisnis

Aturan di bawah ini sama dengan perilaku prototipe dan harus ditulis sebagai fungsi murni yang punya unit test.

### Tugas, pengulangan, dan kejadian

- Satu **Task** adalah templat. Satu **kejadian (occurrence)** adalah Task pada tanggal tertentu, dengan kunci `taskId@YYYY-MM-DD`.
- Status selesai, waktu fokus, dan kado dicatat per kejadian, bukan per Task.
- Pengulangan: `none` (hanya di tanggalnya), `daily`, `weekdays` (Senin sampai Jumat), `weekly` (hari yang dipilih). Kejadian rutin hanya muncul mulai tanggal Task dibuat.
- Lewati hari ini = tandai kejadian sebagai skip. Jadwalkan ulang tugas rutin = skip kejadian itu lalu buat Task baru tanpa pengulangan di tanggal tujuan.
- Durasi = jam selesai dikurangi jam mulai; bila tanpa jam, pakai durasi manual; bila kosong, 25 menit.
- Urutan daftar: jam mulai, lalu prioritas (Tinggi, Sedang, Rendah); tugas tanpa jam di akhir; tugas selesai di bawah.
- Terlewat = Task tanpa pengulangan yang tanggalnya sebelum hari ini dan belum selesai.

### Jadwal bentrok

- Bentrok bila dua kegiatan di tanggal yang sama saling tumpang tindih (mulai A < selesai B dan mulai B < selesai A).
- Terlalu dekat bila jeda antara keduanya kurang dari 10 menit.
- Keduanya hanya peringatan; tidak memblokir penyimpanan.

### Pengingat

- Sebelum mulai = jam mulai dikurangi `remindBefore` menit (0 berarti mati).
- Saat mulai dan saat selesai bisa dimatikan masing-masing.
- Tunda membuat pengingat baru 5 menit kemudian.
- Saat tugas ditandai selesai, dihapus, dilewati, atau diubah, semua notifikasi terjadwal untuk kejadian itu dibatalkan lalu dijadwalkan ulang bila perlu.
- Jadwalkan notifikasi lokal untuk 7 hari ke depan dan perbarui setiap kali aplikasi dibuka, karena iOS membatasi 64 notifikasi terjadwal per aplikasi.

### Streak

- Satu hari dihitung bila minimal satu tugas diselesaikan pada hari itu (berdasarkan waktu menyelesaikan).
- Streak dihitung mundur dari hari ini; bila hari ini belum ada tugas selesai, mulai dari kemarin supaya streak tidak terlihat putus sebelum hari berakhir.
- Saat tugas pertama hari itu selesai, tampilkan toast api "Streak N hari!".

### Pomodoro

Teknik Pomodoro dari Francesco Cirillo memakai blok fokus 25 menit diselingi istirahat pendek, lalu istirahat panjang 15 sampai 30 menit setelah empat sesi ([TechTarget](https://techtarget.com/whatis/definition/pomodoro-technique)). Istirahat pendek biasanya 5 menit dan boleh sesingkat 2 menit, dan banyak penerapan memakai durasi yang berbeda ([TechTarget](https://techtarget.com/whatis/definition/pomodoro-technique)); versi aslinya menyebut istirahat pendek 5 sampai 10 menit dan istirahat panjang 20 sampai 30 menit ([Wikipedia](https://en.wikipedia.org/wiki/Pomodoro_Technique)). Karena itu aplikasi memberi preset dan opsi custom.

| Preset | Fokus (menit) | Istirahat pendek (menit) | Istirahat panjang (menit) | Sesi sebelum istirahat panjang |
| --- | --- | --- | --- | --- |
| Klasik (bawaan) | 25 | 5 | 15 | 4 |
| Santai | 15 | 3 | 15 | 4 |
| Fokus panjang | 50 | 10 | 30 | 3 |
| Custom | 5–90 | 1–30 | 5–60 | 2–8 |

- Preset bawaan dipilih di Settings dan bisa diganti di halaman timer untuk setiap sesi.
- Opsi "Mulai otomatis fase berikutnya" bawaannya mati; pengguna menekan tombol untuk mulai istirahat atau fokus lagi.
- Hitungan sesi kembali ke nol setelah istirahat panjang atau saat timer dibatalkan.
- Hanya fase fokus yang dihitung sebagai waktu belajar dan poin.

### Kado dan item

| Kondisi tugas | Biasa | Langka | Super Langka |
| --- | --- | --- | --- |
| Normal | 70% | 25% | 5% |
| Prioritas tinggi atau durasi 60 menit ke atas | 55% | 35% | 10% |

- Item dipilih acak dari item tingkat itu yang belum dimiliki; bila habis, turun atau naik ke tingkat lain; bila semua sudah dimiliki, beri "bunga kenangan".
- Milestone streak 3, 7, 14, dan 30 hari memberi kado Edisi Streak berisi item khusus (Bando Pelangi, Gaun Sakura, Sayap Kupu-kupu, Mahkota Bulan), masing-masing sekali.
- Voucher hadiah dunia nyata ikut keluar dengan peluang 25% per kado, dan selalu keluar untuk kado Super Langka dan Edisi Streak, selama daftar hadiah tidak kosong.
- Baju selalu terpasang satu (bawaan: Kaos Pink); slot lain bisa dikosongkan.

### Poin, level, dan badge

- Poin = 10 per tugas selesai + 5 per 10 menit fokus.

| Level | Poin minimal | Gelar |
| --- | --- | --- |
| 1 | 0 | Little Sprout |
| 2 | 50 | Little Achiever |
| 3 | 120 | Study Star |
| 4 | 220 | Focus Bunny |
| 5 | 350 | Consistency Star |
| 6 | 520 | Planner Princess |
| 7 | 750 | Super Star |
| 8 | 1000 | Dream Achiever |

| Badge | Syarat |
| --- | --- |
| Little Achiever | Menyelesaikan tugas pertama |
| Study Star | 10 tugas kategori Belajar atau Kuliah selesai |
| Focus Master | Total fokus 5 jam |
| Consistency Star | Mencapai streak 7 hari |
| Early Bird | Menyelesaikan tugas sebelum pukul 08.00 |
| Super Planner | Menyelesaikan semua tugas dalam satu hari |

## Model data

Data disimpan lokal lebih dulu (offline-first), lalu disinkronkan ke Supabase setiap kali online. Setiap baris data punya kolom user\_id dari akun Google yang login. Semua tanggal disimpan sebagai `YYYY-MM-DD` dan jam sebagai `HH:mm` di zona waktu perangkat.

```typescript
type Category = 'kuliah' | 'belajar' | 'tugas' | 'istirahat' | 'olahraga' | 'pribadi';
type Priority = 'rendah' | 'sedang' | 'tinggi';
type Repeat = 'none' | 'daily' | 'weekdays' | 'weekly';
type Rarity = 'default' | 'biasa' | 'langka' | 'super' | 'streak';
type Mood = 'senang' | 'biasa' | 'sedih' | 'capek' | 'semangat';

interface Profile {          // satu per akun Google
  userId: string;            // id Supabase Auth
  username: string;          // 2-20 karakter, bisa diganti
  googleName?: string;
  avatarUrl?: string;
  createdAt: string;
}
// nama karakter = `Mini ${profile.username}`

interface Task {
  id: string;
  title: string;             // maks. 80 karakter
  description?: string;
  category: Category;
  priority: Priority;
  date: string;              // tanggal mulai / tanggal kejadian tunggal
  start?: string;            // HH:mm
  end?: string;              // HH:mm
  durationMin?: number;
  deadline?: string;
  remindBeforeMin: number;   // 0 = mati
  remindAtStart: boolean;
  remindAtEnd: boolean;
  repeat: Repeat;
  weekdays: number[];        // 0 = Minggu ... 6 = Sabtu
  subtasks: { id: string; text: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;        // soft delete untuk sinkron
}

interface Occurrence {        // key = `${taskId}@${date}`
  key: string;
  taskId: string;
  date: string;
  doneAt?: string;
  skipped?: boolean;
  focusSec: number;
  rewarded: boolean;
}

interface PomodoroConfig {
  preset: 'klasik' | 'santai' | 'fokus-panjang' | 'custom';
  focusMin: number;          // 5-90
  shortBreakMin: number;     // 1-30
  longBreakMin: number;      // 5-60
  sessionsBeforeLong: number;// 2-8
  autoStartNext: boolean;    // bawaan false
}

interface TimerState {
  occurrenceKey: string;
  mode: 'task' | 'pomodoro';
  pomodoro?: PomodoroConfig;
  phase: 'focus' | 'short-break' | 'long-break';
  completedSessions: number;
  totalSec: number;
  remainingSec: number;
  endsAt?: string;           // ISO, terisi saat berjalan
  state: 'idle' | 'running' | 'paused' | 'finished';
}

interface FocusLog { date: string; category: Category; seconds: number; }

interface CompletionLog {
  occurrenceKey: string; title: string; category: Category;
  completedAt: string; durationMin: number; timed: boolean;
}

interface GiftBox { id: string; rarity: Exclude<Rarity, 'default'>; source: string; itemId?: string; }

interface Item { id: string; slot: 'hair' | 'outfit' | 'glasses' | 'pet' | 'extra';
  rarity: Rarity; name: string; description: string; }

interface Wardrobe { owned: string[];
  equipped: { hair?: string; outfit: string; glasses?: string; pet?: string; extra?: string }; }

interface Voucher { id: string; text: string; wonAt: string; usedAt?: string; }

interface DailyNote { date: string; text: string; mood?: Mood; reflection: string; }

interface PushSubscriptionRow {   // satu per browser/perangkat
  id: string; endpoint: string; p256dh: string; auth: string;
  userAgent: string; createdAt: string;
}

interface Settings {
  alarmTone: 'lonceng' | 'chime' | 'kucing' | 'lembut';
  volume: number;            // 0..1
  defaultRemindBeforeMin: number;
  defaultTimerMode: 'task' | 'pomodoro';
  pomodoro: PomodoroConfig;  // bawaan preset klasik 25/5/15, 4 sesi
  realRewards: string[];
}

interface Progress {
  streakClaimed: number[];   // milestone 3, 7, 14, 30 yang sudah diberikan
  celebratedDates: string[];
}
```

### Tabel database

Karena ada login, data disimpan di database Supabase (Postgres). Setiap tabel punya kolom `user_id` yang merujuk ke akun di Supabase Auth, dan Row Level Security hanya mengizinkan baris dengan `user_id = auth.uid()`, sehingga setiap pengguna hanya bisa membaca dan mengubah datanya sendiri.

| Tabel | Isi | Kunci unik |
| --- | --- | --- |
| profiles | Username, nama dan foto Google | `user_id` |
| settings | Nada alarm, volume, pengingat bawaan, konfigurasi Pomodoro, daftar hadiah | `user_id` |
| tasks | Semua tugas termasuk subtask (kolom JSON) | `id` |
| occurrences | Status selesai, skip, waktu fokus, dan kado per kejadian | `user_id` + `key` |
| focus\_logs | Detik fokus per tanggal dan kategori | `user_id` + `date` + `category` |
| completion\_logs | Riwayat tugas selesai | `id` |
| gift\_boxes | Kado yang belum dibuka | `id` |
| wardrobe | Item yang dimiliki dan dipakai | `user_id` |
| vouchers | Voucher hadiah dunia nyata | `id` |
| daily\_notes | Catatan harian, mood, refleksi | `user_id` + `date` |
| progress | Milestone streak dan tanggal perayaan | `user_id` |
| push\_subscriptions | Langganan Web Push per browser | `id` |

Username sengaja tidak unik. Tidak ada konflik selama aplikasi tidak punya fitur yang mencari atau menyebut pengguna lain lewat nama. Bila nanti ada fitur berbagi atau profil publik, tambahkan kolom handle terpisah yang unik.

Poin, level, streak, dan badge dihitung dari `CompletionLog` dan `FocusLog`, bukan disimpan, supaya tidak pernah tidak sinkron.

## Design system tema

Temanya pastel lembut, terang, dan lucu, dengan garis tipis di setiap kartu. Semua nilai di bawah sebaiknya ditaruh di satu file token (`theme.ts`) supaya bisa dipakai di Tailwind/NativeWind dan komponen.

### Warna dasar

| Token | Hex | Dipakai untuk |
| --- | --- | --- |
| bg | #FFF7F9 | Latar aplikasi |
| bg-gradient | #FFF1F6 → #F8F0FF → #EEF6FF | Gradasi latar diagonal |
| surface | #FFFFFF (92%) | Kartu, dengan blur latar |
| surface-soft | #FFF8FA | Baris tugas selesai, panel dalam |
| line | #F3E1E8 | Garis tepi kartu dan pembatas baris |
| text | #4A3B52 | Teks utama |
| muted | #76627C | Teks sekunder (kontras 4.5:1 di putih) |
| accent | #C2457A | Tombol utama, teks putih di atasnya |
| accent-gradient | #D9578A → #C2457A | Isi tombol utama |
| accent-soft | #FFE6EE | Menu aktif, latar chip |
| sidebar | #FFF0F5 → #FFF7F2 | Menu samping desktop |
| danger | #B8325E | Deadline mepet, jadwal bentrok |

**Palet pastel referensi:** #FFDDE5, #FFF5F0, #D6C5F4, #C5E6FA, #C8E6D3, #FFE5AE, #EBD1B8, #F8DBEC, #B9E3FC.

### Warna kategori, prioritas, dan kado

| Nama | Latar chip | Teks chip | Titik / grafik |
| --- | --- | --- | --- |
| Kuliah | #E2F2FD | #2B6A94 | #9CD3F5 |
| Belajar | #EFE8FB | #5E44A0 | #C3B0EE |
| Tugas | #FFF1D6 | #85520F | #F7CF82 |
| Istirahat | #E3F4EA | #2E6B4A | #A8DABD |
| Olahraga | #E9F5E0 | #44682A | #B5DD9A |
| Pribadi | #FDE6EE | #9C3A63 | #F7A8C4 |
| Prioritas tinggi | #FFE0E9 | #B23A66 |  |
| Prioritas sedang | #FFF1D6 | #85520F |  |
| Prioritas rendah | #E3F4EA | #2E6B4A |  |
| Kado Biasa | #BFE8D6 |  | pita #7FCBAA |
| Kado Langka | #D9C8FF |  | pita #A88BEE |
| Kado Super Langka | #FFE08A |  | pita #EDB52F |
| Kado Edisi Streak | #FFC1D6 |  | pita #F07BA3 |

### Warna ceria untuk data

- Progress bar: gradasi pelangi #FF9EC2 → #FFC48F → #FFE27A → #9EE0B5 → #9CD3F5 → #C3B0EE dengan garis permen putih 40% miring 45°, bergerak pelan.
- Kartu ringkasan Home: Total pink (#FFF3F7 → #FFE1EC), Selesai mint (#F0FAF3 → #D9F2E3), Belum selesai lavender (#F6F1FF → #E7DEFF), Streak peach (#FFF6E6 → #FFE0C7, angka #A8441A), Progres biru (#F1F8FF → #DDEDFF).
- Grafik batang: warna bergiliran #F7A8C4, #C3B0EE, #9CD3F5, #A8DABD, #F7CF82, #F5B8A0, #B5DD9A.
- Donat mingguan: lintasan #FBE1EC, isi gradasi #FF7FAF → #B48CF2 → #5FB4EE.
- Timer bunga: kelopak #FFD9E6, cincin gradasi #F48FB1 → #FFB38A → #B9A0F0; saat istirahat kelopak #D9F2E4 dan cincin #7CCFA4.

### Tipografi

Font **Quicksand** (Google Fonts) untuk semua teks, berat 500, 600, dan 700.

| Gaya | Ukuran | Berat |
| --- | --- | --- |
| Judul halaman | 22–27 px | 700 |
| Sapaan | 20–25 px | 700 |
| Jam digital | 46 px desktop, 34 px mobile | 700, angka tabular |
| Waktu timer | 36–48 px | 700, angka tabular |
| Judul kartu | 15.5 px | 700 |
| Teks isi | 14.5 px | 500 |
| Teks kecil, meta | 12.5–13 px | 600 |
| Chip | 11.5 px | 600 |

### Bentuk dan ruang

- Radius: kartu 20, kartu sapaan 22–26, baris tugas 14, chip dan tombol 999 (pil), ikon kotak 12.
- Garis tepi: 1 px warna `line` di semua kartu.
- Bayangan: kartu `0 2px 10px rgba(200,140,170,.08)`, tombol utama `0 6px 14px rgba(194,69,122,.25)`.
- Spasi kelipatan 4: jarak antar kartu 12–14, padding kartu 16.
- Target sentuh minimal 44 × 44.

### Ilustrasi

Semua ilustrasi dibuat sebagai komponen SVG (`react-native-svg`) dengan gaya kawaii: mata besar berkilau, pipi merona, garis tepi tipis berwarna lembut.

| Karakter | Ciri | Muncul di |
| --- | --- | --- |
| Mini Azza | Rambut cepol cokelat, kaos pink, bisa memakai item lemari; pose senang, belajar dengan buku, istirahat dengan teh, kaget gembira | Home, timer, toast, lemari, perayaan |
| Kelinci | Putih, satu telinga terlipat dengan pita pink, memeluk bunga | Home, menu samping, Notes, latar |
| Kucing | Krem, pita di telinga, mata tersenyum | Kartu tugas, timer, latar |
| Beruang | Cokelat muda, bunga di telinga | Kutipan, kalender, kartu Level |
| Anak ayam | Kuning, baru menetas dari telur bertotol | Home, jadwal, timer, Notes, latar |
| Domba | Bulu putih seperti awan, pita pink | Progress, Notes, latar |
| Tulip dan daisy | Bunga dengan wajah tersenyum dan pipi merona | Taman di kartu, latar, ikon tugas |
| Api streak | Api oranye-pink berwajah; abu-abu dan diam bila streak 0 | Kartu streak, toast, Pencapaian |
| Kotak kado | Warna sesuai tingkat, pita putih | Pencapaian, kartu kado |

Dekorasi latar: awan putih, biru, pink, lavender; hati; bintang; kilauan; bunga kecil; pita; dua kupu-kupu; taman tulip dengan hewan di pojok bawah. Semua diberi bayangan tipis dan bergerak pelan.

### Animasi

| Momen | Animasi | Durasi |
| --- | --- | --- |
| Pindah halaman | Fade + naik 8 px | 300 ms |
| Tugas dicentang | Bunga mekar (skala 0 → 1.25 → 1, rotasi -120° → 0) + percikan 14 partikel | 700 ms |
| Semua tugas selesai | Confetti 60 potong + Mini Azza menari | 2–4 s |
| Buka kado | Kotak bergoyang 2 kali, item muncul dengan pop | 900 ms + 600 ms |
| Api streak | Bergoyang dan membesar sedikit | loop 1.8 s |
| Dekorasi latar | Naik turun 10 px | loop 7–10 s |
| Progress bar | Lebar berubah + garis permen bergerak | 800 ms + loop 1.4 s |

Semua animasi dimatikan bila pengguna mengaktifkan Reduce Motion.

### Nama dan ikon aplikasi

Nama aplikasi **My Little Planner** (nama pendek di home screen: "Little Planner"). Ikonnya wajah Mini Azza: kepala dengan cepol cokelat, pita pink, dan pipi merona di latar pink #FFE1EC dengan sudut membulat. Ikon sama untuk semua pengguna, sedangkan nama karakter di dalam aplikasi mengikuti username.

| Aset | Ukuran |
| --- | --- |
| Ikon manifest | 192 × 192 dan 512 × 512 px |
| Ikon maskable (Android) | 512 × 512 px, wajah di 80% tengah |
| Apple touch icon (iPhone) | 180 × 180 px |
| Favicon | 32 × 32 px dan SVG |
| Warna manifest | theme\_color #FFBFD8, background\_color #FFF7F9, display standalone |

### Komponen inti

AppShell (sidebar desktop, tab bar bawah 7 menu di mobile), Card, StatCard, Pill (kategori, prioritas, rarity), TaskRow, FlowerCheck, ProgressBar pelangi, Donut, FlowerTimer, Switch, RadioRow, MoodPicker, Toast, ReminderBanner, BottomSheet/Modal, GiftBox, CharacterAvatar (Mini Azza dengan slot item), EmptyState (Mini Azza + kelinci + anak ayam), DecoLayer.

## Arsitektur teknis dan stack

Rekomendasinya satu kode Expo (React Native + TypeScript) yang dirilis sebagai web app (PWA) untuk desktop, Android, dan iPhone, dengan data offline-first di perangkat dan Supabase untuk akun, sinkronisasi, serta push notification web.

&#91;embedded content: arsitektur · 3 platform, 1 kode, Supabase\]

Semua layar membaca dan menulis lewat store; store menyimpan ke perangkat lebih dulu, lalu layanan sinkron mengirim perubahan ke Supabase saat online.

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Framework | Expo (SDK terbaru) + React Native + TypeScript, target web lewat React Native Web | Komponen React Native; bila nanti butuh aplikasi native, kode yang sama bisa dipakai |
| Navigasi | Expo Router | URL rapi di web, tombol back browser jalan |
| Styling | NativeWind (Tailwind untuk RN) + `theme.ts` | Token warna dipakai bersama; breakpoint mobile, tablet, desktop |
| Font | `expo-font` + Quicksand | Font sama di semua browser |
| Ilustrasi | `react-native-svg` | Semua karakter dan bunga sebagai komponen |
| Animasi | Reanimated + Moti; Lottie opsional untuk confetti | Animasi halus di browser |
| State | Zustand dengan middleware persist | Ringan, mudah diuji |
| Penyimpanan lokal | IndexedDB (lewat localforage) | Offline-first, kapasitas lebih besar dari localStorage |
| Login | Supabase Auth dengan provider Google (OAuth, alur redirect) | Login Google tanpa server sendiri |
| Form dan validasi | React Hook Form + Zod | Validasi sama di form dan sinkron |
| Tanggal | date-fns dengan locale `id` | Format Indonesia |
| PWA | Web app manifest + service worker (Workbox) | Bisa dipasang ke home screen, jalan offline, menerima push |
| Pengingat | Web Push (VAPID) dikirim Supabase Edge Function yang dijalankan terjadwal (pg\_cron); banner dalam aplikasi saat terbuka | Pengingat tetap muncul saat aplikasi ditutup |
| Suara | File suara pendek diputar dengan Web Audio | Lonceng, chime, kucing, nada lembut |
| Backend | Supabase: Postgres dengan Row Level Security, Edge Functions, pg\_cron | Data per akun, tanpa mengelola server |
| Grafik | Komponen SVG sendiri | Grafik sederhana, warna penuh kendali |
| Uji | Jest + React Native Testing Library; Playwright di Chromium, WebKit, dan emulasi Android | Aturan bisnis diuji sebagai fungsi murni; tampilan diuji di 3 mesin browser |
| Rilis | `expo export --platform web` ke Vercel, preview per pull request lewat GitHub Actions | Deploy otomatis dari GitHub |

Semua aturan di bagian Aturan bisnis ditaruh di `src/domain` tanpa ketergantungan UI, sehingga bisa diuji dan dipakai ulang oleh Edge Function.

**Struktur folder yang disarankan:**

```text
app/                      # Expo Router
  (tabs)/
    index.tsx             # Home
    tasks.tsx             # To-Do List
    calendar.tsx
    timer.tsx
    progress.tsx
    notes.tsx
    rewards.tsx           # Pencapaian
  task/[id].tsx           # Detail tugas
  task/new.tsx
  settings.tsx
  _layout.tsx             # AppShell, font, provider
src/
  domain/                 # aturan bisnis murni + test
    occurrences.ts  conflicts.ts  reminders.ts
    streak.ts  rewards.ts  levels.ts  badges.ts
  store/                  # Zustand: tasks, timer, wardrobe, notes, settings
  services/
    notifications.ts  audio.ts  sync.ts  supabase.ts
  components/
    ui/                   # Card, Pill, Switch, ProgressBar, Donut
    task/                 # TaskRow, FlowerCheck, TaskForm
    timer/                # FlowerTimer
    illustrations/        # MiniAzza, Bunny, Kitty, Bear, Chick, Sheep, Tulip, Flame, GiftBox
    deco/                 # DecoLayer, Garden
  theme/theme.ts          # token warna, font, radius
assets/sounds/            # lonceng, chime, kucing, lembut
supabase/
  migrations/  functions/send-reminders/
```

## Kebutuhan non-fungsional

| Aspek | Kebutuhan |
| --- | --- |
| Platform | Web app saja. Desktop/laptop: Chrome, Edge, Firefox, Safari versi terbaru. Android: Chrome. iPhone: Safari iOS 16.4+, dipasang ke Home Screen untuk notifikasi |
| Responsif | Mobile 360–599 px: tab bar bawah 7 menu dan tombol tambah melayang. Tablet 600–899 px: 2 kolom. Desktop 900 px ke atas: menu samping, Home 3 kolom |
| PWA | Manifest dengan ikon Mini Azza, tampilan standalone, area aman (safe area) iPhone, layar pembuka pink |
| Offline | Semua fitur jalan tanpa internet setelah login; perubahan disinkronkan saat online |
| Performa | Halaman pertama tampil di bawah 2 detik di HP menengah dengan 4G; animasi 60 fps; daftar panjang memakai virtualisasi |
| Aksesibilitas | Kontras teks minimal 4.5:1, target sentuh 44 px, bisa dipakai dengan keyboard di desktop, label pembaca layar di semua tombol ikon, ilustrasi dekoratif disembunyikan dari pembaca layar, hormati Reduce Motion |
| Privasi | Data milik akun, dilindungi Row Level Security; tidak ada pelacakan pihak ketiga; Hapus semua data menghapus lokal dan server |
| Keandalan | Waktu timer dihitung dari `endsAt`, bukan hitungan detik di memori, sehingga tetap benar setelah tab ditutup |
| Zona waktu | Semua tanggal memakai zona waktu perangkat; pergantian hari memperbarui tampilan otomatis |
| Bahasa | Antarmuka bahasa Indonesia dengan sapaan dan pesan semangat berbahasa Inggris sesuai referensi |
| Tema | Selalu terang; mode gelap tidak ada di v1 |

## Rencana rilis

Usulan urutan pengerjaan untuk satu developer: fitur yang dipakai setiap hari dibangun lebih dulu, sinkron, Web Push, dan rilis web di akhir.

&#91;embedded content: rencana rilis · 5 fase, 2 gate\]

Setelah fase Inti tugas, aplikasi sudah bisa dipakai Azza setiap hari dengan data lokal, jadi umpan balik bisa dikumpulkan sambil fase berikutnya dikerjakan. Durasi per fase adalah perkiraan awal.

## Risiko dan pertanyaan terbuka

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Di iPhone, Web Push hanya jalan untuk web app yang sudah ditambahkan ke Home Screen, dan izinnya harus diminta dari tombol yang ditekan pengguna ([WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)) | Pengingat tidak muncul bila dibuka di Safari biasa | Panduan pasang ke Home Screen sebelum meminta izin; banner dalam aplikasi sebagai cadangan |
| Login Google di PWA iPhone bisa terbuka di jendela Safari terpisah | Pengguna bingung atau sesi tidak kembali ke aplikasi | Pakai alur redirect, uji khusus di PWA iPhone |
| Safari bisa menghapus data lokal situs yang lama tidak dibuka | Data offline hilang | Data utama disimpan di Supabase; data lokal hanya cache |
| Konflik data saat sinkron dari dua perangkat | Tugas atau status selesai tertimpa | Last-write-wins per field dengan `updatedAt`; status selesai dicatat per kejadian |
| Animasi dan SVG berat di HP lama | Aplikasi terasa lambat | Batasi dekorasi latar, matikan animasi loop saat Reduce Motion |
| Suara alarm diblokir browser sebelum ada interaksi | Alarm tidak berbunyi | Minta satu ketukan di awal sesi; tetap tampilkan banner visual |

**Pertanyaan terbuka:**

- [x] Platform: web app saja, untuk desktop/laptop, Android, dan iPhone.
- [x] Login: wajib dengan akun Google.
- [x] Nama dan ikon: My Little Planner, ikon wajah Mini Azza.
- [x] Pomodoro: preset Klasik, Santai, Fokus panjang, dan Custom (lihat Aturan bisnis).
- [x] Nama karakter dinamis: Mini + username, username bisa diganti.
- [x] Username tidak harus unik; hanya nama tampilan (lihat Tabel database).
