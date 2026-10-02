-- Production preflight: PostgreSQL 17.6; media=7, content=12, revisions=8,
-- media Storage objects=7. Read from Chrome Supabase SQL results before 036.
-- These are the three original policies affected by migration 036.
-- Rollback only; do not run during normal deployment.
begin;
drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (
  exists(select 1 from public.content_items c where (c.cover_media_id=media.id or c.og_media_id=media.id) and c.status='published' and c.published_at<=now())
);
drop policy if exists media_storage_public_select on storage.objects;
create policy media_storage_public_select on storage.objects for select using (
  bucket_id='media' and exists(select 1 from public.media m where m.path=name and (
    exists(select 1 from public.content_items c where (c.cover_media_id=m.id or c.og_media_id=m.id) and c.status='published' and c.published_at<=now())
    or exists(select 1 from public.content_items c where c.type='gallery' and c.status in ('published','scheduled') and c.published_at<=now() and c.type_data->'gallery_media_ids' ? m.id::text)
  ))
);
drop policy if exists media_storage_permission_delete on storage.objects;
create policy media_storage_permission_delete on storage.objects for delete to authenticated
using (bucket_id='media' and (select public.has_permission('media')));
-- Preserve derived references/FK protection by default. A full schema rollback
-- requires first reverting Worker usage of media_has_references, then dropping
-- the new triggers and derived tables under a separate reviewed maintenance step.
commit;
