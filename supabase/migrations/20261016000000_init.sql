-- My Little Planner: initial schema.
-- Every synced table has the same generic shape used by src/services/sync.ts:
--   (user_id, id, data jsonb, updated_at, deleted, server_updated_at)
-- `updated_at` is the client write time (last-write-wins), `server_updated_at`
-- is set by the server and used as the pull cursor.

create or replace function public.set_server_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- clock_timestamp() (not now()) so rows written later in the same transaction
  -- still get increasing cursors.
  new.server_updated_at := clock_timestamp();
  return new;
end;
$$;

-- profiles
create table public.profiles (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index profiles_cursor_idx on public.profiles (user_id, server_updated_at);
create trigger profiles_server_updated_at
  before insert or update on public.profiles
  for each row execute function public.set_server_updated_at();
alter table public.profiles enable row level security;
create policy "profiles select own" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles insert own" on public.profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "profiles update own" on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "profiles delete own" on public.profiles for delete to authenticated using (user_id = (select auth.uid()));

-- settings
create table public.settings (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index settings_cursor_idx on public.settings (user_id, server_updated_at);
create trigger settings_server_updated_at
  before insert or update on public.settings
  for each row execute function public.set_server_updated_at();
alter table public.settings enable row level security;
create policy "settings select own" on public.settings for select to authenticated using (user_id = (select auth.uid()));
create policy "settings insert own" on public.settings for insert to authenticated with check (user_id = (select auth.uid()));
create policy "settings update own" on public.settings for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "settings delete own" on public.settings for delete to authenticated using (user_id = (select auth.uid()));

-- tasks
create table public.tasks (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index tasks_cursor_idx on public.tasks (user_id, server_updated_at);
create trigger tasks_server_updated_at
  before insert or update on public.tasks
  for each row execute function public.set_server_updated_at();
alter table public.tasks enable row level security;
create policy "tasks select own" on public.tasks for select to authenticated using (user_id = (select auth.uid()));
create policy "tasks insert own" on public.tasks for insert to authenticated with check (user_id = (select auth.uid()));
create policy "tasks update own" on public.tasks for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "tasks delete own" on public.tasks for delete to authenticated using (user_id = (select auth.uid()));

-- occurrences
create table public.occurrences (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index occurrences_cursor_idx on public.occurrences (user_id, server_updated_at);
create trigger occurrences_server_updated_at
  before insert or update on public.occurrences
  for each row execute function public.set_server_updated_at();
alter table public.occurrences enable row level security;
create policy "occurrences select own" on public.occurrences for select to authenticated using (user_id = (select auth.uid()));
create policy "occurrences insert own" on public.occurrences for insert to authenticated with check (user_id = (select auth.uid()));
create policy "occurrences update own" on public.occurrences for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "occurrences delete own" on public.occurrences for delete to authenticated using (user_id = (select auth.uid()));

-- focus_logs
create table public.focus_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index focus_logs_cursor_idx on public.focus_logs (user_id, server_updated_at);
create trigger focus_logs_server_updated_at
  before insert or update on public.focus_logs
  for each row execute function public.set_server_updated_at();
alter table public.focus_logs enable row level security;
create policy "focus_logs select own" on public.focus_logs for select to authenticated using (user_id = (select auth.uid()));
create policy "focus_logs insert own" on public.focus_logs for insert to authenticated with check (user_id = (select auth.uid()));
create policy "focus_logs update own" on public.focus_logs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "focus_logs delete own" on public.focus_logs for delete to authenticated using (user_id = (select auth.uid()));

-- completion_logs
create table public.completion_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index completion_logs_cursor_idx on public.completion_logs (user_id, server_updated_at);
create trigger completion_logs_server_updated_at
  before insert or update on public.completion_logs
  for each row execute function public.set_server_updated_at();
alter table public.completion_logs enable row level security;
create policy "completion_logs select own" on public.completion_logs for select to authenticated using (user_id = (select auth.uid()));
create policy "completion_logs insert own" on public.completion_logs for insert to authenticated with check (user_id = (select auth.uid()));
create policy "completion_logs update own" on public.completion_logs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "completion_logs delete own" on public.completion_logs for delete to authenticated using (user_id = (select auth.uid()));

-- gift_boxes
create table public.gift_boxes (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index gift_boxes_cursor_idx on public.gift_boxes (user_id, server_updated_at);
create trigger gift_boxes_server_updated_at
  before insert or update on public.gift_boxes
  for each row execute function public.set_server_updated_at();
alter table public.gift_boxes enable row level security;
create policy "gift_boxes select own" on public.gift_boxes for select to authenticated using (user_id = (select auth.uid()));
create policy "gift_boxes insert own" on public.gift_boxes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "gift_boxes update own" on public.gift_boxes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "gift_boxes delete own" on public.gift_boxes for delete to authenticated using (user_id = (select auth.uid()));

-- wardrobe
create table public.wardrobe (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index wardrobe_cursor_idx on public.wardrobe (user_id, server_updated_at);
create trigger wardrobe_server_updated_at
  before insert or update on public.wardrobe
  for each row execute function public.set_server_updated_at();
alter table public.wardrobe enable row level security;
create policy "wardrobe select own" on public.wardrobe for select to authenticated using (user_id = (select auth.uid()));
create policy "wardrobe insert own" on public.wardrobe for insert to authenticated with check (user_id = (select auth.uid()));
create policy "wardrobe update own" on public.wardrobe for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "wardrobe delete own" on public.wardrobe for delete to authenticated using (user_id = (select auth.uid()));

-- vouchers
create table public.vouchers (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index vouchers_cursor_idx on public.vouchers (user_id, server_updated_at);
create trigger vouchers_server_updated_at
  before insert or update on public.vouchers
  for each row execute function public.set_server_updated_at();
alter table public.vouchers enable row level security;
create policy "vouchers select own" on public.vouchers for select to authenticated using (user_id = (select auth.uid()));
create policy "vouchers insert own" on public.vouchers for insert to authenticated with check (user_id = (select auth.uid()));
create policy "vouchers update own" on public.vouchers for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "vouchers delete own" on public.vouchers for delete to authenticated using (user_id = (select auth.uid()));

-- daily_notes
create table public.daily_notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index daily_notes_cursor_idx on public.daily_notes (user_id, server_updated_at);
create trigger daily_notes_server_updated_at
  before insert or update on public.daily_notes
  for each row execute function public.set_server_updated_at();
alter table public.daily_notes enable row level security;
create policy "daily_notes select own" on public.daily_notes for select to authenticated using (user_id = (select auth.uid()));
create policy "daily_notes insert own" on public.daily_notes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "daily_notes update own" on public.daily_notes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "daily_notes delete own" on public.daily_notes for delete to authenticated using (user_id = (select auth.uid()));

-- progress
create table public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index progress_cursor_idx on public.progress (user_id, server_updated_at);
create trigger progress_server_updated_at
  before insert or update on public.progress
  for each row execute function public.set_server_updated_at();
alter table public.progress enable row level security;
create policy "progress select own" on public.progress for select to authenticated using (user_id = (select auth.uid()));
create policy "progress insert own" on public.progress for insert to authenticated with check (user_id = (select auth.uid()));
create policy "progress update own" on public.progress for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "progress delete own" on public.progress for delete to authenticated using (user_id = (select auth.uid()));

-- push_subscriptions
create table public.push_subscriptions (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index push_subscriptions_cursor_idx on public.push_subscriptions (user_id, server_updated_at);
create trigger push_subscriptions_server_updated_at
  before insert or update on public.push_subscriptions
  for each row execute function public.set_server_updated_at();
alter table public.push_subscriptions enable row level security;
create policy "push_subscriptions select own" on public.push_subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy "push_subscriptions insert own" on public.push_subscriptions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "push_subscriptions update own" on public.push_subscriptions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "push_subscriptions delete own" on public.push_subscriptions for delete to authenticated using (user_id = (select auth.uid()));

-- Reminder sender bookkeeping (service role only: RLS on, no policies).
create table public.sent_reminders (
  user_id uuid not null references auth.users (id) on delete cascade,
  reminder_id text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, reminder_id)
);
alter table public.sent_reminders enable row level security;

create table public.snoozed_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  occurrence_key text not null,
  title text not null,
  body text not null default '',
  fire_at timestamptz not null,
  sent boolean not null default false
);
create index snoozed_reminders_due_idx on public.snoozed_reminders (fire_at) where not sent;
alter table public.snoozed_reminders enable row level security;
