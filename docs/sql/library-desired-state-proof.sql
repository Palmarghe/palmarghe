-- Controlled authenticated PostgreSQL QA; all temporary writes are rolled back.
-- Uses existing accounts/publications without creating Auth/profile/content records.
begin;
set local lock_timeout='5s';set local statement_timeout='30s';
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='admin' order by id limit 1),true);
select set_config('qa.other',(select id::text from public.profiles where id<>auth.uid() order by id limit 1),true);
with notice as (insert into public.content_notifications(user_id,kind,title,href) values(auth.uid(),'system','Rolled-back library QA','/account/') returning id) select set_config('qa.notice',(select id::text from notice),true);
with notice as (insert into public.content_notifications(user_id,kind,title,href) values(current_setting('qa.other')::uuid,'system','Rolled-back foreign QA','/account/') returning id) select set_config('qa.foreign_notice',(select id::text from notice),true);
set local role authenticated;
do $qa$
declare item uuid; target uuid; stamp timestamptz; n bigint; denied boolean:=false;
begin
 select id into item from public.content_items c where status='published' and published_at<=now()
 and not exists(select 1 from public.content_likes l where l.content_id=c.id and l.user_id=auth.uid())
 and not exists(select 1 from public.content_bookmarks b where b.content_id=c.id and b.user_id=auth.uid()) order by id limit 1;
 if item is null or current_setting('qa.other') is null then raise exception 'No safe QA fixture available';end if;
 insert into public.content_likes(user_id,content_id) values(auth.uid(),item) on conflict(user_id,content_id) do nothing;
 select created_at into stamp from public.content_likes where user_id=auth.uid() and content_id=item;
 insert into public.content_likes(user_id,content_id) values(auth.uid(),item) on conflict(user_id,content_id) do nothing;
 select count(*) into n from public.content_likes where user_id=auth.uid() and content_id=item and created_at=stamp;
 if n<>1 then raise exception 'Like replay changed/duplicated row';end if;
 begin insert into public.content_likes(user_id,content_id) values(current_setting('qa.other')::uuid,item);exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Foreign like accepted';end if;
 delete from public.content_likes where user_id=auth.uid() and content_id=item;
 delete from public.content_likes where user_id=auth.uid() and content_id=item;
 if exists(select 1 from public.content_likes where user_id=auth.uid() and content_id=item) then raise exception 'Like removal failed';end if;
 insert into public.content_bookmarks(user_id,content_id) values(auth.uid(),item) on conflict(user_id,content_id) do nothing;
 select created_at into stamp from public.content_bookmarks where user_id=auth.uid() and content_id=item;
 insert into public.content_bookmarks(user_id,content_id) values(auth.uid(),item) on conflict(user_id,content_id) do nothing;
 select count(*) into n from public.content_bookmarks where user_id=auth.uid() and content_id=item and created_at=stamp;
 if n<>1 then raise exception 'Bookmark replay changed/duplicated row';end if;
 denied:=false;
 begin insert into public.content_bookmarks(user_id,content_id) values(current_setting('qa.other')::uuid,item);exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Foreign bookmark accepted';end if;
 delete from public.content_bookmarks where user_id=auth.uid() and content_id=item;
 delete from public.content_bookmarks where user_id=auth.uid() and content_id=item;
 select id into target from public.categories c where not exists(select 1 from public.content_follows f where f.user_id=auth.uid() and f.target_kind='category' and f.target_id=c.id) order by id limit 1;
 if target is null then raise exception 'No safe follow fixture available';end if;
 insert into public.content_follows(user_id,target_kind,target_id) values(auth.uid(),'category',target) on conflict(user_id,target_kind,target_id) do nothing;
 select created_at into stamp from public.content_follows where user_id=auth.uid() and target_kind='category' and target_id=target;
 insert into public.content_follows(user_id,target_kind,target_id) values(auth.uid(),'category',target) on conflict(user_id,target_kind,target_id) do nothing;
 select count(*) into n from public.content_follows where user_id=auth.uid() and target_kind='category' and target_id=target and created_at=stamp;
 if n<>1 then raise exception 'Follow replay changed/duplicated row';end if;
 denied:=false;
 begin insert into public.content_follows(user_id,target_kind,target_id) values(current_setting('qa.other')::uuid,'category',target);exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Foreign follow accepted';end if;
 delete from public.content_follows where user_id=auth.uid() and target_kind='category' and target_id=target;
 delete from public.content_follows where user_id=auth.uid() and target_kind='category' and target_id=target;
 update public.content_notifications set read_at=now() where id=current_setting('qa.notice')::bigint;
 update public.content_notifications set read_at=now() where id=current_setting('qa.notice')::bigint;
 if not exists(select 1 from public.content_notifications where id=current_setting('qa.notice')::bigint and read_at is not null) then raise exception 'Read acknowledgement failed';end if;
 update public.content_notifications set read_at=now() where id=current_setting('qa.foreign_notice')::bigint;
 get diagnostics n=row_count;
 if n<>0 then raise exception 'Foreign notification modified';end if;
 denied:=false;
 begin update public.content_notifications set title='forbidden' where id=current_setting('qa.notice')::bigint;exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Notification title privilege widened';end if;
end $qa$;
reset role;
do $qa$ begin if exists(select 1 from public.content_notifications where id=current_setting('qa.foreign_notice')::bigint and read_at is not null) then raise exception 'Foreign notification changed';end if;end $qa$;
rollback;
select 'Authenticated desired-state replay/removal/RLS assertions passed; transaction rolled back' result;
