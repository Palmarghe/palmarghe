create or replace function public.get_content_metrics(p_content_id uuid)
returns table(reads bigint, shares bigint) language sql stable security definer set search_path = '' as $$
  select m.reads, m.shares
  from public.content_metrics m join public.content_items c on c.id = m.content_id
  where m.content_id = p_content_id and c.status = 'published' and c.published_at <= now()
$$;

revoke all on function public.get_content_metrics(uuid) from public;
grant execute on function public.get_content_metrics(uuid) to anon,authenticated;
