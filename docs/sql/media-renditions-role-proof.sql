-- Append after migration045 body inside ONE transaction; end with ROLLBACK.
-- Existing original rows/objects are read only. All new metadata is rolled back.
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='admin' order by id limit 1),true);
set local role authenticated;
do $$
declare source public.media; job jsonb; d jsonb;
begin
  select * into source from public.media
  where width>640 and height>0 and bytes>24000 and public.media_is_public(id)
  order by id limit 1;
  if not found then raise exception 'No eligible published original for proof'; end if;
  job:=public.prepare_media_renditions(source.id,source.path,jsonb_build_array(
    jsonb_build_object('width',320,'height',greatest(1,round(source.height::numeric*320/source.width)::int),'bytes',12000),
    jsonb_build_object('width',640,'height',greatest(1,round(source.height::numeric*640/source.width)::int),'bytes',24000)));
  if public.complete_media_renditions((job->>'id')::uuid) then raise exception 'Incomplete objects accepted'; end if;
  for d in select value from jsonb_array_elements(job->'descriptors') loop
    insert into storage.objects(bucket_id,name,metadata)
      values('media',d->>'path',jsonb_build_object('mimetype','image/webp','size',(d->>'bytes')::int));
  end loop;
  if not public.complete_media_renditions((job->>'id')::uuid) then raise exception 'Confirmed objects not accepted'; end if;
  if not public.complete_media_renditions((job->>'id')::uuid) then raise exception 'Replay not idempotent'; end if;
  begin
    perform 1 from public.media_rendition_jobs;
    raise exception 'Private jobs readable';
  exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  if (select count(*) from public.media_renditions)<>2 then raise exception 'Published derivative visibility mismatch'; end if;
  if (select count(*) from storage.objects where bucket_id='media' and name like 'renditions/%')<>2 then raise exception 'Published Storage visibility mismatch'; end if;
  begin
    perform public.prepare_media_renditions(gen_random_uuid(),'unused','[]');
    raise exception 'Anonymous write allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='member' order by id limit 1),true);
set local role authenticated;
do $$ begin
  begin
    perform public.prepare_media_renditions(gen_random_uuid(),'unused','[]');
    raise exception 'Member write allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'role_rehearsal_passed' as result;
