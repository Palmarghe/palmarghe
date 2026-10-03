-- Restore the existing own-record bookmark API. bookmarks_own RLS remains active.
grant select, insert, delete on public.content_bookmarks to authenticated;
