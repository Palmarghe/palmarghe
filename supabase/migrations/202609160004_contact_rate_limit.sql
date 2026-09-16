create table public.contact_rate_limits (
  ip_hash text primary key,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.contact_rate_limits enable row level security;

create function public.submit_contact(p_name text, p_email text, p_message text, p_ip_hash text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_attempts integer;
begin
  if length(p_name) not between 1 and 100 or length(p_email) not between 3 and 254 or length(p_message) not between 10 and 5000 or length(p_ip_hash) <> 64 then
    raise exception 'invalid contact input';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));
  insert into public.contact_rate_limits(ip_hash,window_start,attempts) values (p_ip_hash,now(),1)
  on conflict (ip_hash) do update set
    window_start = case when public.contact_rate_limits.window_start < now()-interval '15 minutes' then now() else public.contact_rate_limits.window_start end,
    attempts = case when public.contact_rate_limits.window_start < now()-interval '15 minutes' then 1 else public.contact_rate_limits.attempts+1 end
  returning attempts into v_attempts;
  if v_attempts > 5 then raise exception 'rate limit exceeded'; end if;
  insert into public.contact_messages(name,email,message) values (p_name,p_email,p_message) returning id into v_id;
  return v_id;
end $$;
revoke all on function public.submit_contact(text,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_contact(text,text,text,text) to service_role;
