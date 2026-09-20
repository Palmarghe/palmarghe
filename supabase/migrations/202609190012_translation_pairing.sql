-- Staff-only translation pairing. Both rows change in one transaction.
create or replace function public.set_content_translation_pair(
  p_source_id uuid,
  p_target_id uuid
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_source public.content_items;
  v_target public.content_items;
  v_group uuid;
begin
  if auth.uid() is null or (select public.current_role()) not in ('editor','admin') then
    raise exception 'staff access required' using errcode = '42501';
  end if;
  if p_source_id = p_target_id then
    raise exception 'translations must be different items' using errcode = '22023';
  end if;
  perform id from public.content_items where id in (p_source_id,p_target_id) order by id for update;
  select * into v_source from public.content_items where id = p_source_id;
  select * into v_target from public.content_items where id = p_target_id;
  if v_source.id is null or v_target.id is null then
    raise exception 'content not found' using errcode = 'P0002';
  end if;
  if v_source.locale = v_target.locale then
    raise exception 'translations must have different locales' using errcode = '22023';
  end if;
  if v_source.translation_group is not null and v_target.translation_group is not null
      and v_source.translation_group <> v_target.translation_group then
    raise exception 'existing translation pair must be unlinked first' using errcode = '23505';
  end if;
  v_group := coalesce(v_source.translation_group, v_target.translation_group, gen_random_uuid());
  if exists (select 1 from public.content_items where translation_group = v_group and id not in (p_source_id,p_target_id)) then
    raise exception 'translation group is already in use' using errcode = '23505';
  end if;
  update public.content_items set translation_group = v_group, updated_at = now()
  where id in (p_source_id,p_target_id);
  return v_group;
end $$;

create or replace function public.unlink_content_translation(
  p_content_id uuid
) returns void language plpgsql security invoker set search_path = '' as $$
declare
  v_group uuid;
begin
  if auth.uid() is null or (select public.current_role()) not in ('editor','admin') then
    raise exception 'staff access required' using errcode = '42501';
  end if;
  select translation_group into v_group from public.content_items where id = p_content_id for update;
  if not found then raise exception 'content not found' using errcode = 'P0002'; end if;
  if v_group is not null then
    update public.content_items set translation_group = null, updated_at = now()
    where translation_group = v_group;
  end if;
end $$;

revoke all on function public.set_content_translation_pair(uuid,uuid) from public, anon;
revoke all on function public.unlink_content_translation(uuid) from public, anon;
grant execute on function public.set_content_translation_pair(uuid,uuid) to authenticated;
grant execute on function public.unlink_content_translation(uuid) to authenticated;
