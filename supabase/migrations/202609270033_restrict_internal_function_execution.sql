-- Trigger and scheduler internals are not API endpoints.  Keep their elevated
-- privileges callable only by the database owner or Worker service role.
revoke all on function public.audit_change() from public, anon, authenticated;
revoke all on function public.create_profile() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
revoke all on function public.notify_author_followers_on_publish() from public, anon, authenticated;
revoke all on function public.dispatch_due_author_follow_notifications() from public, anon, authenticated;
grant execute on function public.dispatch_due_author_follow_notifications() to service_role;
