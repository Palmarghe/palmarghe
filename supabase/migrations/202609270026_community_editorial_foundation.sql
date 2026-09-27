-- Community, editorial collections and subscriber foundation.
-- Additive migration: all records are owned by the authenticated member or published by Studio.
create table if not exists public.content_bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.content_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);
create index if not exists content_bookmarks_user_created_idx on public.content_bookmarks(user_id, created_at desc);

create table if not exists public.content_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_kind text not null check (target_kind in ('category','tag','author')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_kind, target_id)
);
create index if not exists content_follows_user_created_idx on public.content_follows(user_id, created_at desc);

create table if not exists public.editorial_collections (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('tr','en')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  description text not null default '' check (char_length(description) <= 500),
  cover_media_id uuid references public.media(id) on delete set null,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(locale, slug)
);
create table if not exists public.editorial_collection_items (
  collection_id uuid not null references public.editorial_collections(id) on delete cascade,
  content_id uuid not null references public.content_items(id) on delete cascade,
  sort_order integer not null default 0,
  primary key(collection_id, content_id)
);
create index if not exists editorial_collection_items_order_idx on public.editorial_collection_items(collection_id, sort_order);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'tr' check(locale in ('tr','en')),
  consented_at timestamptz not null default now(),
  status text not null default 'active' check(status in ('active','unsubscribed')),
  source text not null default 'site' check(char_length(source) <= 80)
);

create table if not exists public.content_notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check(kind in ('comment_reply','followed_content','system')),
  title text not null check(char_length(title) <= 180),
  href text not null check(href ~ '^/[a-z0-9/-]*$'),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists content_notifications_user_created_idx on public.content_notifications(user_id, created_at desc);

create unique index if not exists newsletter_subscribers_email_unique_idx on public.newsletter_subscribers(lower(email));

alter table public.content_bookmarks enable row level security;
alter table public.content_follows enable row level security;
alter table public.editorial_collections enable row level security;
alter table public.editorial_collection_items enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.content_notifications enable row level security;

create policy bookmarks_own on public.content_bookmarks for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy follows_own on public.content_follows for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy collections_public_read on public.editorial_collections for select using (published or (select public.current_role()) in ('editor','admin'));
create policy collections_editor_write on public.editorial_collections for all to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy collection_items_public_read on public.editorial_collection_items for select using (exists(select 1 from public.editorial_collections c where c.id=collection_id and (c.published or (select public.current_role()) in ('editor','admin'))));
create policy collection_items_editor_write on public.editorial_collection_items for all to authenticated using ((select public.current_role()) in ('editor','admin')) with check ((select public.current_role()) in ('editor','admin'));
create policy newsletter_subscribe on public.newsletter_subscribers for insert with check (status='active');
create policy newsletter_admin_read on public.newsletter_subscribers for select to authenticated using ((select public.current_role())='admin');
create policy newsletter_admin_write on public.newsletter_subscribers for update to authenticated using ((select public.current_role())='admin') with check ((select public.current_role())='admin');
create policy notifications_own on public.content_notifications for select to authenticated using (user_id=(select auth.uid()));
create policy notifications_own_update on public.content_notifications for update to authenticated using (user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

revoke all on table public.content_bookmarks, public.content_follows, public.editorial_collections, public.editorial_collection_items, public.newsletter_subscribers, public.content_notifications from anon;