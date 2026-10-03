import { afterAll, beforeAll, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const db = new PGlite();
beforeAll(async () => {
  await db.exec(`create role authenticated; create role anon;
    create table public.content_revisions(title text);
    alter table public.content_revisions enable row level security;
    create function public.has_permission(text) returns boolean language sql stable as $$select current_setting('qa.content',true)='yes'$$;
    create policy staff_read on public.content_revisions for select using(public.has_permission('content'));
    create policy staff_write on public.content_revisions for insert with check(public.has_permission('content'));
    grant usage on schema public to authenticated,anon;`);
  await db.exec(readFileSync(new URL('../../supabase/migrations/202610030038_content_revision_write_grants.sql', import.meta.url), 'utf8'));
}, 30000);
afterAll(async () => { await db.close(); });
it('allows staff revision writes and reads while denying members and anonymous users', async () => {
  await db.exec(`set role authenticated; set qa.content='yes'; insert into public.content_revisions values('QA');`);
  expect((await db.query('select title from public.content_revisions')).rows).toEqual([{ title: 'QA' }]);
  await db.exec(`set qa.content='no';`);
  expect((await db.query('select title from public.content_revisions')).rows).toEqual([]);
  await expect(db.exec("insert into public.content_revisions values('denied')")).rejects.toMatchObject({ code: '42501' });
  await db.exec('reset role; set role anon;');
  await expect(db.query('select title from public.content_revisions')).rejects.toMatchObject({ code: '42501' });
  await db.exec('reset role;');
});
