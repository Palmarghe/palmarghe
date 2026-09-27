create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  revision integer not null,
  title text not null,
  excerpt text,
  body jsonb,
  type_data jsonb,
  status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(content_id, revision)
);

alter table public.content_revisions enable row level security;

drop policy if exists "content revisions staff read" on public.content_revisions;
create policy "content revisions staff read"
  on public.content_revisions for select
  using ((select public.has_permission('content')));

drop policy if exists "content revisions staff write" on public.content_revisions;
create policy "content revisions staff write"
  on public.content_revisions for insert
  with check ((select public.has_permission('content')));

create or replace function public.capture_content_revision()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
    and (old.title, old.excerpt, old.body, old.type_data, old.status)
      is not distinct from (new.title, new.excerpt, new.body, new.type_data, new.status) then
    return new;
  end if;

  insert into public.content_revisions (
    content_id, revision, title, excerpt, body, type_data, status, changed_by
  )
  values (
    new.id,
    coalesce((select max(revision) + 1 from public.content_revisions where content_id = new.id), 1),
    new.title,
    new.excerpt,
    new.body,
    new.type_data,
    new.status,
    auth.uid()
  );

  return new;
end;
$$;

drop trigger if exists content_revision_capture on public.content_items;
create trigger content_revision_capture
  after insert or update on public.content_items
  for each row execute function public.capture_content_revision();