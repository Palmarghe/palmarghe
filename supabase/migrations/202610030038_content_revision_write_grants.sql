-- The invoker revision trigger needs these table privileges. RLS continues to
-- require has_permission('content') for both operations; no anonymous access.
grant select, insert on public.content_revisions to authenticated;
