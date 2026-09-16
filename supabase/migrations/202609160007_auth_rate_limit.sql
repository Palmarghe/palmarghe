create table public.auth_rate_limits (
  key_hash text primary key,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.auth_rate_limits enable row level security;

create function public.allow_auth_attempt(p_key_hash text, p_max integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_attempts integer;
begin
  if length(p_key_hash) <> 64 or p_max not between 1 and 30 or p_window_seconds not between 60 and 3600 then
    raise exception 'invalid rate limit input';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_key_hash));
  insert into public.auth_rate_limits(key_hash,window_start,attempts) values (p_key_hash,now(),1)
  on conflict (key_hash) do update set
    window_start = case when public.auth_rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then now() else public.auth_rate_limits.window_start end,
    attempts = case when public.auth_rate_limits.window_start < now() - make_interval(secs => p_window_seconds) then 1 else public.auth_rate_limits.attempts + 1 end
  returning attempts into v_attempts;
  return v_attempts <= p_max;
end $$;
revoke all on function public.allow_auth_attempt(text,integer,integer) from public,anon,authenticated;
grant execute on function public.allow_auth_attempt(text,integer,integer) to service_role;
