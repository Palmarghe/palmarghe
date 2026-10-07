-- Repair missing API grants without widening existing own-record RLS.
-- Browsers may change only notification read_at, never its recipient/title/link.
do $$
begin
 if (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relname in ('content_follows','content_notifications') and c.relrowsecurity)<>2
 or (select count(*) from pg_policies where schemaname='public'
     and (tablename='content_follows' and policyname='follows_own' and cmd='ALL'
       or tablename='content_notifications' and policyname='notifications_own' and cmd='SELECT'
       or tablename='content_notifications' and policyname='notifications_own_update' and cmd='UPDATE'))<>3
 then raise exception 'Expected library RLS is missing; grants not applied';end if;
end $$;
grant select,insert,delete on public.content_follows to authenticated;
grant select on public.content_notifications to authenticated;
grant update(read_at) on public.content_notifications to authenticated;
