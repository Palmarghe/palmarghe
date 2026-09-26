-- An editor without a capability must not discover unpublished work or inactive taxonomy through direct PostgREST calls.
drop policy if exists categories_public_read on public.categories;
create policy categories_scoped_read on public.categories for select using (active or (select public.has_permission('taxonomy')) or (select public.has_permission('content')));
drop policy if exists content_public_read on public.content_items;
create policy content_scoped_read on public.content_items for select using ((status='published' and published_at<=now()) or (select public.has_permission('content')));
drop policy if exists content_categories_public on public.content_categories;
create policy content_categories_scoped_read on public.content_categories for select using (exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()) or (select public.has_permission('content')));
drop policy if exists content_tags_public on public.content_tags;
create policy content_tags_scoped_read on public.content_tags for select using (exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()) or (select public.has_permission('content')));

create or replace function public.set_content_translation_pair(p_source_id uuid,p_target_id uuid) returns uuid language plpgsql security invoker set search_path='' as $$
declare v_source public.content_items; v_target public.content_items; v_group uuid;
begin
  if auth.uid() is null or not (select public.has_permission('content')) then raise exception 'content permission required' using errcode='42501'; end if;
  if p_source_id=p_target_id then raise exception 'translations must be different items' using errcode='22023'; end if;
  perform id from public.content_items where id in(p_source_id,p_target_id) order by id for update;
  select * into v_source from public.content_items where id=p_source_id; select * into v_target from public.content_items where id=p_target_id;
  if v_source.id is null or v_target.id is null then raise exception 'content not found' using errcode='P0002'; end if;
  if v_source.locale=v_target.locale then raise exception 'translations must have different locales' using errcode='22023'; end if;
  if v_source.translation_group is not null and v_target.translation_group is not null and v_source.translation_group<>v_target.translation_group then raise exception 'existing translation pair must be unlinked first' using errcode='23505'; end if;
  v_group:=coalesce(v_source.translation_group,v_target.translation_group,gen_random_uuid());
  if exists(select 1 from public.content_items where translation_group=v_group and id not in(p_source_id,p_target_id)) then raise exception 'translation group is already in use' using errcode='23505'; end if;
  update public.content_items set translation_group=v_group,updated_at=now() where id in(p_source_id,p_target_id); return v_group;
end $$;
