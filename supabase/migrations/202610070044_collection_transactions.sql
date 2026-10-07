-- Restore collection API access and enforce the same explicit content capability as Studio.
-- Anonymous reads never execute private permission helpers or reveal draft item relations.
drop policy collections_public_read on public.editorial_collections;
create policy collections_public_read on public.editorial_collections for select to anon using(published);
create policy collections_authenticated_read on public.editorial_collections for select to authenticated
 using(published or ((select public.current_role()) in ('editor','admin') and (select public.has_permission('content'))));
alter policy collections_editor_write on public.editorial_collections
 using(((select public.current_role()) in ('editor','admin') and (select public.has_permission('content')))) with check(((select public.current_role()) in ('editor','admin') and (select public.has_permission('content'))));
drop policy collection_items_public_read on public.editorial_collection_items;
create policy collection_items_public_read on public.editorial_collection_items for select to anon
 using(exists(select 1 from public.editorial_collections c where c.id=collection_id and c.published)
 and exists(select 1 from public.content_items c where c.id=content_id and c.status in ('published','scheduled') and c.published_at<=now()));
create policy collection_items_authenticated_read on public.editorial_collection_items for select to authenticated
 using(((select public.current_role()) in ('editor','admin') and (select public.has_permission('content'))) or
 (exists(select 1 from public.editorial_collections c where c.id=collection_id and c.published)
 and exists(select 1 from public.content_items c where c.id=content_id and c.status in ('published','scheduled') and c.published_at<=now())));
alter policy collection_items_editor_write on public.editorial_collection_items
 using(((select public.current_role()) in ('editor','admin') and (select public.has_permission('content')))) with check(((select public.current_role()) in ('editor','admin') and (select public.has_permission('content'))));
grant select on public.editorial_collections,public.editorial_collection_items to anon;
grant select,insert,update,delete on public.editorial_collections,public.editorial_collection_items to authenticated;

create function public.save_editorial_collection(p_collection_id uuid,p_value jsonb,p_content_ids uuid[])
returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved public.editorial_collections%rowtype; ids uuid[]:=coalesce(p_content_ids,array[]::uuid[]); matching bigint;
begin
 if auth.uid() is null or not ((select public.current_role()) in ('editor','admin') and (select public.has_permission('content'))) then raise exception 'content permission required' using errcode='42501';end if;
 if jsonb_typeof(p_value) is distinct from 'object' or jsonb_typeof(p_value->'published') is distinct from 'boolean'
 or coalesce(char_length(btrim(p_value->>'title')),0) not between 2 and 120
 or coalesce(p_value->>'slug','')!~'^[a-z0-9]+(-[a-z0-9]+)*$'
 or coalesce(p_value->>'locale','') not in ('tr','en')
 or char_length(coalesce(p_value->>'description',''))>500
 or coalesce((p_value->>'sort_order')::integer,-1) not between 0 and 1000
 or cardinality(ids)>50 then raise exception 'invalid collection' using errcode='22023';end if;
 select count(*) into matching from public.content_items where id=any(ids) and status='published' and published_at<=now();
 if matching<>cardinality(ids) then raise exception 'invalid collection items' using errcode='22023';end if;
 if p_collection_id is null then
  insert into public.editorial_collections(locale,slug,title,description,published,sort_order,created_by)
  values(p_value->>'locale',p_value->>'slug',btrim(p_value->>'title'),btrim(coalesce(p_value->>'description','')),(p_value->>'published')::boolean,(p_value->>'sort_order')::integer,auth.uid()) returning * into saved;
 else
  update public.editorial_collections set locale=p_value->>'locale',slug=p_value->>'slug',title=btrim(p_value->>'title'),description=btrim(coalesce(p_value->>'description','')),published=(p_value->>'published')::boolean,sort_order=(p_value->>'sort_order')::integer,updated_at=clock_timestamp()
  where id=p_collection_id returning * into saved;
  if not found then raise exception 'collection unavailable' using errcode='22023';end if;
 end if;
 delete from public.editorial_collection_items where collection_id=saved.id;
 insert into public.editorial_collection_items(collection_id,content_id,sort_order)
 select saved.id,content_id,position-1 from unnest(ids) with ordinality as choices(content_id,position);
 return to_jsonb(saved);
end $$;
revoke all on function public.save_editorial_collection(uuid,jsonb,uuid[]) from public,anon;
grant execute on function public.save_editorial_collection(uuid,jsonb,uuid[]) to authenticated;
