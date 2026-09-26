-- Permission groups must be enforced by the database as well as the Studio UI.
-- Administrators retain their fixed break-glass role; every other account needs
-- an explicit enabled capability in its assigned group.
create or replace function public.has_permission(p_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select public.current_role()) = 'admin'
    or exists (
      select 1 from public.profiles p
      join public.permission_groups g on g.id = p.permission_group_id
      where p.id = (select auth.uid())
        and coalesce((g.permissions ->> p_permission)::boolean, false)
    ), false
  )
$$;
revoke all on function public.has_permission(text) from public, anon;
grant execute on function public.has_permission(text) to authenticated;

-- Bring legacy staff profiles under an explicit protected group before enforcing.
update public.profiles p set permission_group_id = g.id
from public.permission_groups g
where p.permission_group_id is null and g.protected and g.base_role = p.role;

-- Custom groups may delegate member/editor work but can never mint an admin.
alter table public.permission_groups
  add constraint permission_groups_custom_role_check check (protected or base_role in ('member','editor'));

drop policy if exists categories_editor_write on public.categories;
create policy categories_permission_write on public.categories for all to authenticated
  using ((select public.has_permission('taxonomy'))) with check ((select public.has_permission('taxonomy')));
drop policy if exists tags_editor_write on public.tags;
create policy tags_permission_write on public.tags for all to authenticated
  using ((select public.has_permission('taxonomy'))) with check ((select public.has_permission('taxonomy')));
drop policy if exists media_editor_all on public.media;
create policy media_permission_all on public.media for all to authenticated
  using ((select public.has_permission('media'))) with check ((select public.has_permission('media')));
drop policy if exists content_editor_write on public.content_items;
create policy content_permission_write on public.content_items for all to authenticated
  using ((select public.has_permission('content'))) with check ((select public.has_permission('content')));
drop policy if exists content_categories_editor on public.content_categories;
create policy content_categories_permission_write on public.content_categories for all to authenticated
  using ((select public.has_permission('content'))) with check ((select public.has_permission('content')));
drop policy if exists content_tags_editor on public.content_tags;
create policy content_tags_permission_write on public.content_tags for all to authenticated
  using ((select public.has_permission('content'))) with check ((select public.has_permission('content')));
drop policy if exists messages_staff_read on public.contact_messages;
drop policy if exists messages_staff_update on public.contact_messages;
create policy messages_permission_read on public.contact_messages for select to authenticated using ((select public.has_permission('messages')));
create policy messages_permission_update on public.contact_messages for update to authenticated using ((select public.has_permission('messages'))) with check ((select public.has_permission('messages')));
drop policy if exists comments_staff_update on public.comments;
create policy comments_permission_update on public.comments for update to authenticated using ((select public.has_permission('messages'))) with check ((select public.has_permission('messages')));
drop policy if exists comments_owner_delete on public.comments;
create policy comments_owner_or_permission_delete on public.comments for delete to authenticated using (user_id=(select auth.uid()) or (select public.has_permission('messages')));
drop policy if exists comments_member_insert on public.comments;
create policy comments_permission_insert on public.comments for insert to authenticated
  with check (user_id=(select auth.uid()) and status='published' and (select public.has_permission('comment')) and exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()));

drop policy if exists settings_admin_write on public.site_settings;
create policy settings_permission_write on public.site_settings for all to authenticated
  using ((select public.has_permission('appearance'))) with check ((select public.has_permission('appearance')));
drop policy if exists nav_admin_write on public.navigation;
create policy navigation_permission_write on public.navigation for all to authenticated
  using ((select public.has_permission('navigation'))) with check ((select public.has_permission('navigation')));
drop policy if exists redirects_admin_write on public.redirects;
create policy redirects_permission_write on public.redirects for all to authenticated
  using ((select public.has_permission('navigation'))) with check ((select public.has_permission('navigation')));
drop policy if exists audit_admin_read on public.audit_logs;
create policy audit_permission_read on public.audit_logs for select to authenticated using ((select public.has_permission('audit')));
drop policy if exists traffic_daily_admin_read on public.traffic_daily;
create policy traffic_daily_permission_read on public.traffic_daily for select to authenticated using ((select public.has_permission('audit')));
drop policy if exists traffic_qualified_daily_admin_read on public.traffic_qualified_daily;
create policy traffic_qualified_daily_permission_read on public.traffic_qualified_daily for select to authenticated using ((select public.has_permission('audit')));

