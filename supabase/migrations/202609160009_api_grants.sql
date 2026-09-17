-- RLS policies do not grant table privileges. Keep grants narrow and let RLS
-- enforce row-level visibility and staff-only writes.
grant usage on schema public to anon, authenticated;

grant select on public.categories, public.tags, public.media,
  public.content_items, public.content_categories, public.content_tags,
  public.site_settings, public.navigation, public.redirects
to anon, authenticated;

grant insert, update, delete on public.categories, public.tags, public.media,
  public.content_items, public.content_categories, public.content_tags,
  public.site_settings, public.navigation, public.redirects
to authenticated;

grant select, update on public.profiles to authenticated;
grant select, update on public.contact_messages to authenticated;
grant select on public.audit_logs to authenticated;
grant select, insert, update on public.account_deletion_requests to authenticated;

-- No direct grants on contact_rate_limits or auth_rate_limits. Their
-- SECURITY DEFINER RPCs remain executable only by service_role.
