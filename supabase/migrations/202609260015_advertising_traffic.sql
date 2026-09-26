-- Studio-managed Google AdSense placement configuration and privacy-preserving traffic totals.
-- No IP address, user agent, or account identity is stored for traffic reporting.
create table public.traffic_visitors (
  day date not null,
  path text not null check (path ~ '^/[a-z0-9/-]*$'),
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  primary key (day, path, visitor_hash)
);

create table public.traffic_daily (
  day date not null,
  path text not null check (path ~ '^/[a-z0-9/-]*$'),
  pageviews bigint not null default 0 check (pageviews >= 0),
  visitors bigint not null default 0 check (visitors >= 0),
  primary key (day, path)
);

alter table public.traffic_visitors enable row level security;
alter table public.traffic_daily enable row level security;

create policy traffic_daily_admin_read on public.traffic_daily for select to authenticated
  using ((select public.current_role()) = 'admin');

create or replace function public.record_traffic_visit(p_path text, p_visitor_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_day date := current_date;
  v_hash text;
  v_inserted integer := 0;
begin
  if p_path is null or p_path !~ '^/[a-z0-9/-]*$' then
    raise exception 'invalid path' using errcode = '22023';
  end if;
  -- Hash is salted by the day. The raw browser-generated UUID never reaches a table.
  v_hash := encode(extensions.digest(p_visitor_id::text || ':' || v_day::text, 'sha256'), 'hex');
  insert into public.traffic_visitors(day,path,visitor_hash) values(v_day,p_path,v_hash)
  on conflict do nothing;
  get diagnostics v_inserted = row_count;
  insert into public.traffic_daily(day,path,pageviews,visitors) values(v_day,p_path,1,case when v_inserted = 1 then 1 else 0 end)
  on conflict(day,path) do update set pageviews=traffic_daily.pageviews+1,visitors=traffic_daily.visitors+(case when v_inserted = 1 then 1 else 0 end);
end $$;

revoke all on function public.record_traffic_visit(text,uuid) from public;
grant execute on function public.record_traffic_visit(text,uuid) to anon,authenticated;

drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings for select
  using (key in ('appearance','homepage','social','public','advertising'));
