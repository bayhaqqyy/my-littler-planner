# Checklist Setup — My Little Planner

Daftar yang perlu disiapkan supaya login Google, sinkron antar perangkat, dan pengingat Web Push berjalan. Centang `[x]` setiap langkah yang sudah selesai. Semua langkah bisa memakai paket gratis (Supabase Free + Vercel Hobby).

Simpan setiap nilai di kolom **Catatan** di bawah supaya mudah diisi ke `.env` dan GitHub. **Jangan commit file ini setelah berisi kunci rahasia.** Lebih aman catat kuncinya di password manager.

---

## 0. Kode sudah di GitHub

- [ ] Commit dan push ke `main` (lihat perintah di percakapan / README)
- [ ] Repo terlihat di https://github.com/bayhaqqyy/my-littler-planner

---

## 1. Proyek Supabase

- [ ] Buat akun / login di https://supabase.com
- [ ] **New project** → pilih region terdekat (mis. Singapore), buat password database dan simpan
- [ ] Buka **Project Settings → API**, catat:

| Nilai | Catatan |
| --- | --- |
| Project ref (bagian `xxxx` dari `https://xxxx.supabase.co`) | |
| Project URL | |
| anon / publishable key | |
| service_role key (**rahasia**) | |

- [ ] Buka **SQL Editor**, jalankan (ganti isinya):

```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<CRON_SECRET dari .env>', 'cron_secret');
```

- [ ] Di terminal folder proyek, jalankan migrasi:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

- [ ] Cek di **Table Editor**: ada tabel `tasks`, `occurrences`, `settings`, dan lainnya
- [ ] Cek di **Integrations → Cron**: ada job `send-reminders-every-minute`

---

## 2. Login Google

### Google Cloud
- [ ] Buka https://console.cloud.google.com → buat project (mis. "My Little Planner")
- [ ] **APIs & Services → OAuth consent screen**: isi nama aplikasi, email dukungan, tipe *External*. Tambahkan email Azza dan email kamu sebagai *Test users* (atau publish aplikasinya)
- [ ] **APIs & Services → Credentials → Create credentials → OAuth client ID**
  - Application type: **Web application**
  - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- [ ] Catat:

| Nilai | Catatan |
| --- | --- |
| Google Client ID | |
| Google Client Secret (**rahasia**) | |

### Supabase
- [ ] **Authentication → Sign In / Providers → Google**: aktifkan, isi Client ID dan Client Secret
- [ ] **Authentication → URL Configuration**:
  - Site URL: domain Vercel (diisi setelah langkah 5, mis. `https://my-little-planner.vercel.app`)
  - Redirect URLs: tambahkan domain Vercel dan `http://localhost:8081`

---

## 3. Web Push (pengingat saat aplikasi ditutup)

- [ ] Buat kunci VAPID:

```bash
npx web-push generate-vapid-keys
```

| Nilai | Catatan |
| --- | --- |
| VAPID public key | |
| VAPID private key (**rahasia**) | |
| Email kontak untuk VAPID (mis. `mailto:kamu@email.com`) | |

- [ ] Simpan sebagai secret fungsi:

```bash
npx supabase secrets set VAPID_PUBLIC_KEY=<public> VAPID_PRIVATE_KEY=<private> VAPID_SUBJECT=https://<domain> CRON_SECRET=<dari .env>
```

- [ ] Deploy fungsi pengingat:

```bash
npm run build:edge
npx supabase functions deploy send-reminders
```

- [ ] Cek di **Edge Functions → send-reminders → Logs**: ada panggilan tiap menit tanpa error

---

## 4. File `.env` lokal

- [ ] Salin `.env.example` menjadi `.env`, lalu isi:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
EXPO_PUBLIC_VAPID_PUBLIC_KEY=<VAPID public key>
EXPO_PUBLIC_SNOOZE_URL=https://<project-ref>.supabase.co/functions/v1/send-reminders
```

- [ ] `npm run web` → layar login sekarang menampilkan **"Masuk dengan Google"** (bukan "Coba mode lokal")
- [ ] Coba login dan pilih username

> `.env` sudah ada di `.gitignore`, jadi tidak akan ter-commit.

---

## 5a. Deploy di server sendiri: Docker + Cloudflare Tunnel (dipakai)

- [ ] Cloudflare → **Zero Trust → Networks → Tunnels → Create tunnel** (tipe *Cloudflared*), salin **token**-nya ke `.env`:
  `CLOUDFLARE_TUNNEL_TOKEN=...`
- [ ] Di tunnel itu, tambah **Public hostname**: mis. `planner.domainkamu.com` → Service `HTTP` → `localhost:8088`

| Nilai | Catatan |
| --- | --- |
| Domain publik (hostname tunnel) | |

- [ ] Build dan jalankan:

```bash
docker compose up -d --build
```

- [ ] Cek lokal: http://localhost:8088 (hanya bisa dari mesin ini)
- [ ] Cek publik: `https://planner.domainkamu.com`
- [ ] Supabase → **Authentication → URL Configuration**: Site URL = domain publik, Redirect URLs = domain publik (+ `http://localhost:8088`, `http://localhost:8081`)
- [ ] **Setiap kali `.env` berubah**, build ulang: `docker compose up -d --build web` (nilai `EXPO_PUBLIC_*` ditanam saat build)

