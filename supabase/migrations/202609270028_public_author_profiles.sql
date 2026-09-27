-- Reader-facing author profiles are opt-in. No account becomes public automatically.
alter table public.profiles
  add column if not exists author_slug text,
  add column if not exists public_profile boolean not null default false;
alter table public.profiles
  drop constraint if exists profiles_author_slug_format,
  add constraint profiles_author_slug_format check (author_slug is null or author_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
create unique index if not exists profiles_author_slug_unique on public.profiles(author_slug) where author_slug is not null;

create or replace function public.get_public_author(p_slug text)
returns table(id uuid, author_slug text, display_name text, bio text, avatar_key text)
language sql stable security definer set search_path='' as $$
  select p.id,p.author_slug,coalesce(nullif(p.display_name,''),'Palmarghe'),p.bio,p.avatar_key
  from public.profiles p
  where p.public_profile=true and p.author_slug=p_slug
  limit 1
$$;
create or replace function public.get_public_author_content(p_slug text,p_limit integer default 20)
returns table(id uuid,locale text,title text,slug text,excerpt text,type public.content_type,cover_url text,published_at timestamptz)
language sql stable security definer set search_path='' as $$
  select i.id,i.locale,i.title,i.slug,i.excerpt,i.type,i.cover_url,i.published_at
  from public.content_items i join public.profiles p on p.id=i.author_id
  where p.public_profile=true and p.author_slug=p_slug
    and i.status in ('published','scheduled') and i.published_at<=now()
  order by i.published_at desc
  limit greatest(1,least(coalesce(p_limit,20),50))
$$;
revoke all on function public.get_public_author(text) from public;
revoke all on function public.get_public_author_content(text,integer) from public;
grant execute on function public.get_public_author(text) to anon,authenticated;
grant execute on function public.get_public_author_content(text,integer) to anon,authenticated;