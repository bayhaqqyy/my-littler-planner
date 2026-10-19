-- PRD "Fitur Deadline": move the v1 date-only `deadline` into the new task model.
-- Rows are jsonb (`data`), so this edits the JSON instead of adding columns. Same rules as
-- migrateTask() in src/domain/deadline.ts; updated_at = now() so clients take the result.

-- 1. deadline without a start time → kind 'deadline' at 23:59 with the default reminders
update public.tasks
set data = ((data - 'deadline' - 'end' - 'durationMin') || jsonb_build_object(
      'kind', 'deadline', 'date', data->>'deadline', 'dueTime', '23:59',
      'deadlineRemindersMin', '[1440, 60, 0]'::jsonb,
      'remindBeforeMin', 0, 'remindAtStart', false, 'remindAtEnd', false,
      'updatedAt', to_jsonb(now()))),
    updated_at = now()
where not deleted and nullif(data->>'deadline', '') is not null and data->>'start' is null;

-- 2. deadline with a start time → stays scheduled, old value becomes "Batas akhir" (hardStop)
update public.tasks
set data = ((data - 'deadline') || jsonb_build_object(
      'kind', 'scheduled', 'hardStop', (data->>'deadline') || 'T23:59', 'updatedAt', to_jsonb(now()))),
    updated_at = now()
where not deleted and nullif(data->>'deadline', '') is not null and data->>'start' is not null;

-- 3. everything else from v1: mark as scheduled (and drop an empty deadline field)
update public.tasks
set data = ((data - 'deadline') || jsonb_build_object('kind', 'scheduled', 'updatedAt', to_jsonb(now()))),
    updated_at = now()
where not deleted and not (data ? 'kind');

-- Deadline occurrences are looked up by user and due time.
create index if not exists occurrences_due_at_idx on public.occurrences (user_id, ((data->>'dueAt'))) where data ? 'dueAt';
