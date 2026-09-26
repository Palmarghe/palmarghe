-- Keep public readers independent from staff capability functions. The prior
-- combined predicate accidentally evaluated the staff branch for anon clients.
drop policy if exists categories_scoped_read on public.categories;
create policy categories_anon_active_read on public.categories for select to anon using (active);
create policy categories_authenticated_scoped_read on public.categories for select to authenticated using (active or (select public.has_permission('taxonomy')) or (select public.has_permission('content')));
drop policy if exists tags_public_read on public.tags;
create policy tags_public_read on public.tags for select to anon,authenticated using (true);
drop policy if exists content_scoped_read on public.content_items;
create policy content_anon_published_read on public.content_items for select to anon using (status='published' and published_at<=now());
create policy content_authenticated_scoped_read on public.content_items for select to authenticated using ((status='published' and published_at<=now()) or (select public.has_permission('content')));
drop policy if exists content_categories_scoped_read on public.content_categories;
create policy content_categories_anon_published_read on public.content_categories for select to anon using (exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()));
create policy content_categories_authenticated_scoped_read on public.content_categories for select to authenticated using (exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()) or (select public.has_permission('content')));
drop policy if exists content_tags_scoped_read on public.content_tags;
create policy content_tags_anon_published_read on public.content_tags for select to anon using (exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()));
create policy content_tags_authenticated_scoped_read on public.content_tags for select to authenticated using (exists(select 1 from public.content_items c where c.id=content_id and c.status='published' and c.published_at<=now()) or (select public.has_permission('content')));
