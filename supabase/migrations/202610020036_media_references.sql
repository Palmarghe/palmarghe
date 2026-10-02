-- Derive media references without editing content, revisions or stored files.
-- FK protection is authoritative even when an API usage check races a writer.
begin;
set local lock_timeout = '5s';
lock table public.content_items, public.content_revisions, public.media in share row exclusive mode;

create or replace function public.content_media_ids(p_body jsonb, p_data jsonb, p_cover uuid default null, p_og uuid default null)
returns setof uuid language sql immutable set search_path = '' as $$
  select distinct candidate::uuid from (
    select value #>> '{}' as candidate from pg_catalog.jsonb_path_query(coalesce(p_body, '{}'::jsonb), '$.** ? (@.type == "mediaImage").attrs.media_id') value
    union all
    select value #>> '{}' from pg_catalog.jsonb_path_query(coalesce(p_body, '{}'::jsonb), '$.** ? (@.type == "mediaGallery").attrs.media_ids[*]') value
    union all
    select value #>> '{}' from pg_catalog.jsonb_path_query(coalesce(p_data, '{}'::jsonb), '$.gallery_media_ids[*]') value
    union all select p_cover::text
    union all select p_og::text
  ) refs
  where candidate ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
$$;
revoke all on function public.content_media_ids(jsonb,jsonb,uuid,uuid) from public, anon, authenticated;

create table if not exists public.content_media_references (
  content_id uuid not null references public.content_items(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  primary key(content_id,media_id)
);
create index if not exists content_media_references_media_idx on public.content_media_references(media_id);
create table if not exists public.revision_media_references (
  revision_id uuid not null references public.content_revisions(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  primary key(revision_id,media_id)
);
create index if not exists revision_media_references_media_idx on public.revision_media_references(media_id);
alter table public.content_media_references enable row level security;
alter table public.revision_media_references enable row level security;
revoke all on public.content_media_references, public.revision_media_references from public, anon, authenticated;

create or replace function public.sync_content_media_references()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.content_media_references where content_id=new.id;
  insert into public.content_media_references(content_id,media_id)
  select new.id,id from public.content_media_ids(new.body,case when new.type='gallery' then new.type_data else '{}'::jsonb end,new.cover_media_id,new.og_media_id) id;
  return new;
end;
$$;
create or replace function public.sync_revision_media_references()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.revision_media_references where revision_id=new.id;
  insert into public.revision_media_references(revision_id,media_id)
  select new.id,id from public.content_media_ids(new.body,new.type_data) id;
  return new;
end;
$$;
revoke all on function public.sync_content_media_references(), public.sync_revision_media_references() from public, anon, authenticated;
drop trigger if exists content_media_reference_sync on public.content_items;
create trigger content_media_reference_sync after insert or update of body,type_data,type,cover_media_id,og_media_id on public.content_items
for each row execute function public.sync_content_media_references();
drop trigger if exists revision_media_reference_sync on public.content_revisions;
create trigger revision_media_reference_sync after insert or update of body,type_data on public.content_revisions
for each row execute function public.sync_revision_media_references();

-- Ignore already missing legacy IDs during backfill, preserving the original
-- document. New writes cannot create missing references because the FK rejects.
insert into public.content_media_references(content_id,media_id)
select c.id,m.id from public.content_items c
cross join lateral public.content_media_ids(c.body,case when c.type='gallery' then c.type_data else '{}'::jsonb end,c.cover_media_id,c.og_media_id) ref
join public.media m on m.id=ref
on conflict do nothing;
insert into public.revision_media_references(revision_id,media_id)
select r.id,m.id from public.content_revisions r
cross join lateral public.content_media_ids(r.body,r.type_data) ref
join public.media m on m.id=ref
on conflict do nothing;

create or replace function public.media_is_public(p_media_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.content_media_references r join public.content_items c on c.id=r.content_id
    where r.media_id=p_media_id and c.status in ('published','scheduled') and c.published_at<=now())
$$;
revoke all on function public.media_is_public(uuid) from public;
grant execute on function public.media_is_public(uuid) to anon, authenticated;

create or replace function public.media_has_references(p_media_id uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  if not coalesce((select public.has_permission('media')),false) then
    raise exception 'media permission required' using errcode='42501';
  end if;
  return exists(select 1 from public.content_media_references where media_id=p_media_id)
    or exists(select 1 from public.revision_media_references where media_id=p_media_id);
end;
$$;
revoke all on function public.media_has_references(uuid) from public, anon;
grant execute on function public.media_has_references(uuid) to authenticated;

drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select to anon,authenticated
using ((select public.media_is_public(id)));
drop policy if exists media_storage_public_select on storage.objects;
create policy media_storage_public_select on storage.objects for select to anon,authenticated
using (bucket_id='media' and exists(select 1 from public.media m where m.path=name and public.media_is_public(m.id)));
drop policy if exists media_storage_permission_delete on storage.objects;
create policy media_storage_permission_delete on storage.objects for delete to authenticated
using (bucket_id='media' and (select public.has_permission('media'))
  -- Delete metadata through its FK guard first. Direct Storage deletion must
  -- not leave a live media row that a concurrent/future document can reference.
  and not exists(select 1 from public.media m where m.path=name));

commit;
