select
 (select count(*) from public.content_items) content_count,
 (select count(*) from public.content_revisions) revision_count,
 (select count(*) from public.media) media_count,
 (select count(*) from storage.objects where bucket_id='media') storage_count,
 (select count(*) from public.content_media_references) content_refs,
 (select count(*) from public.revision_media_references) revision_refs,
 md5((select string_agg(to_jsonb(c)::text,'' order by id) from public.content_items c)) content_hash,
 md5((select string_agg(to_jsonb(r)::text,'' order by id) from public.content_revisions r)) revision_hash,
 md5((select string_agg(to_jsonb(m)::text,'' order by id) from public.media m)) media_hash,
 md5((select string_agg(to_jsonb(o)::text,'' order by id) from storage.objects o where bucket_id='media')) storage_hash,
 has_function_privilege('anon','public.media_has_references(uuid)','execute') anon_usage_rpc,
 has_table_privilege('anon','public.content_media_references','select') anon_refs_read,
 (select count(*) from pg_constraint where conrelid in ('public.content_media_references'::regclass,'public.revision_media_references'::regclass) and contype='f' and confrelid='public.media'::regclass and confdeltype='r') restrict_constraints;
