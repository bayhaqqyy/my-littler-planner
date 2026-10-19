// One-shot Supabase setup via the Management API (idempotent; safe to re-run).
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-setup.mjs
//
// Create the token at https://supabase.com/dashboard/account/tokens.
// Reads .env (project URL, SITE_URL, VAPID keys, CRON_SECRET) and client_secret.json (Google OAuth).
// Steps: run migrations → Vault secrets → Google login + URLs → function secrets → deploy send-reminders.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n')
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const token = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_TOKEN || env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_TOKEN;
if (!token) throw new Error('Set SUPABASE_ACCESS_TOKEN or SUPABASE_TOKEN (https://supabase.com/dashboard/account/tokens)');
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const ref = new URL(url).hostname.split('.')[0];
const need = (k) => { if (!env[k] || env[k].startsWith('<')) throw new Error(`Missing ${k} in .env`); return env[k]; };
const siteUrl = need('SITE_URL').replace(/\/$/, '');

const api = async (method, path, body) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
};
const sql = (query) => api('POST', '/database/query', { query });
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`;
const step = (s) => console.log(`\n▶ ${s}`);

// 1. Schema
step('Migrasi database');
const [{ exists }] = await sql("select to_regclass('public.tasks') is not null as exists");
const files = readdirSync('supabase/migrations').sort();
if (exists) console.log('  tabel sudah ada, init dilewati');
else {
  await sql(readFileSync(`supabase/migrations/${files[0]}`, 'utf8'));
  console.log(`  ✓ ${files[0]}`);
}

// 2. Vault secrets for the cron job (create or update)
step('Secret Vault (project_url, cron_secret)');
for (const [name, value] of [['project_url', url], ['cron_secret', need('CRON_SECRET')]]) {
  await sql(`do $$ declare sid uuid; begin
    select id into sid from vault.secrets where name = ${lit(name)};
    if sid is null then perform vault.create_secret(${lit(value)}, ${lit(name)});
    else perform vault.update_secret(sid, ${lit(value)}); end if; end $$;`);
  console.log(`  ✓ ${name}`);
}

// 3. Cron schedule (needs the Vault secrets above)
step('Jadwal pg_cron');
const cronFile = files.find((f) => f.includes('cron'));
const [{ scheduled }] = await sql("select exists(select 1 from pg_extension where extname='pg_cron') and exists(select 1 from cron.job where jobname='send-reminders-every-minute') as scheduled").catch(() => [{ scheduled: false }]);
if (scheduled) console.log('  sudah terjadwal');
else { await sql(readFileSync(`supabase/migrations/${cronFile}`, 'utf8')); console.log(`  ✓ ${cronFile}`); }

// 3b. Google Calendar sync tables + 5-minute job
step('Google Calendar: tabel + jadwal');
const [{ gcal }] = await sql("select to_regclass('public.gcal_connections') is not null as gcal");
const gcalFile = files.find((f) => f.endsWith('_gcal.sql'));
const gcalCronFile = files.find((f) => f.endsWith('_gcal_cron.sql'));
if (gcal) console.log('  tabel sudah ada');
else { await sql(readFileSync(`supabase/migrations/${gcalFile}`, 'utf8')); console.log(`  ✓ ${gcalFile}`); }
const [{ gcalCron }] = await sql("select exists(select 1 from cron.job where jobname='gcal-sync-every-5-minutes') as \"gcalCron\"");
if (gcalCron) console.log('  jadwal sudah ada');
else { await sql(readFileSync(`supabase/migrations/${gcalCronFile}`, 'utf8')); console.log(`  ✓ ${gcalCronFile}`); }

// 3c. Calendar feed (iCal) tokens
step('Connect iCal: tabel');
const [{ ical }] = await sql("select to_regclass('public.ical_tokens') is not null as ical");
const icalFile = files.find((f) => f.endsWith('_ical.sql'));
if (ical) console.log('  tabel sudah ada');
else { await sql(readFileSync(`supabase/migrations/${icalFile}`, 'utf8')); console.log(`  ✓ ${icalFile}`); }

// 3d. Deadline feature: migrate v1 date-only deadlines in task rows (idempotent)
step('Fitur Deadline: migrasi data lama');
const [{ legacy }] = await sql("select count(*)::int as legacy from public.tasks where not deleted and (not (data ? 'kind') or data ? 'deadline')");
const dlFile = files.find((f) => f.endsWith('_deadline.sql'));
if (!legacy) console.log('  tidak ada data lama');
else { await sql(readFileSync(`supabase/migrations/${dlFile}`, 'utf8')); console.log(`  ✓ ${dlFile} (${legacy} tugas)`); }

// 4. Google login + redirect URLs
step('Login Google + URL');
if (!existsSync('client_secret.json')) throw new Error('client_secret.json tidak ditemukan');
const g = JSON.parse(readFileSync('client_secret.json', 'utf8')).web;
const callback = `${url}/auth/v1/callback`;
if (!g.redirect_uris?.includes(callback)) {
  console.log(`  ⚠ Redirect URI di Google Console belum benar. Tambahkan:\n    ${callback}`);
}
await api('PATCH', '/config/auth', {
  site_url: siteUrl,
  uri_allow_list: [siteUrl, `${siteUrl}/**`, 'http://localhost:8088', 'http://localhost:8081'].join(','),
  external_google_enabled: true,
  external_google_client_id: g.client_id,
  external_google_secret: g.client_secret,
});
console.log(`  ✓ Google aktif, Site URL ${siteUrl}`);

// 4b. Custom SMTP (Resend) + Indonesian email templates — only when RESEND_API_KEY is set
step('Email (SMTP + template)');
if (!env.RESEND_API_KEY || env.RESEND_API_KEY.startsWith('<')) {
  console.log('  dilewati: RESEND_API_KEY belum ada di .env');
} else {
  const sender = env.SMTP_SENDER || 'noreply@bayhaqqy.my.id';
  await api('PATCH', '/config/auth', {
    smtp_host: 'smtp.resend.com',
    smtp_port: '465',
    smtp_user: 'resend',
    smtp_pass: env.RESEND_API_KEY,
    smtp_admin_email: sender,
    smtp_sender_name: 'My Little Planner',
    rate_limit_email_sent: 30, // per hour
    mailer_subjects_confirmation: 'Verifikasi email My Little Planner',
    mailer_templates_confirmation_content: readFileSync('supabase/templates/confirmation.html', 'utf8'),
    mailer_subjects_recovery: 'Reset password My Little Planner',
    mailer_templates_recovery_content: readFileSync('supabase/templates/recovery.html', 'utf8'),
  });
  console.log(`  ✓ SMTP Resend, pengirim ${sender}, batas 30 email/jam, template Indonesia`);
}

// 5. Function secrets
step('Secret Edge Function');
await api('POST', '/secrets', [
  ...['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT', 'CRON_SECRET', 'GCAL_STATE_SECRET'].map((name) => ({ name, value: need(name) })),
  { name: 'GOOGLE_CLIENT_ID', value: g.client_id },
  { name: 'GOOGLE_CLIENT_SECRET', value: g.client_secret },
  { name: 'APP_URL', value: siteUrl },
]);
console.log('  ✓ VAPID_*, CRON_SECRET, GOOGLE_CLIENT_*, GCAL_STATE_SECRET, APP_URL');

// 6. Deploy Edge Functions (server-side bundling, no Docker needed)
step('Deploy send-reminders + gcal + ical');
execFileSync('node', ['scripts/build-edge-domain.mjs'], { stdio: 'inherit' });
for (const fn of ['send-reminders', 'gcal', 'ical']) {
  execFileSync('npx', ['supabase', 'functions', 'deploy', fn, '--project-ref', ref, '--use-api', '--no-verify-jwt'], {
    stdio: 'inherit', env: { ...process.env, SUPABASE_ACCESS_TOKEN: token },
  });
}
console.log(`\n  Google Console → OAuth client → Authorized redirect URIs harus berisi:\n    ${url}/functions/v1/gcal`);

console.log('\n✅ Selesai. Build ulang web: docker compose up -d --build web');