drop policy if exists media_storage_staff_insert on storage.objects;
drop policy if exists media_storage_staff_update on storage.objects;
drop policy if exists media_storage_staff_delete on storage.objects;
drop policy if exists media_storage_staff_select on storage.objects;
create policy media_storage_permission_insert on storage.objects for insert to authenticated with check (bucket_id='media' and (select public.has_permission('media')));
create policy media_storage_permission_update on storage.objects for update to authenticated using (bucket_id='media' and (select public.has_permission('media'))) with check (bucket_id='media' and (select public.has_permission('media')));
create policy media_storage_permission_delete on storage.objects for delete to authenticated using (bucket_id='media' and (select public.has_permission('media')));
create policy media_storage_permission_select on storage.objects for select to authenticated using (bucket_id='media' and (select public.has_permission('media')));

create or replace function public.save_content_with_relations(p_content_id uuid,p_payload jsonb,p_category_id uuid,p_tag_ids uuid[])
returns uuid language plpgsql security invoker set search_path = '' as $function$
declare v_input public.content_items; v_id uuid; v_tag_count integer;
begin
  if auth.uid() is null or not (select public.has_permission('content')) then raise exception 'content permission required' using errcode = '42501'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'invalid content payload' using errcode = '22023'; end if;
  if coalesce(array_length(p_tag_ids,1),0) > 20 then raise exception 'too many tags' using errcode = '22023'; end if;
  if p_category_id is not null and not exists (select 1 from public.categories where id=p_category_id) then raise exception 'unknown category' using errcode = '23503'; end if;
  select count(distinct id) into v_tag_count from public.tags where id=any(coalesce(p_tag_ids,'{}'::uuid[]));
  if v_tag_count <> coalesce(array_length(p_tag_ids,1),0) then raise exception 'unknown or duplicate tag' using errcode = '23503'; end if;
  v_input := jsonb_populate_record(null::public.content_items,p_payload);
  if p_content_id is null then
    insert into public.content_items(locale,translation_group,type,status,title,slug,excerpt,body,type_data,cover_media_id,cover_url,author_id,featured,published_at,seo_title,seo_description,canonical_override,og_media_id,indexable,updated_at)
    values(v_input.locale,v_input.translation_group,v_input.type,v_input.status,v_input.title,v_input.slug,v_input.excerpt,v_input.body,v_input.type_data,v_input.cover_media_id,v_input.cover_url,auth.uid(),v_input.featured,v_input.published_at,v_input.seo_title,v_input.seo_description,v_input.canonical_override,v_input.og_media_id,v_input.indexable,now()) returning id into v_id;
  else
    update public.content_items set locale=v_input.locale,translation_group=v_input.translation_group,type=v_input.type,status=v_input.status,title=v_input.title,slug=v_input.slug,excerpt=v_input.excerpt,body=v_input.body,type_data=v_input.type_data,cover_media_id=v_input.cover_media_id,cover_url=v_input.cover_url,featured=v_input.featured,published_at=v_input.published_at,seo_title=v_input.seo_title,seo_description=v_input.seo_description,canonical_override=v_input.canonical_override,og_media_id=v_input.og_media_id,indexable=v_input.indexable,updated_at=now() where id=p_content_id returning id into v_id;
    if v_id is null then raise exception 'content not found' using errcode='P0002'; end if;
  end if;
  delete from public.content_categories where content_id=v_id; delete from public.content_tags where content_id=v_id;
  if p_category_id is not null then insert into public.content_categories(content_id,category_id) values(v_id,p_category_id); end if;
  insert into public.content_tags(content_id,tag_id) select v_id,unnest(coalesce(p_tag_ids,'{}'::uuid[])); return v_id;
end $function$;

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

create or replace function public.unlink_content_translation(p_content_id uuid) returns void language plpgsql security invoker set search_path='' as $$
declare v_group uuid;
begin
  if auth.uid() is null or not (select public.has_permission('content')) then raise exception 'content permission required' using errcode='42501'; end if;
  select translation_group into v_group from public.content_items where id=p_content_id for update; if not found then raise exception 'content not found' using errcode='P0002'; end if;
  if v_group is not null then update public.content_items set translation_group=null,updated_at=now() where translation_group=v_group; end if;
end $$;
