drop policy content_public_read on public.content_items;
create policy content_public_read on public.content_items for select using (
  ((status in ('published','scheduled')) and published_at <= now())
  or (select public.current_role()) in ('editor','admin')
);
drop policy content_categories_public on public.content_categories;
create policy content_categories_public on public.content_categories for select using (
  exists(select 1 from public.content_items c where c.id=content_id and c.status in ('published','scheduled') and c.published_at<=now())
  or (select public.current_role()) in ('editor','admin')
);
drop policy content_tags_public on public.content_tags;
create policy content_tags_public on public.content_tags for select using (
  exists(select 1 from public.content_items c where c.id=content_id and c.status in ('published','scheduled') and c.published_at<=now())
  or (select public.current_role()) in ('editor','admin')
);
drop policy media_public_read on public.media;
create policy media_public_read on public.media for select using (
  exists(select 1 from public.content_items c where c.cover_media_id=media.id and c.status in ('published','scheduled') and c.published_at<=now())
);
drop policy media_storage_public_select on storage.objects;
create policy media_storage_public_select on storage.objects for select to anon,authenticated using (
  bucket_id='media' and exists (
    select 1 from public.media m join public.content_items c on c.cover_media_id=m.id
    where m.path=name and c.status in ('published','scheduled') and c.published_at<=now()
  )
);
