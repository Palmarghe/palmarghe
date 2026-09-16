insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('media','media',false,10485760,array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy media_storage_staff_insert on storage.objects for insert to authenticated
with check (bucket_id='media' and (select public.current_role()) in ('editor','admin'));
create policy media_storage_staff_update on storage.objects for update to authenticated
using (bucket_id='media' and (select public.current_role()) in ('editor','admin'))
with check (bucket_id='media' and (select public.current_role()) in ('editor','admin'));
create policy media_storage_staff_delete on storage.objects for delete to authenticated
using (bucket_id='media' and (select public.current_role()) in ('editor','admin'));
create policy media_storage_staff_select on storage.objects for select to authenticated
using (bucket_id='media' and (select public.current_role()) in ('editor','admin'));
create policy media_storage_public_select on storage.objects for select to anon,authenticated
using (bucket_id='media' and exists (
  select 1 from public.media m join public.content_items c on c.cover_media_id=m.id
  where m.path=name and c.status='published' and c.published_at <= now()
));
