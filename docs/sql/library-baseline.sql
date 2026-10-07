select 'comments' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id),'')) as fingerprint from public.comments t
union all
select 'content' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id),'')) as fingerprint from public.content_items t
union all
select 'profiles' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id),'')) as fingerprint from public.profiles t
union all
select 'media' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id),'')) as fingerprint from public.media t
union all
select 'settings' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by key),'')) as fingerprint from public.site_settings t
union all
select 'likes' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by user_id,content_id),'')) as fingerprint from public.content_likes t
union all
select 'bookmarks' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by user_id,content_id),'')) as fingerprint from public.content_bookmarks t
union all
select 'follows' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by user_id,target_kind,target_id),'')) as fingerprint from public.content_follows t
union all
select 'notifications' as entity,count(*) as rows,md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by id),'')) as fingerprint from public.content_notifications t;
