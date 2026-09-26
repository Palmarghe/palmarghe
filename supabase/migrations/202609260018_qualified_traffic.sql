-- Filtered traffic starts after this migration. It stores neither IP, raw referrer,
-- nor user agent; only an anonymous daily hash and a coarse acquisition source.
create table public.traffic_qualified_visitors (
  day date not null,
  path text not null check (path ~ '^/[a-z0-9/-]*$'),
  source text not null check (source in ('organic_search', 'referral', 'direct')),
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  primary key (day, path, source, visitor_hash)
);

create table public.traffic_qualified_daily (
  day date not null,
  path text not null check (path ~ '^/[a-z0-9/-]*$'),
  source text not null check (source in ('organic_search', 'referral', 'direct')),
  pageviews bigint not null default 0 check (pageviews >= 0),
  visitors bigint not null default 0 check (visitors >= 0),
  primary key (day, path, source)
);

alter table public.traffic_qualified_visitors enable row level security;
alter table public.traffic_qualified_daily enable row level security;
grant select on public.traffic_qualified_daily to authenticated;

create policy traffic_qualified_daily_admin_read on public.traffic_qualified_daily for select to authenticated
  using ((select public.current_role()) = 'admin');

create or replace function public.record_qualified_traffic_visit(p_path text, p_visitor_id uuid, p_source text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_day date := current_date;
  v_hash text;
  v_inserted integer := 0;
begin
  if p_path is null or p_path !~ '^/[a-z0-9/-]*$' then
    raise exception 'invalid path' using errcode = '22023';
  end if;
  if p_source not in ('organic_search', 'referral', 'direct') then
    raise exception 'invalid source' using errcode = '22023';
  end if;
  v_hash := encode(extensions.digest(p_visitor_id::text || ':' || v_day::text, 'sha256'), 'hex');
  insert into public.traffic_qualified_visitors(day,path,source,visitor_hash) values(v_day,p_path,p_source,v_hash)
  on conflict do nothing;
  get diagnostics v_inserted = row_count;
  insert into public.traffic_qualified_daily(day,path,source,pageviews,visitors) values(v_day,p_path,p_source,1,case when v_inserted = 1 then 1 else 0 end)
  on conflict(day,path,source) do update set pageviews=traffic_qualified_daily.pageviews+1,visitors=traffic_qualified_daily.visitors+(case when v_inserted = 1 then 1 else 0 end);
end $$;

revoke all on function public.record_qualified_traffic_visit(text,uuid,text) from public;
grant execute on function public.record_qualified_traffic_visit(text,uuid,text) to anon,authenticated;
