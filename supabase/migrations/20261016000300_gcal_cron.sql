-- Push task changes to Google Calendar every 5 minutes (the app also triggers a sync right after edits).
-- Uses the same Vault secrets as the reminder job (project_url, cron_secret).
select cron.schedule(
  'gcal-sync-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/gcal',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := jsonb_build_object('action', 'sync-all'),
    timeout_milliseconds := 50000
  );
  $$
);
