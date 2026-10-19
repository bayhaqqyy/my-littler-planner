-- Run the send-reminders Edge Function every minute.
--
-- Before applying, store two secrets in Supabase Vault (SQL editor):
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<random CRON_SECRET, same as the function secret>', 'cron_secret');
-- The function rejects send requests without `Authorization: Bearer <CRON_SECRET>`.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'send-reminders-every-minute',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := jsonb_build_object('action', 'send'),
    timeout_milliseconds := 20000
  );
  $$
);
