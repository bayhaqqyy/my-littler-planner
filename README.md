# My Little Planner 🌷

To-do list dan planner harian bertema pastel, dengan timer Pomodoro, pengingat, kado, dan karakter **Mini &lt;username&gt;** yang bisa didandani. Dibangun dengan Expo (React Native + TypeScript) dan dirilis sebagai **PWA** untuk desktop, Android, dan iPhone. Spesifikasi lengkap ada di `PRD — My Little Planner.md`.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env      # opsional: isi kredensial Supabase
npm run web               # http://localhost:8081
```

Tanpa `.env`, layar login menampilkan **"Coba mode lokal"**: semua data hanya tersimpan di IndexedDB perangkat itu, tanpa login Google, sinkronisasi, atau Web Push. Mode ini muncul hanya bila Supabase belum dikonfigurasi.

| Perintah | Fungsi |
| --- | --- |
| `npm test` | Unit test aturan bisnis (`src/domain`) |
| `npm run typecheck` | Pemeriksaan TypeScript |
| `npm run build:web` | `expo export -p web` ke `dist/` + cek file PWA + tulis `vercel.json` |
| `npm run icons` | Render ikon PWA dari `public/icons/*.svg` |
| `npm run build:edge` | Bundel `src/domain` untuk Edge Function (jalankan setiap kali domain berubah) |

## Struktur

```text
src/app/            Expo Router: (tabs)/ Home, tasks, calendar, timer, progress, notes, rewards; task/; settings
src/domain/         Aturan bisnis murni + test (kejadian, bentrok, pengingat, streak, kado, level, badge, Pomodoro, statistik)
src/store/          Zustand + persist ke IndexedDB (localforage), metadata sinkron per baris
src/services/       supabase (auth Google), sync, notifications (Web Push), audio (nada Web Audio)
src/components/     UI, ilustrasi SVG (Mini Azza dan teman-teman), AppShell, engine timer & pengingat
src/theme/theme.ts  Token warna, font, radius, bayangan
supabase/           Migrasi SQL (RLS) + Edge Function send-reminders
public/             sw.js, manifest.json, index.html, ikon
```

## Menyiapkan Supabase

1. Buat proyek Supabase, lalu jalankan migrasi: `npx supabase link --project-ref <ref>` dan `npx supabase db push`.
   - Migrasi `…000100_cron.sql` butuh dua secret Vault (`project_url`, `cron_secret`); buat dulu lewat SQL editor (lihat komentar di file itu dan `.env.example`).
2. **Login Google:** Authentication → Providers → Google (isi client id/secret dari Google Cloud). Tambahkan URL situs (mis. `https://<app>.vercel.app` dan `http://localhost:8081`) di Authentication → URL Configuration.
3. **Web Push:** buat pasangan kunci `npx web-push generate-vapid-keys`, lalu
   `npx supabase secrets set VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=… VAPID_SUBJECT=https://<domain> CRON_SECRET=…`
   dan deploy fungsi: `npm run build:edge && npx supabase functions deploy send-reminders`.
4. Isi `.env` (lihat `.env.example`): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_VAPID_PUBLIC_KEY`, `EXPO_PUBLIC_SNOOZE_URL`.

## Deploy

Workflow `.github/workflows/deploy.yml` menjalankan test, typecheck, dan build untuk setiap PR dan push ke `main`, lalu deploy ke Vercel (preview untuk PR, production untuk `main`). Secret GitHub yang dibutuhkan: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, dan keempat variabel `EXPO_PUBLIC_*`.

## Catatan desain teknis

- **Offline-first:** semua layar menulis ke store lokal; `services/sync.ts` mendorong baris yang berubah dan menarik perubahan server berdasarkan `server_updated_at`, digabung last-write-wins per baris memakai `updated_at`.
- **Timer** selalu dihitung dari `endsAt`, jadi tetap benar setelah tab ditutup. Waktu fokus dicatat per 15 detik dan saat pause/selesai.
- **Pengingat:** saat aplikasi terbuka, `Engines.tsx` menampilkan banner dan bunyi alarm. Saat tertutup, Edge Function `send-reminders` (pg_cron tiap menit) mengirim Web Push memakai aturan pengingat yang sama dari `src/domain`. Di iPhone, Web Push hanya jalan setelah aplikasi ditambahkan ke Home Screen (iOS 16.4+).
- **Poin, level, streak, badge** dihitung dari log, tidak disimpan.
