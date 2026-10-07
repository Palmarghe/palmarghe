begin;
set local statement_timeout='30s';
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='admin' order by id limit 1),true);
set local role authenticated;
do $$declare saved jsonb; before_row jsonb; item uuid; rejected boolean:=false;
begin
 select id into item from public.content_items where status='published' and published_at<=now() order by id limit 1;
 if item is null then raise exception 'Missing public QA item';end if;
 saved:=public.save_editorial_collection(null,'{"title":"Rollback collection QA","slug":"rollback-collection-qa-20261007","locale":"tr","description":"","published":false,"sort_order":0}'::jsonb,array[item]);
 select to_jsonb(c) into before_row from public.editorial_collections c where id=(saved->>'id')::uuid;
 begin perform public.save_editorial_collection((saved->>'id')::uuid,jsonb_set(saved,'{title}','"Must not persist"'),array[item,item]);exception when sqlstate '22023' then rejected:=true;end;
 if not rejected or (select to_jsonb(c) from public.editorial_collections c where id=(saved->>'id')::uuid) is distinct from before_row then raise exception 'Atomic rejection failed';end if;
 if (select count(*) from public.editorial_collection_items where collection_id=(saved->>'id')::uuid)<>1 then raise exception 'Prior relations lost';end if;
 perform set_config('qa.collection',saved->>'id',true);
end $$;
reset role;
set local role anon;
do $$begin if exists(select 1 from public.editorial_collections where id=current_setting('qa.collection')::uuid) or exists(select 1 from public.editorial_collection_items where collection_id=current_setting('qa.collection')::uuid) then raise exception 'Private collection leaked';end if;end $$;
reset role;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where role='member' order by id limit 1),true);
set local role authenticated;
do $$declare denied boolean:=false;begin
 begin perform public.save_editorial_collection(null,'{"title":"Denied QA","slug":"denied-qa","locale":"tr","description":"","published":false,"sort_order":0}'::jsonb,array[]::uuid[]);exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Member mutation was not denied';end if;
end $$;
reset role;
rollback;
