-- A metadata deletion and its cleanup receipt commit atomically. No files or
-- source rows are deleted by this migration; older orphans are not inferred.
begin;
set local lock_timeout = '5s';
create table public.media_cleanup_queue (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null unique,
  path text not null,
  created_at timestamptz not null default now()
);
alter table public.media_cleanup_queue enable row level security;
revoke all on public.media_cleanup_queue from public, anon, authenticated;

create function public.enqueue_deleted_media()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.media_cleanup_queue(media_id,path) values(old.id,old.path);
  return old;
end;
$$;
revoke all on function public.enqueue_deleted_media() from public,anon,authenticated;
create trigger media_cleanup_receipt after delete on public.media
for each row execute function public.enqueue_deleted_media();

create function public.pending_media_cleanup(p_media_id uuid default null)
returns table(id uuid,media_id uuid,path text,created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not coalesce((select public.has_permission('media')),false) then
    raise exception 'media permission required' using errcode='42501';
  end if;
  return query select q.id,q.media_id,q.path,q.created_at from public.media_cleanup_queue q
    where p_media_id is null or q.media_id=p_media_id order by q.created_at,q.id limit 20;
end;
$$;

create function public.complete_media_cleanup(p_task_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare removed uuid;
begin
  if not coalesce((select public.has_permission('media')),false) then
    raise exception 'media permission required' using errcode='42501';
  end if;
  -- A Storage API success alone is insufficient. Keep the receipt while the
  -- object or a live metadata row still exists, including retries after timeout.
  delete from public.media_cleanup_queue q where q.id=p_task_id
    and not exists(select 1 from public.media m where m.path=q.path)
    and not exists(select 1 from storage.objects s where s.bucket_id='media' and s.name=q.path)
    returning q.id into removed;
  return removed is not null;
end;
$$;
revoke all on function public.pending_media_cleanup(uuid),public.complete_media_cleanup(uuid) from public,anon;
grant execute on function public.pending_media_cleanup(uuid),public.complete_media_cleanup(uuid) to authenticated;
commit;
