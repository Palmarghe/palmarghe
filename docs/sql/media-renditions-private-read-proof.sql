-- Read-only role exercise over an actual existing private original and its derivatives.
begin;
do $$ begin
  perform set_config('qa.private_media',(select m.id::text from public.media m
    where not public.media_is_public(m.id) and exists(select 1 from public.media_renditions r where r.media_id=m.id)
    order by m.id limit 1),true);
  if nullif(current_setting('qa.private_media',true),'') is null then raise exception 'No prepared private original'; end if;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{}',true);
end $$;
set local role anon;
do $$ begin
  if exists(select 1 from public.media where id=current_setting('qa.private_media')::uuid)
    or exists(select 1 from public.media_renditions where media_id=current_setting('qa.private_media')::uuid)
    or exists(select 1 from storage.objects where bucket_id='media' and name like 'renditions/'||current_setting('qa.private_media')||'/%') then
    raise exception 'Anonymous private original or derivative visible';
  end if;
end $$;
reset role;
do $$ begin
  perform set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='member' order by id limit 1),true);
  if auth.uid() is null then raise exception 'No real member for read proof'; end if;
end $$;
set local role authenticated;
do $$ begin
  if exists(select 1 from public.media where id=current_setting('qa.private_media')::uuid)
    or exists(select 1 from public.media_renditions where media_id=current_setting('qa.private_media')::uuid)
    or exists(select 1 from storage.objects where bucket_id='media' and name like 'renditions/'||current_setting('qa.private_media')||'/%') then
    raise exception 'Member private original or derivative visible';
  end if;
end $$;
reset role;
select 'private_original_and_derivative_reads_denied' as result;
rollback;
