-- Private calendar feed (iCal) per account. The token is the only secret in the feed URL,
-- so it can be rotated. Service-role only: RLS on, no policies.
create table if not exists public.ical_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);
alter table public.ical_tokens enable row level security;
