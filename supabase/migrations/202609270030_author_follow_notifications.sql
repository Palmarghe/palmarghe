create or replace function public.notify_author_followers_on_publish()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.author_id is not null and new.status='published' and new.published_at<=now()
    and (tg_op='INSERT' or old.status is distinct from 'published') then
    insert into public.content_notifications(user_id,kind,payload)
    select f.user_id,'author_published',jsonb_build_object('title',new.title,'slug',new.slug,'content_id',new.id)
    from public.content_follows f
    where f.target_kind='author' and f.target_id=new.author_id and f.user_id<>new.author_id;
  end if;
  return new;
end $$;
drop trigger if exists content_author_publish_notification on public.content_items;
create trigger content_author_publish_notification after insert or update of status,published_at on public.content_items for each row execute function public.notify_author_followers_on_publish();