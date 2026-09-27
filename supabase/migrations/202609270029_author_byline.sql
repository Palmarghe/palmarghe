create or replace function public.get_public_author_by_id(p_id uuid)
returns table(author_slug text, display_name text, avatar_key text)
language sql stable security definer set search_path='' as $$
 select p.author_slug,coalesce(nullif(p.display_name,''),'Palmarghe'),p.avatar_key
 from public.profiles p
 where p.id=p_id and p.public_profile=true and p.author_slug is not null limit 1
$$;
revoke all on function public.get_public_author_by_id(uuid) from public;
grant execute on function public.get_public_author_by_id(uuid) to anon,authenticated;