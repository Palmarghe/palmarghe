-- Deploy the service-role Worker measurement writer before applying this.
-- Keep every existing aggregate and visitor row intact.
begin;
revoke execute on function public.record_traffic_visit(text,uuid) from public,anon,authenticated;
revoke execute on function public.record_qualified_traffic_visit(text,uuid,text) from public,anon,authenticated;
revoke execute on function public.record_content_engagement(uuid,text) from public,anon,authenticated;
grant execute on function public.record_traffic_visit(text,uuid) to service_role;
grant execute on function public.record_qualified_traffic_visit(text,uuid,text) to service_role;
grant execute on function public.record_content_engagement(uuid,text) to service_role;
commit;