> HTTPS dari Cloudflare wajib: login Google, service worker, dan Web Push tidak jalan di HTTP biasa (kecuali localhost).

## 5b. Alternatif: Deploy ke Vercel

- [ ] Buat akun / login di https://vercel.com dengan GitHub
- [ ] **Add New → Project** → import repo `my-littler-planner`
  - Build command: `npm run build:web` (sudah ada di `vercel.json`)
  - Output directory: `dist`
  - Environment Variables: isi keempat `EXPO_PUBLIC_*` yang sama dengan `.env`
- [ ] Deploy, lalu catat domainnya:

| Nilai | Catatan |
| --- | --- |
| Domain Vercel | |

- [ ] Kembali ke **Supabase → Authentication → URL Configuration** (langkah 2), isi Site URL dan Redirect URLs dengan domain ini

### Opsional: deploy lewat GitHub Actions (preview tiap PR)

Kalau Vercel sudah terhubung langsung ke GitHub (langkah di atas), langkah ini tidak wajib.

- [ ] Di folder proyek: `npx vercel link`, lalu buka `.vercel/project.json` untuk melihat `orgId` dan `projectId`
- [ ] Buat token di https://vercel.com/account/tokens
- [ ] GitHub → repo → **Settings → Secrets and variables → Actions**, tambahkan:
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  - `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_VAPID_PUBLIC_KEY`, `EXPO_PUBLIC_SNOOZE_URL`

---

## 6. Uji di perangkat asli

### Laptop (Chrome / Edge / Safari)
- [ ] Buka domain Vercel → Masuk dengan Google → pilih username
- [ ] Buat tugas, centang, buka kado
- [ ] Settings → **Aktifkan notifikasi** → izinkan
- [ ] Buat tugas yang mulai 3 menit lagi, tutup tab, tunggu notifikasi muncul
- [ ] Klik **Tunda 5 menit** di notifikasi, pastikan muncul lagi 5 menit kemudian

### Android (Chrome)
- [ ] Buka domain → menu ⋮ → **Install app / Tambahkan ke layar utama**
- [ ] Login, lalu cek tugas dari laptop ikut muncul (sinkron)
- [ ] Aktifkan notifikasi dan uji seperti di laptop

### iPhone (Safari, iOS 16.4 ke atas)
- [ ] Buka domain di Safari → tombol **Share** → **Add to Home Screen**
- [ ] Buka aplikasi **dari ikon di Home Screen** (bukan dari Safari)
- [ ] Login Google dan pastikan setelah login kembali ke aplikasi
- [ ] Settings → **Aktifkan notifikasi** → izinkan
- [ ] Uji pengingat dengan tugas 3 menit lagi, lalu kunci layar

---

## Catatan paket gratis

- Proyek Supabase gratis **dijeda setelah 7 hari tanpa aktivitas**. Kalau login atau pengingat tiba-tiba berhenti, buka dashboard Supabase dan klik **Restore project**. Datanya tidak hilang.
- Pemakaian aplikasi ini (±43.000 panggilan fungsi per bulan, database beberapa MB) jauh di bawah batas gratis.

## Kalau ada masalah

| Gejala | Yang dicek |
| --- | --- |
| Tombol login masih "Coba mode lokal" | `.env` belum terisi, atau env di Vercel belum diisi lalu belum redeploy |
| Error `redirect_uri_mismatch` dari Google | Redirect URI di Google Cloud harus persis `https://<ref>.supabase.co/auth/v1/callback` |
| Setelah login kembali ke halaman salah / localhost | Site URL dan Redirect URLs di Supabase Authentication |
| Tidak ada notifikasi saat aplikasi ditutup | Log fungsi `send-reminders`, secret VAPID, izin notifikasi di browser, dan di iPhone harus dibuka dari Home Screen |
| Data tidak sinkron antar perangkat | Login dengan akun Google yang sama; lihat status sinkron di Settings |
