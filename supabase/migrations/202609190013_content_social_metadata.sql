-- Persist per-item canonical and social image selections through the staff RPC.
-- SECURITY INVOKER keeps the existing authenticated role and RLS boundaries.
create or replace function public.save_content_with_relations(
  p_content_id uuid,
  p_payload jsonb,
  p_category_id uuid,
  p_tag_ids uuid[]
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_input public.content_items;
  v_id uuid;
  v_tag_count integer;
begin
  if auth.uid() is null or (select public.current_role()) not in ('editor','admin') then
    raise exception 'staff access required' using errcode = '42501';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'invalid content payload' using errcode = '22023';
  end if;
  if coalesce(array_length(p_tag_ids,1),0) > 20 then
    raise exception 'too many tags' using errcode = '22023';
  end if;
  if p_category_id is not null and not exists (select 1 from public.categories where id = p_category_id) then
    raise exception 'unknown category' using errcode = '23503';
  end if;
  select count(distinct id) into v_tag_count from public.tags where id = any(coalesce(p_tag_ids,'{}'::uuid[]));
  if v_tag_count <> coalesce(array_length(p_tag_ids,1),0) then
    raise exception 'unknown or duplicate tag' using errcode = '23503';
  end if;
  v_input := jsonb_populate_record(null::public.content_items, p_payload);
  if p_content_id is null then
    insert into public.content_items
      (locale,translation_group,type,status,title,slug,excerpt,body,type_data,cover_media_id,cover_url,
       author_id,featured,published_at,seo_title,seo_description,canonical_override,og_media_id,indexable,updated_at)
    values
      (v_input.locale,v_input.translation_group,v_input.type,v_input.status,v_input.title,v_input.slug,
       v_input.excerpt,v_input.body,v_input.type_data,v_input.cover_media_id,v_input.cover_url,
       auth.uid(),v_input.featured,v_input.published_at,v_input.seo_title,v_input.seo_description,
       v_input.canonical_override,v_input.og_media_id,v_input.indexable,now()) returning id into v_id;
  else
    update public.content_items set
      locale=v_input.locale,translation_group=v_input.translation_group,type=v_input.type,status=v_input.status,
      title=v_input.title,slug=v_input.slug,excerpt=v_input.excerpt,body=v_input.body,type_data=v_input.type_data,
      cover_media_id=v_input.cover_media_id,cover_url=v_input.cover_url,featured=v_input.featured,
      published_at=v_input.published_at,seo_title=v_input.seo_title,seo_description=v_input.seo_description,
      canonical_override=v_input.canonical_override,og_media_id=v_input.og_media_id,
      indexable=v_input.indexable,updated_at=now()
    where id=p_content_id returning id into v_id;
    if v_id is null then raise exception 'content not found' using errcode = 'P0002'; end if;
  end if;
  delete from public.content_categories where content_id=v_id;
  delete from public.content_tags where content_id=v_id;
  if p_category_id is not null then
    insert into public.content_categories(content_id,category_id) values (v_id,p_category_id);
  end if;
  insert into public.content_tags(content_id,tag_id)
    select v_id, unnest(coalesce(p_tag_ids,'{}'::uuid[]));
  return v_id;
end $$;

revoke all on function public.save_content_with_relations(uuid,jsonb,uuid,uuid[]) from public, anon;
grant execute on function public.save_content_with_relations(uuid,jsonb,uuid,uuid[]) to authenticated;
