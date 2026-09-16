create extension if not exists pgcrypto;

create type public.app_role as enum ('member','editor','admin');
create type public.content_status as enum ('draft','scheduled','published','archived');
create type public.content_type as enum ('article','project','fm_mod','gallery','lab_entry');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create function public.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();
create function public.current_role() returns public.app_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(), parent_id uuid references public.categories(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_tr text not null, name_en text not null,
  description_tr text, description_en text,
  active boolean not null default true, sort_order integer not null default 0,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tags (
  id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_tr text not null, name_en text not null, created_at timestamptz not null default now()
);
create table public.media (
  id uuid primary key default gen_random_uuid(), path text not null unique,
  mime text not null, bytes bigint not null check (bytes > 0 and bytes <= 10485760),
  width integer, height integer, alt_tr text, alt_en text, caption_tr text, caption_en text,
  uploaded_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('tr','en')),
  translation_group uuid,
  type public.content_type not null,
  status public.content_status not null default 'draft',
  title text not null check (char_length(title) between 1 and 200),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*$'),
  excerpt text, body jsonb not null default '[]'::jsonb,
  type_data jsonb not null default '{}'::jsonb,
  cover_media_id uuid references public.media(id) on delete set null,
  cover_url text,
  author_id uuid references public.profiles(id) on delete set null,
  featured boolean not null default false,
  published_at timestamptz, seo_title text, seo_description text,
  canonical_override text, og_media_id uuid references public.media(id) on delete set null,
  indexable boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(locale,slug), unique(translation_group,locale),
  constraint publish_date_required check (status <> 'published' or published_at is not null)
);
create index content_public_idx on public.content_items(locale,published_at desc) where status = 'published';
create table public.content_categories (content_id uuid references public.content_items(id) on delete cascade, category_id uuid references public.categories(id) on delete restrict, primary key(content_id,category_id));
create table public.content_tags (content_id uuid references public.content_items(id) on delete cascade, tag_id uuid references public.tags(id) on delete restrict, primary key(content_id,tag_id));
create table public.site_settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now());
create table public.navigation (id uuid primary key default gen_random_uuid(), locale text not null check(locale in ('tr','en')), label text not null, href text not null, sort_order integer not null default 0, active boolean not null default true);
create table public.redirects (id uuid primary key default gen_random_uuid(), source_path text not null unique, target_path text not null, status_code integer not null default 301 check(status_code in (301,302)), check(source_path <> target_path));
create table public.contact_messages (id uuid primary key default gen_random_uuid(), name text not null, email text not null, message text not null, status text not null default 'unread' check(status in ('unread','read','archived','spam')), created_at timestamptz not null default now());
create table public.audit_logs (id bigint generated always as identity primary key, actor_id uuid references public.profiles(id), action text not null, entity text not null, entity_id text, created_at timestamptz not null default now());

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.media enable row level security;
alter table public.content_items enable row level security;
alter table public.content_categories enable row level security;
alter table public.content_tags enable row level security;
alter table public.site_settings enable row level security;
alter table public.navigation enable row level security;
alter table public.redirects enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_logs enable row level security;

create policy profile_self_read on public.profiles for select to authenticated using (id = (select auth.uid()) or (select public.current_role()) = 'admin');
create policy profile_self_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create function public.prevent_role_change() returns trigger language plpgsql as $$ begin if new.role <> old.role then raise exception 'role changes require privileged migration'; end if; return new; end $$;
create trigger prevent_profile_role_change before update on public.profiles for each row execute function public.prevent_role_change();

create policy categories_public_read on public.categories for select using (active or (select public.current_role()) in ('editor','admin'));
create policy categories_editor_write on public.categories for all to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy tags_public_read on public.tags for select using (true);
create policy tags_editor_write on public.tags for all to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy media_public_read on public.media for select using (exists(select 1 from public.content_items c where c.cover_media_id = media.id and c.status='published' and c.published_at <= now()));
create policy media_editor_all on public.media for all to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy content_public_read on public.content_items for select using ((status='published' and published_at <= now()) or (select public.current_role()) in ('editor','admin'));
create policy content_editor_write on public.content_items for all to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy content_categories_public on public.content_categories for select using (exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()) or (select public.current_role()) in ('editor','admin'));
create policy content_categories_editor on public.content_categories for all to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy content_tags_public on public.content_tags for select using (exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()) or (select public.current_role()) in ('editor','admin'));
create policy content_tags_editor on public.content_tags for all to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy settings_public_read on public.site_settings for select using (key in ('appearance','homepage','social','public'));
create policy settings_admin_write on public.site_settings for all to authenticated using ((select public.current_role())='admin') with check ((select public.current_role())='admin');
create policy nav_public_read on public.navigation for select using (active or (select public.current_role()) in ('editor','admin'));
create policy nav_admin_write on public.navigation for all to authenticated using ((select public.current_role())='admin') with check ((select public.current_role())='admin');
create policy redirects_public_read on public.redirects for select using (true);
create policy redirects_admin_write on public.redirects for all to authenticated using ((select public.current_role())='admin') with check ((select public.current_role())='admin');
create policy messages_staff_read on public.contact_messages for select to authenticated using ((select public.current_role()) in ('editor','admin'));
create policy messages_staff_update on public.contact_messages for update to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy audit_admin_read on public.audit_logs for select to authenticated using ((select public.current_role())='admin');

insert into public.categories(slug,name_tr,name_en,sort_order) values ('ai','Yapay zekâ','AI',0),('gaming','Oyunlar','Gaming',1),('fm','Football Manager','Football Manager',2),('lab','Lab','Lab',3);
insert into public.categories(slug,parent_id,name_tr,name_en,sort_order) select 'fm26',id,'FM26','FM26',0 from public.categories where slug='fm';
