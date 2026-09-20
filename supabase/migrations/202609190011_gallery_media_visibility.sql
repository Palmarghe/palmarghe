-- Public gallery images are visible only while referenced by a live gallery.
drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (
  exists (
    select 1 from public.content_items c
    where c.status in ('published','scheduled') and c.published_at <= now()
      and (c.cover_media_id = media.id
        or (c.type = 'gallery' and c.type_data -> 'gallery_media_ids' ? media.id::text))
  )
);

drop policy if exists media_storage_public_select on storage.objects;
create policy media_storage_public_select on storage.objects for select to anon,authenticated using (
  bucket_id = 'media' and exists (
    select 1 from public.media m join public.content_items c
      on (c.cover_media_id = m.id
        or (c.type = 'gallery' and c.type_data -> 'gallery_media_ids' ? m.id::text))
    where m.path = name and c.status in ('published','scheduled') and c.published_at <= now()
  )
);

create index if not exists content_gallery_media_idx
  on public.content_items using gin ((type_data -> 'gallery_media_ids'))
  where type = 'gallery';
