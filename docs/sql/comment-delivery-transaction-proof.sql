begin;
set local lock_timeout='5s';set local statement_timeout='30s';
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='admin' order by id limit 1),true);
set local role authenticated;
do $qa$
declare v_content uuid; v_first jsonb; v_retry jsonb; v_denied boolean:=false; v_key uuid:='c723f732-f3e3-4914-bba6-47f1ed3c9b52';
begin
 select id into v_content from public.content_items where status='published' and published_at<=now() order by id limit 1;
 if v_content is null then raise exception 'missing production fixture';end if;
 v_first:=public.deliver_comment(v_content,v_key,'QA transaction: rolled back');
 if not(v_first->>'created')::boolean or v_first->>'id' is null then raise exception 'first delivery failed';end if;
 v_retry:=public.deliver_comment(v_content,v_key,'QA transaction: rolled back');
 if (v_retry->>'created')::boolean or v_retry->>'id'<>v_first->>'id' then raise exception 'duplicate delivery';end if;
 begin perform public.deliver_comment(v_content,v_key,'Different body');exception when sqlstate '22023' then v_denied:=true;end;
 if not v_denied then raise exception 'changed payload accepted';end if;v_denied:=false;
 begin perform 1 from public.comment_deliveries;exception when insufficient_privilege then v_denied:=true;end;
 if not v_denied then raise exception 'private receipts exposed';end if;
 delete from public.comments where id=(v_first->>'id')::uuid;
 v_retry:=public.deliver_comment(v_content,v_key,'QA transaction: rolled back');
 if not(v_retry->>'removed')::boolean or v_retry->>'id' is not null or (v_retry->>'created')::boolean then raise exception 'deleted delivery resurrected';end if;
end $qa$;
reset role;set local role anon;
do $qa$
declare denied boolean:=false;
begin
 begin perform public.deliver_comment(gen_random_uuid(),gen_random_uuid(),'Anonymous QA');exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'anonymous delivery exposed';end if;denied:=false;
 begin perform 1 from public.comment_deliveries;exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'anonymous receipts exposed';end if;
end $qa$;
reset role;
rollback;
select 'production role/deduplication/deleted-receipt assertions passed and rolled back'::text result,(select count(*) from public.comment_deliveries) receipt_count,(select count(*) from public.comments) comment_count,(select md5(coalesce(string_agg(to_jsonb(c)::text,'|' order by c.id),'')) from public.comments c) comment_fingerprint;
