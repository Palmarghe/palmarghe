create function public.audit_change() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_logs(actor_id,action,entity,entity_id)
  values (auth.uid(),TG_OP,TG_TABLE_NAME,coalesce(new.id,old.id)::text);
  return coalesce(new,old);
end $$;
create trigger audit_content after insert or update or delete on public.content_items for each row execute function public.audit_change();
create trigger audit_categories after insert or update or delete on public.categories for each row execute function public.audit_change();
create trigger audit_tags after insert or update or delete on public.tags for each row execute function public.audit_change();
create trigger audit_media after insert or update or delete on public.media for each row execute function public.audit_change();
create trigger audit_navigation after insert or update or delete on public.navigation for each row execute function public.audit_change();
create trigger audit_redirects after insert or update or delete on public.redirects for each row execute function public.audit_change();
