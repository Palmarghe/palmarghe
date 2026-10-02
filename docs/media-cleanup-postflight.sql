select jsonb_build_object(
 'content_count',(select count(*) from public.content_items),
 'revision_count',(select count(*) from public.content_revisions),
 'media_count',(select count(*) from public.media),
 'storage_count',(select count(*) from storage.objects where bucket_id='media'),
 'content_hash',md5((select string_agg(to_jsonb(c)::text,'' order by id) from public.content_items c)),
 'revision_hash',md5((select string_agg(to_jsonb(r)::text,'' order by id) from public.content_revisions r)),
 'media_hash',md5((select string_agg(to_jsonb(m)::text,'' order by id) from public.media m)),
 'storage_hash',md5((select string_agg(to_jsonb(o)::text,'' order by id) from storage.objects o where bucket_id='media')),
 'cleanup_count',(select count(*) from public.media_cleanup_queue),
 'cleanup_trigger',(select count(*)=1 from pg_trigger where tgrelid='public.media'::regclass and tgname='media_cleanup_receipt' and tgenabled='O')
) as state;
