-- Member profiles, configurable permission groups and authenticated comments.
create table public.permission_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 80),
  description text check (char_length(description) <= 300),
  base_role public.app_role not null default 'member',
  permissions jsonb not null default '{}'::jsonb,
  protected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.permission_groups(name,description,base_role,permissions,protected) values
  ('Üye','Yorum yapabilir ve kendi profilini düzenleyebilir.','member','{"comment":true}'::jsonb,true),
  ('Editör','İçerik, kategori, etiket ve medya yönetebilir.','editor','{"comment":true,"content":true,"taxonomy":true,"media":true,"messages":true}'::jsonb,true),
  ('Yönetici','Studio ve üyelik yönetiminin tamamına erişir.','admin','{"comment":true,"content":true,"taxonomy":true,"media":true,"messages":true,"appearance":true,"navigation":true,"members":true,"permissions":true,"audit":true}'::jsonb,true);

alter table public.profiles
  add column bio text check (char_length(bio) <= 500),
  add column avatar_media_id uuid references public.media(id) on delete set null,
  add column permission_group_id uuid references public.permission_groups(id) on delete set null;

create policy profile_admin_update on public.profiles for update to authenticated
  using ((select public.current_role())='admin') with check ((select public.current_role())='admin');

update public.profiles p set permission_group_id = g.id
from public.permission_groups g
where g.base_role = p.role and g.protected;

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 2000),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index comments_content_created_idx on public.comments(content_id,created_at);

alter table public.permission_groups enable row level security;
alter table public.comments enable row level security;

create policy permission_groups_staff_read on public.permission_groups for select to authenticated
  using ((select public.current_role()) in ('editor','admin'));
create policy permission_groups_admin_write on public.permission_groups for all to authenticated
  using ((select public.current_role())='admin') with check ((select public.current_role())='admin');

create policy comments_public_read on public.comments for select
  using (status='published' and exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()));
create policy comments_member_insert on public.comments for insert to authenticated
  with check (user_id=(select auth.uid()) and status='published' and exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()));
create policy comments_owner_delete on public.comments for delete to authenticated
  using (user_id=(select auth.uid()) or (select public.current_role()) in ('editor','admin'));
create policy comments_staff_update on public.comments for update to authenticated
  using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));

drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (
  exists(select 1 from public.content_items c where (c.cover_media_id=media.id or c.og_media_id=media.id) and c.status='published' and c.published_at<=now())
  or exists(select 1 from public.profiles p where p.avatar_media_id=media.id)
);

drop policy if exists media_storage_public_select on storage.objects;
create policy media_storage_public_select on storage.objects for select using (
  bucket_id='media' and exists(
    select 1 from public.media m where m.path=name and (
      exists(select 1 from public.content_items c where (c.cover_media_id=m.id or c.og_media_id=m.id) and c.status='published' and c.published_at<=now())
      or exists(select 1 from public.profiles p where p.avatar_media_id=m.id)
      or exists(select 1 from public.content_items c where c.type='gallery' and c.status in ('published','scheduled') and c.published_at<=now() and c.type_data->'gallery_media_ids' ? m.id::text)
    )
  )
);

create or replace function public.assign_permission_group(p_user_id uuid,p_group_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_role public.app_role; v_old public.app_role;
begin
  if auth.uid() is null or (select public.current_role()) <> 'admin' then raise exception 'permission denied' using errcode='42501'; end if;
  if p_user_id=auth.uid() then raise exception 'cannot change own group' using errcode='22023'; end if;
  select base_role into v_role from public.permission_groups where id=p_group_id;
  if v_role is null then raise exception 'unknown group' using errcode='23503'; end if;
  select role into v_old from public.profiles where id=p_user_id for update;
  if v_old='admin' and v_role<>'admin' and (select count(*) from public.profiles where role='admin')<=1 then raise exception 'last admin' using errcode='22023'; end if;
  update public.profiles set permission_group_id=p_group_id,role=v_role,updated_at=now() where id=p_user_id;
  insert into public.audit_logs(actor_id,action,entity,entity_id) values(auth.uid(),'PERMISSION_GROUP_CHANGE','profiles',p_user_id::text);
end $$;
revoke all on function public.assign_permission_group(uuid,uuid) from public,anon;
grant execute on function public.assign_permission_group(uuid,uuid) to authenticated;

create or replace function public.get_public_comments(p_content_id uuid)
returns table(id uuid,body text,created_at timestamptz,display_name text,avatar_media_id uuid)
language sql stable security definer set search_path='' as $$
  select c.id,c.body,c.created_at,coalesce(nullif(p.display_name,''),'Palmarghe üyesi'),p.avatar_media_id
  from public.comments c join public.profiles p on p.id=c.user_id
  join public.content_items i on i.id=c.content_id
  where c.content_id=p_content_id and c.status='published' and i.status='published' and i.published_at<=now()
  order by c.created_at asc limit 200
$$;
revoke all on function public.get_public_comments(uuid) from public;
grant execute on function public.get_public_comments(uuid) to anon,authenticated;

grant select,insert,update,delete on public.permission_groups,public.comments to authenticated;
grant select on public.comments to anon;
