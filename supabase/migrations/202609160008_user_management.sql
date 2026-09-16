create or replace function public.prevent_role_change() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role <> old.role and current_user <> 'postgres' then
    raise exception 'role changes require privileged operation';
  end if;
  return new;
end $$;

create function public.set_member_role(p_user_id uuid, p_role public.app_role)
returns void language plpgsql security definer set search_path = '' as $$
declare v_old public.app_role;
begin
  perform pg_advisory_xact_lock(81016008);
  if (select public.current_role()) <> 'admin' or p_user_id = auth.uid() then
    raise exception 'permission denied';
  end if;
  select role into v_old from public.profiles where id = p_user_id for update;
  if v_old is null then raise exception 'unknown user'; end if;
  if v_old = 'admin' and p_role <> 'admin' and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'last admin cannot be removed';
  end if;
  update public.profiles set role=p_role,updated_at=now() where id=p_user_id;
  insert into public.audit_logs(actor_id,action,entity,entity_id) values (auth.uid(),'ROLE_CHANGE','profiles',p_user_id::text);
end $$;
revoke all on function public.set_member_role(uuid,public.app_role) from public,anon;
grant execute on function public.set_member_role(uuid,public.app_role) to authenticated;
