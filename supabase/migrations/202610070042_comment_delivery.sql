-- Durable delivery receipts: retries cannot duplicate or resurrect deleted comments.
begin;
set local lock_timeout='5s';
set local statement_timeout='30s';
create table public.comment_deliveries (
 user_id uuid not null references public.profiles(id) on delete cascade,
 request_id uuid not null,
 content_id uuid not null references public.content_items(id) on delete cascade,
 body_hash bytea not null check(octet_length(body_hash)=32),
 comment_id uuid references public.comments(id) on delete set null,
 created_at timestamptz not null default now(),
 primary key(user_id,request_id)
);
alter table public.comment_deliveries enable row level security;
revoke all on public.comment_deliveries from public,anon,authenticated;
create function public.deliver_comment(p_content_id uuid,p_request_id uuid,p_body text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_body text:=btrim(p_body); v_delivery public.comment_deliveries%rowtype; v_id uuid; v_new boolean;
begin
 if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_request_id is null or v_body is null or char_length(v_body) not between 2 and 2000 then raise exception 'invalid comment' using errcode='22023'; end if;
 if not exists(select 1 from public.content_items where id=p_content_id and status='published' and published_at<=now()) then raise exception 'content unavailable' using errcode='22023'; end if;
 insert into public.comment_deliveries(user_id,request_id,content_id,body_hash) values(v_user,p_request_id,p_content_id,sha256(convert_to(v_body,'UTF8'))) on conflict(user_id,request_id) do nothing;
 v_new:=found;
 select * into v_delivery from public.comment_deliveries where user_id=v_user and request_id=p_request_id for update;
 if not v_new then
  if v_delivery.content_id<>p_content_id or v_delivery.body_hash<>sha256(convert_to(v_body,'UTF8')) then raise exception 'delivery key reused with different input' using errcode='22023'; end if;
  return jsonb_build_object('id',v_delivery.comment_id,'created',false,'removed',v_delivery.comment_id is null);
 end if;
 insert into public.comments(content_id,user_id,body,status) values(p_content_id,v_user,v_body,'published') returning id into v_id;
 update public.comment_deliveries set comment_id=v_id where user_id=v_user and request_id=p_request_id;
 return jsonb_build_object('id',v_id,'created',true,'removed',false);
end $$;
revoke all on function public.deliver_comment(uuid,uuid,text) from public,anon;
grant execute on function public.deliver_comment(uuid,uuid,text) to authenticated;
commit;
