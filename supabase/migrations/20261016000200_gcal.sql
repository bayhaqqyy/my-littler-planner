-- Google Calendar one-way sync (app → Google). Service-role only: RLS on, no policies.
-- The app talks to these through the `gcal` Edge Function, never directly.

create table if not exists public.gcal_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  google_email text,
  refresh_token text not null,
  calendar_id text,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  last_error text
);
alter table public.gcal_connections enable row level security;

-- What has been pushed to Google, so each sync only sends changes.
create table if not exists public.gcal_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  occurrence_key text not null,
  hash text not null,
  primary key (user_id, occurrence_key)
);
alter table public.gcal_events enable row level security;
