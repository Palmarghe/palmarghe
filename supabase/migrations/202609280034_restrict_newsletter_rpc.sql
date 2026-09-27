-- Newsletter writes originate from the first-party Worker after consent and
-- rate-limit checks. The RPC is no longer callable directly by browsers.
revoke all on function public.subscribe_newsletter(text, text, text) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text, text) to service_role;
