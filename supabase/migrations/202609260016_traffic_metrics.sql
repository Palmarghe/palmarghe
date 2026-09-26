-- Read grants are required in addition to RLS policies for PostgREST queries.
grant select on public.traffic_daily to authenticated;

create table public.content_metrics (
  content_id uuid primary key references public.content_items(id) on delete cascade,
  reads bigint not null default 0 check (reads >= 0),
  shares bigint not null default 0 check (shares >= 0),
  updated_at timestamptz not null default now()
);

alter table public.content_metrics enable row level security;
create policy content_metrics_staff_read on public.content_metrics for select to authenticated
  using ((select public.current_role()) in ('editor','admin'));
grant select on public.content_metrics to authenticated;

create or replace function public.record_content_engagement(p_content_id uuid, p_event text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_event not in ('read','share') then raise exception 'invalid engagement event' using errcode = '22023'; end if;
  if not exists (select 1 from public.content_items where id = p_content_id and status = 'published' and published_at <= now()) then
    raise exception 'content unavailable' using errcode = '22023';
  end if;
  insert into public.content_metrics(content_id,reads,shares,updated_at)
  values (p_content_id,case when p_event='read' then 1 else 0 end,case when p_event='share' then 1 else 0 end,now())
  on conflict(content_id) do update set
    reads = content_metrics.reads + case when p_event='read' then 1 else 0 end,
    shares = content_metrics.shares + case when p_event='share' then 1 else 0 end,
    updated_at = now();
end $$;

revoke all on function public.record_content_engagement(uuid,text) from public;
grant execute on function public.record_content_engagement(uuid,text) to anon,authenticated;
