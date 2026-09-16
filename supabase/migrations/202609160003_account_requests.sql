create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','completed','rejected')),
  created_at timestamptz not null default now(),
  unique(user_id,status)
);
alter table public.account_deletion_requests enable row level security;
create policy deletion_self_read on public.account_deletion_requests for select to authenticated using (user_id=(select auth.uid()) or (select public.current_role())='admin');
create policy deletion_self_request on public.account_deletion_requests for insert to authenticated with check (user_id=(select auth.uid()) and status='pending');
create policy deletion_admin_update on public.account_deletion_requests for update to authenticated using ((select public.current_role())='admin') with check ((select public.current_role())='admin');
