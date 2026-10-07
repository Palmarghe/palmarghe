-- Add derived images without changing an original media row or object.
begin;
set local lock_timeout = '5s';

create table public.media_renditions (
  media_id uuid not null references public.media(id) on delete cascade,
  width integer not null check (width in (320,640,960)),
  height integer not null check (height between 1 and 4096),
  path text not null unique,
  bytes integer not null check (bytes between 1 and 2097152),
  primary key (media_id,width)
);
create table public.media_rendition_jobs (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media(id) on delete cascade,
  source_path text not null,
  descriptors jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  completed boolean not null default false
);
create index media_rendition_jobs_media_idx on public.media_rendition_jobs(media_id);
alter table public.media_renditions enable row level security;
alter table public.media_rendition_jobs enable row level security;
revoke all on public.media_renditions,public.media_rendition_jobs from public,anon,authenticated;
grant select on public.media_renditions to anon,authenticated;
-- SELECT obeys the original media row's own RLS, including custom staff groups.
create policy media_rendition_read on public.media_renditions for select to anon,authenticated
using (exists(select 1 from public.media m where m.id=media_id));

create function public.prepare_media_renditions(p_media_id uuid,p_source_path text,p_descriptors jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare source public.media; job_id uuid := gen_random_uuid(); d jsonb; prepared jsonb := '[]';
  w integer; h integer; n integer;
begin
  if auth.uid() is null or not coalesce((select public.current_role()) in ('admin','editor'),false)
    or not coalesce((select public.has_permission('media')),false) then
    raise exception 'media permission required' using errcode='42501';
  end if;
  select * into source from public.media where id=p_media_id for update;
  if not found or source.path is distinct from p_source_path or source.width is null or source.height is null
    or source.width<1 or source.height<1 or source.bytes is null or source.bytes<1 then
    raise exception 'source unavailable' using errcode='22023';
  end if;
  if jsonb_typeof(p_descriptors) is distinct from 'array' or jsonb_array_length(p_descriptors) not between 1 and 3 then
    raise exception 'invalid renditions' using errcode='22023';
  end if;
  if (select count(*) from public.media_rendition_jobs where media_id=p_media_id and not completed)>=16 then
    raise exception 'pending rendition limit' using errcode='54000';
  end if;
  for d in select value from jsonb_array_elements(p_descriptors) loop
    if jsonb_typeof(d) is distinct from 'object' or ((d->>'width') ~ '^[0-9]+$') is distinct from true
      or ((d->>'height') ~ '^[0-9]+$') is distinct from true or ((d->>'bytes') ~ '^[0-9]+$') is distinct from true then
      raise exception 'invalid dimensions' using errcode='22023';
    end if;
    w:=(d->>'width')::integer; h:=(d->>'height')::integer; n:=(d->>'bytes')::integer;
    if w not in (320,640,960) or w>=source.width or h<>greatest(1,round(source.height::numeric*w/source.width)::integer)
      or n<1 or n>2097152 or n>=source.bytes then
      raise exception 'invalid or larger rendition' using errcode='22023';
    end if;
    if exists(select 1 from jsonb_array_elements(prepared) x where (x->>'width')::integer=w) then
      raise exception 'duplicate width' using errcode='22023';
    end if;
    prepared:=prepared||jsonb_build_array(jsonb_build_object('width',w,'height',h,'bytes',n,
      'path','renditions/'||p_media_id::text||'/'||job_id::text||'/'||w::text||'.webp'));
  end loop;
  insert into public.media_rendition_jobs(id,media_id,source_path,descriptors,created_by)
    values(job_id,p_media_id,source.path,prepared,auth.uid());
  return jsonb_build_object('id',job_id,'descriptors',prepared);
end;
$$;

create function public.complete_media_renditions(p_job_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare job public.media_rendition_jobs; d jsonb;
begin
  if auth.uid() is null or not coalesce((select public.current_role()) in ('admin','editor'),false)
    or not coalesce((select public.has_permission('media')),false) then
    raise exception 'media permission required' using errcode='42501';
  end if;
  select * into job from public.media_rendition_jobs where id=p_job_id and created_by=auth.uid();
  if not found then return false; end if;
  -- Lock the parent: concurrent deletion cannot commit between validation and insert.
  perform 1 from public.media where id=job.media_id and path=job.source_path for update;
  if not found then return false; end if;
  select * into job from public.media_rendition_jobs where id=p_job_id and created_by=auth.uid() for update;
  if not found then return false; end if;
  if job.completed then return true; end if;
  for d in select value from jsonb_array_elements(job.descriptors) loop
    if not exists(select 1 from storage.objects s where s.bucket_id='media' and s.name=d->>'path'
      and s.metadata->>'mimetype'='image/webp' and s.metadata->>'size'=d->>'bytes') then return false; end if;
  end loop;
  for d in select value from jsonb_array_elements(job.descriptors) loop
    insert into public.media_renditions(media_id,width,height,path,bytes)
      values(job.media_id,(d->>'width')::integer,(d->>'height')::integer,d->>'path',(d->>'bytes')::integer)
      on conflict (media_id,width) do nothing;
  end loop;
  update public.media_rendition_jobs set completed=true where id=job.id;
  return true;
end;
$$;
revoke all on function public.prepare_media_renditions(uuid,text,jsonb),public.complete_media_renditions(uuid) from public,anon;
grant execute on function public.prepare_media_renditions(uuid,text,jsonb),public.complete_media_renditions(uuid) to authenticated;

create policy media_storage_rendition_public_read on storage.objects for select to anon,authenticated
using (bucket_id='media' and exists(select 1 from public.media_renditions r where r.path=name and public.media_is_public(r.media_id)));
-- No in-place replacement of a published derivative through a permissive staff UPDATE policy.
create policy media_storage_rendition_immutable on storage.objects as restrictive for update to authenticated
using (bucket_id<>'media' or name not like 'renditions/%')
with check (bucket_id<>'media' or name not like 'renditions/%');
create policy media_storage_rendition_delete_guard on storage.objects as restrictive for delete to authenticated
using (bucket_id<>'media' or not exists(select 1 from public.media_renditions r where r.path=name));

alter table public.media_cleanup_queue add column derived_paths text[] not null default '{}';
create or replace function public.enqueue_deleted_media()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.media_cleanup_queue(media_id,path,derived_paths)
    select old.id,old.path,coalesce(array_agg(distinct path),'{}') from (
      select r.path from public.media_renditions r where r.media_id=old.id
      union all select d->>'path' from public.media_rendition_jobs j
        cross join lateral jsonb_array_elements(j.descriptors) d where j.media_id=old.id
    ) paths;
  return old;
end;
$$;
-- Capture paths before FK cascade; a later restrictive reference failure rolls this back too.
drop trigger media_cleanup_receipt on public.media;
create trigger media_cleanup_receipt before delete on public.media
for each row execute function public.enqueue_deleted_media();

drop function public.pending_media_cleanup(uuid);
create function public.pending_media_cleanup(p_media_id uuid default null)
returns table(id uuid,media_id uuid,path text,created_at timestamptz,derived_paths text[])
language plpgsql stable security definer set search_path = '' as $$
begin
  if not coalesce((select public.has_permission('media')),false) then
    raise exception 'media permission required' using errcode='42501';
  end if;
  return query select q.id,q.media_id,q.path,q.created_at,q.derived_paths from public.media_cleanup_queue q
    where p_media_id is null or q.media_id=p_media_id order by q.created_at,q.id limit 20;
end;
$$;
revoke all on function public.pending_media_cleanup(uuid) from public,anon;
grant execute on function public.pending_media_cleanup(uuid) to authenticated;
create or replace function public.complete_media_cleanup(p_task_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare removed uuid;
begin
  if not coalesce((select public.has_permission('media')),false) then
    raise exception 'media permission required' using errcode='42501';
  end if;
  delete from public.media_cleanup_queue q where q.id=p_task_id
    and not exists(select 1 from public.media m where m.path=q.path)
    and not exists(select 1 from public.media_renditions r where r.path=any(q.derived_paths))
    and not exists(select 1 from storage.objects s where s.bucket_id='media' and s.name=any(array_prepend(q.path,q.derived_paths)))
    returning q.id into removed;
  return removed is not null;
end;
$$;
commit;
