-- Scheduled entries become public by their publish time without a row update.
-- Dispatch their author-follow notifications lazily and exactly once on the next site request.
create unique index if not exists content_notifications_author_publication_once_idx
  on public.content_notifications (user_id, kind, href)
  where kind='followed_content';

create or replace function public.dispatch_due_author_follow_notifications()
returns integer language plpgsql security definer set search_path='' as $$
declare notification_count integer := 0;
begin
  with inserted as (
    insert into public.content_notifications(user_id,kind,title,href)
    select f.user_id,'followed_content',c.title,'/' || c.slug || '/'
    from public.content_items c
    join public.content_follows f on f.target_kind='author' and f.target_id=c.author_id and f.user_id<>c.author_id
    where c.status='scheduled' and c.published_at<=now()
    on conflict do nothing
    returning 1
  ) select count(*) into notification_count from inserted;
  return notification_count;
end $$;

revoke all on function public.dispatch_due_author_follow_notifications() from public;
grant execute on function public.dispatch_due_author_follow_notifications() to anon, authenticated, service_role;
