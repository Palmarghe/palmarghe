-- Controlled production SQL QA: all operations are rolled back; no files touched.
begin;
set local lock_timeout='2s';
create temporary table qa_media_results(check_name text,passed boolean) on commit drop;
grant select,insert on qa_media_results to anon,authenticated;
do $$
declare target uuid; blocked boolean=false;
begin
 select media_id into target from public.content_media_references limit 1;
 if target is null then raise exception 'No referenced fixture available'; end if;
 begin
  delete from public.media where id=target;
 exception when foreign_key_violation or restrict_violation then blocked=true;
 end;
 if not blocked then raise exception 'Referenced media deletion was not blocked'; end if;
 insert into qa_media_results values('real referenced metadata FK rejection',blocked);
end $$;
insert into qa_media_results values
 ('anonymous cannot read derived references',not has_table_privilege('anon','public.content_media_references','select')),
 ('anonymous cannot call usage helper',not has_function_privilege('anon','public.media_has_references(uuid)','execute')),
 ('two restrictive media FK guards',(select count(*)=2 from pg_constraint where conrelid in ('public.content_media_references'::regclass,'public.revision_media_references'::regclass) and contype='f' and confrelid='public.media'::regclass and confdeltype='r'));
set local role anon;
do $$
declare denied boolean=false;
begin
 begin perform public.media_has_references('00000000-0000-4000-8000-000000000000'); exception when insufficient_privilege then denied=true; end;
 if not denied then raise exception 'Anonymous usage call allowed'; end if;
 insert into qa_media_results values('actual anonymous usage RPC rejection',denied);
end $$;
insert into qa_media_results select 'anonymous visible media all publication eligible',not exists(select 1 from public.media where not public.media_is_public(id));
reset role;
set local role authenticated;
do $$
declare denied boolean=false;
begin
 begin perform public.media_has_references('00000000-0000-4000-8000-000000000000'); exception when insufficient_privilege then denied=true; end;
 if not denied then raise exception 'Permissionless authenticated usage call allowed'; end if;
 insert into qa_media_results values('actual permissionless authenticated RPC rejection',denied);
end $$;
reset role;
select * from qa_media_results order by check_name;
rollback;
