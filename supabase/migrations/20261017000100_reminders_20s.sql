-- Run the reminder sender every 20 seconds (was every minute) so timer pushes arrive on time.
-- Same command as 20261016000100_cron.sql; cron.schedule with an existing name updates it.
select cron.schedule(
  'send-reminders-every-minute',
  '20 seconds',
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
