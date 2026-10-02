-- All fixtures are transactional and rolled back. No physical files are touched.
begin;
set local lock_timeout='2s';
create temporary table cleanup_qa(check_name text,passed boolean) on commit drop;
grant select,insert on cleanup_qa to anon,authenticated;
insert into cleanup_qa values
 ('queue RLS enabled',(select relrowsecurity from pg_class where oid='public.media_cleanup_queue'::regclass)),
 ('anonymous cannot read queue',not has_table_privilege('anon','public.media_cleanup_queue','select')),
 ('authenticated cannot edit queue directly',not has_table_privilege('authenticated','public.media_cleanup_queue','insert,update,delete'));
set local role anon;
do $$declare denied boolean=false;begin
 begin perform public.pending_media_cleanup();exception when insufficient_privilege then denied=true;end;
 if not denied then raise exception 'Anonymous queue RPC allowed';end if;
 insert into cleanup_qa values('actual anonymous RPC denied',denied);
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true),set_config('request.jwt.claims','{}',true);
set local role authenticated;
do $$declare denied boolean=false;begin
 begin perform public.pending_media_cleanup();exception when insufficient_privilege then denied=true;end;
 if not denied then raise exception 'Permissionless queue RPC allowed';end if;
 insert into cleanup_qa values('actual permissionless RPC denied',denied);
end $$;
reset role;
do $$declare target uuid;blocked boolean=false;before_count bigint;begin
 select media_id into target from public.content_media_references limit 1;
 select count(*) into before_count from public.media_cleanup_queue;
 begin delete from public.media where id=target;exception when foreign_key_violation or restrict_violation then blocked=true;end;
 if not blocked then raise exception 'Reference guard failed';end if;
 insert into cleanup_qa values('FK rejection creates no cleanup receipt',blocked and (select count(*)=before_count from public.media_cleanup_queue));
end $$;
-- Use new UUIDs and a reserved name, not an existing content/file/account row.
create temporary table cleanup_fixture as select gen_random_uuid() media_id,gen_random_uuid() object_id,'qa-cleanup-'||gen_random_uuid()||'.png' path;
insert into public.media(id,path,mime,bytes,alt_tr) select media_id,path,'image/png',1,'Rollback-only cleanup QA' from cleanup_fixture;
delete from public.media where id=(select media_id from cleanup_fixture);
insert into cleanup_qa select 'atomic receipt contains exact path',exists(select 1 from public.media_cleanup_queue q join cleanup_fixture f on q.media_id=f.media_id and q.path=f.path);
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='admin' limit 1),true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('request.jwt.claim.sub'),'role','authenticated')::text,true);
grant select on cleanup_fixture to authenticated;
-- Undo the Storage metadata fixture with a savepoint, respecting Supabase's
-- protect_delete trigger. Never disable it or directly DELETE Storage rows.
savepoint storage_fixture;
insert into storage.objects(id,bucket_id,name) select object_id,'media',path from cleanup_fixture;
set local role authenticated;
do $$declare task uuid;begin
 select q.id into task from public.pending_media_cleanup() q join cleanup_fixture f on q.media_id=f.media_id;
 if task is null or public.complete_media_cleanup(task) then raise exception 'Storage guard failed';end if;
end $$;
reset role;
rollback to savepoint storage_fixture;
insert into cleanup_qa values('Storage object retains cleanup receipt',true);
set local role authenticated;
insert into cleanup_qa select 'absent file completes receipt',public.complete_media_cleanup(q.id)
from public.pending_media_cleanup() q join cleanup_fixture f on q.media_id=f.media_id;
insert into cleanup_qa select 'completed receipt no longer listed',not exists(select 1 from public.pending_media_cleanup() q join cleanup_fixture f on q.media_id=f.media_id);
reset role;
select * from cleanup_qa order by check_name;
rollback;
