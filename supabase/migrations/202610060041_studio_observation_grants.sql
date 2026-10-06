-- Worker-only bounded operation samples. Browser roles keep their existing
-- SELECT/RLS boundary; no browser INSERT policy or read grant is added.
grant insert on public.audit_logs to service_role;
grant usage on sequence public.audit_logs_id_seq to service_role;
