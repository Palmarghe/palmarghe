-- Public newsletter enrollment is intentionally exposed through a narrow RPC.
-- The table itself remains inaccessible to anon clients, including its email data.
create or replace function public.subscribe_newsletter(
  p_email text,
  p_locale text,
  p_source text default 'site'
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
begin
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(normalized_email) > 254 then
    raise exception 'invalid newsletter email';
  end if;
  if p_locale not in ('tr', 'en') or p_source <> 'site' then
    raise exception 'invalid newsletter request';
  end if;

  insert into public.newsletter_subscribers (email, locale, source, status, consented_at)
  values (normalized_email, p_locale, p_source, 'active', now())
  on conflict (lower(email)) do update
    set locale = excluded.locale,
        source = excluded.source,
        status = 'active',
        consented_at = now();
end;
$$;

revoke all on function public.subscribe_newsletter(text, text, text) from public;
grant execute on function public.subscribe_newsletter(text, text, text) to anon, authenticated;
