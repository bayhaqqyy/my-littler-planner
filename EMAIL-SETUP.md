# Setup Email — noreply@bayhaqqy.my.id

Tujuan: email verifikasi akun dan reset password dikirim dari **noreply@bayhaqqy.my.id** dan masuk inbox, bukan spam.

Kamu cukup menyiapkan **2 kunci** (langkah 1–3). Sisanya (DNS, verifikasi domain, SMTP Supabase, template, email uji) dikerjakan Claude.

> ⚠️ Kunci ditaruh di file **`.env`**, bukan di file `.md` ini dan bukan di chat. `.env` tidak ikut ter-commit ke GitHub.

---

## 1. Cloudflare API Token (khusus DNS domain ini)

- [ ] Buka https://dash.cloudflare.com/profile/api-tokens
- [ ] **Create Token** → pilih template **Edit zone DNS** → **Use template**
- [ ] *Zone Resources*: **Include → Specific zone → bayhaqqy.my.id**
- [ ] **Continue to summary** → **Create Token** → salin tokennya

Token ini hanya bisa mengubah DNS `bayhaqqy.my.id`, tidak bisa membuka akun atau domain lain. Bisa dicabut kapan saja.

## 2. Resend API Key

- [ ] Daftar di https://resend.com (boleh "Continue with Google")
- [ ] **API Keys → Create API Key**
  - Name: `my-little-planner`
  - Permission: **Full access** (sementara, supaya domain bisa ditambahkan dan diverifikasi)
- [ ] Salin kuncinya (diawali `re_`)

## 3. Masukkan ke `.env`

Buka `~/my-littler-planner/.env`, tambahkan di paling bawah:

```bash
CLOUDFLARE_API_TOKEN=tempel_token_cloudflare
RESEND_API_KEY=re_tempel_kunci_resend
SMTP_SENDER=noreply@bayhaqqy.my.id
```

- [ ] Simpan file, lalu kabari Claude: **"kunci email sudah di .env"**

---

## Yang dikerjakan Claude setelah itu

1. Menambahkan domain `bayhaqqy.my.id` di Resend (region Tokyo).
2. Memasang DNS di Cloudflare (semua *DNS only*, tidak mengganggu Email Routing yang sudah ada):

   | Tipe | Nama | Isi |
   | --- | --- | --- |
   | TXT | `resend._domainkey` | DKIM dari Resend |
   | MX | `send` | `feedback-smtp.ap-northeast-1.amazonses.com` (prioritas 10) |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` |
   | TXT | `_dmarc` | `v=DMARC1; p=none; adkim=r; aspf=r` |

3. Menunggu domain berstatus *Verified* di Resend.
4. Memasang SMTP di Supabase: pengirim **My Little Planner &lt;noreply@bayhaqqy.my.id&gt;**, template email bahasa Indonesia, batas 30 email/jam.
5. Mengirim email uji ke alamat yang kamu tentukan dan mengecek apakah masuk inbox.

## Setelah selesai (keamanan)

- [ ] Ganti Resend key ke kunci baru dengan izin **Sending access** saja (Claude bisa bantu), hapus yang *Full access*
- [ ] Cabut Cloudflare token di https://dash.cloudflare.com/profile/api-tokens
- [ ] Hapus `SUPABASE_TOKEN` dari `.env` dan cabut di https://supabase.com/dashboard/account/tokens
- [ ] Ganti password akun Google yang sempat tertulis di chat, lalu aktifkan verifikasi 2 langkah

## Supaya tidak masuk spam

- SPF + DKIM (dari Resend) + DMARC membuat email terbukti benar-benar dari domainmu. Ini yang paling menentukan.
- Domain baru belum punya reputasi: kalau email pertama masuk spam, tandai **"Bukan spam"** dan simpan `noreply@bayhaqqy.my.id` ke kontak. Setelah itu biasanya masuk inbox.
- Opsional: di Cloudflare **Email Routing**, teruskan `noreply@bayhaqqy.my.id` ke email pribadimu supaya pesan balasan atau gagal kirim tidak hilang.
- Setelah beberapa minggu lancar, DMARC bisa dinaikkan ke `p=quarantine`.
