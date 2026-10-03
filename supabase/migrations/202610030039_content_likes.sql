create table if not exists public.content_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.content_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,content_id)
);
create index if not exists content_likes_content_idx on public.content_likes(content_id);
alter table public.content_likes enable row level security;
create policy likes_own_read on public.content_likes for select to authenticated using(user_id=(select auth.uid()));
create policy likes_own_delete on public.content_likes for delete to authenticated using(user_id=(select auth.uid()));
create policy likes_own_insert on public.content_likes for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.content_items c where c.id=content_id and c.status in ('published','scheduled') and c.published_at<=now()));
revoke all on public.content_likes from anon, authenticated;
grant select, insert, delete on public.content_likes to authenticated;
create or replace function public.content_like_count(p_content_id uuid) returns bigint
language sql stable security definer set search_path='' as $$
 select count(*) from public.content_likes l where l.content_id=p_content_id
 and exists(select 1 from public.content_items c where c.id=p_content_id and c.status in ('published','scheduled') and c.published_at<=now());
$$;
revoke all on function public.content_like_count(uuid) from public;
grant execute on function public.content_like_count(uuid) to anon, authenticated;
