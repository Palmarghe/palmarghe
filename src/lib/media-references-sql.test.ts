import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const db = new PGlite();
const media = '11111111-1111-4111-8111-111111111111';
const unused = '22222222-2222-4222-8222-222222222222';
const content = '33333333-3333-4333-8333-333333333333';
const revision = '44444444-4444-4444-8444-444444444444';
const document = { type: 'doc', content: [{ type: 'blockquote', content: [{ type: 'mediaImage', attrs: { media_id: media, alt: 'QA' } }, { type: 'mediaGallery', attrs: { media_ids: [media, media] } }] }] };
const migration = readFileSync(new URL('../../supabase/migrations/202610020036_media_references.sql', import.meta.url), 'utf8');
async function asRole(role: string, sql: string, beforeSql?: string) {
  await db.exec('begin; set local role ' + role + ';');
  try { if (beforeSql) await db.exec(beforeSql); return await db.query(sql); } finally { await db.exec('rollback;'); }
}

beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema storage;
    create table public.media(id uuid primary key,path text unique);
    create table public.content_items(id uuid primary key,type text,status text,published_at timestamptz,body jsonb,type_data jsonb,cover_media_id uuid,og_media_id uuid);
    create table public.content_revisions(id uuid primary key,content_id uuid references public.content_items on delete cascade,body jsonb,type_data jsonb);
    create table storage.objects(id uuid primary key,bucket_id text,name text);
    create function public.has_permission(text) returns boolean language sql stable as $$ select current_setting('qa.permission',true)='media' $$;
    grant usage on schema public,storage to anon,authenticated;
    grant select on public.media,public.content_items,storage.objects to anon,authenticated;
    grant delete on public.media,storage.objects to authenticated;
    alter table public.media enable row level security;
    alter table storage.objects enable row level security;
    create policy media_permission_all on public.media for all to authenticated using(public.has_permission('media')) with check(public.has_permission('media'));
    create policy media_storage_permission_select on storage.objects for select to authenticated using(public.has_permission('media'));
    insert into public.media values('${media}','qa.png'),('${unused}','unused.png');
    insert into storage.objects values('${media}','media','qa.png'),('${unused}','media','unused.png');
  `);
  // Backfill existing documents, not only newly triggered inserts.
  await db.query('insert into public.content_items values($1,\'article\',\'draft\',null,$2,\'{}\',null,null)', [content, JSON.stringify(document)]);
  await db.query('insert into public.content_revisions values($1,$2,$3,\'{}\')', [revision, content, JSON.stringify(document)]);
  await db.exec(migration);
}, 30000);
afterAll(async () => { await db.close(); });

describe('migration 036 running on PostgreSQL in WASM', () => {
  it('backfills and deduplicates nested image/gallery references without changing source documents', async () => {
    expect((await db.query('select * from public.content_media_references')).rows).toEqual([{ content_id: content, media_id: media }]);
    expect((await db.query('select * from public.revision_media_references')).rows).toEqual([{ revision_id: revision, media_id: media }]);
    expect((await db.query<{ body: unknown }>('select body from public.content_items where id=$1', [content])).rows[0].body).toEqual(document);
  });
  it('keeps draft media metadata and Storage private', async () => {
    expect((await asRole('anon', 'select * from public.media')).rows).toEqual([]);
    expect((await asRole('anon', 'select * from storage.objects')).rows).toEqual([]);
  });
  it('blocks deletion through a real FK even for an owner who bypasses RLS', async () => {
    await expect(db.query('delete from public.media where id=$1', [media])).rejects.toMatchObject({ code: expect.stringMatching(/^(23503|23001)$/) });
  });
  it('publishes nested body images and Storage only after publication becomes due', async () => {
    await db.query("update public.content_items set status='scheduled',published_at=now()+interval '1 day' where id=$1", [content]);
    expect((await asRole('anon', 'select * from public.media')).rows).toEqual([]);
    await db.query("update public.content_items set published_at=now()-interval '1 minute' where id=$1", [content]);
    expect((await asRole('anon', 'select id from public.media')).rows).toEqual([{ id: media }]);
    expect((await asRole('anon', 'select name from storage.objects')).rows).toEqual([{ name: 'qa.png' }]);
  });
  it('does not expose reference tables or privileged usage helper to anonymous callers', async () => {
    await expect(asRole('anon', 'select * from public.content_media_references')).rejects.toMatchObject({ code: '42501' });
    await expect(asRole('anon', `select public.media_has_references('${media}')`)).rejects.toMatchObject({ code: '42501' });
    await expect(asRole('authenticated', `select public.media_has_references('${media}')`)).rejects.toMatchObject({ code: '42501' });
  });
  it('prevents direct Storage deletion by a media editor while references exist', async () => {
    await db.exec("set qa.permission='media';");
    expect((await asRole('authenticated', `delete from storage.objects where name='qa.png' returning id`)).rows).toEqual([]);
    expect((await asRole('authenticated', `delete from storage.objects where name='unused.png' returning id`)).rows).toEqual([]);
    expect((await asRole('authenticated', `delete from storage.objects where name='unused.png' returning id`, `delete from public.media where id='${unused}'`)).rows).toEqual([{ id: unused }]);
  });
  it('retains removed body images through revisions and keeps them private after archival', async () => {
    await db.query("update public.content_items set body='{}',status='archived' where id=$1", [content]);
    expect((await db.query('select * from public.content_media_references')).rows).toEqual([]);
    expect((await asRole('anon', 'select * from public.media')).rows).toEqual([]);
    await expect(db.query('delete from public.media where id=$1', [media])).rejects.toMatchObject({ code: expect.stringMatching(/^(23503|23001)$/) });
  });
  it('rejects references to missing media in the same content-write transaction', async () => {
    const missing = { type: 'doc', content: [{ type: 'mediaImage', attrs: { media_id: '99999999-9999-4999-8999-999999999999' } }] };
    await expect(db.query('update public.content_items set body=$1 where id=$2', [JSON.stringify(missing), content])).rejects.toMatchObject({ code: '23503' });
    expect((await db.query<{ body: unknown }>('select body from public.content_items where id=$1', [content])).rows[0].body).toEqual({});
  });
  it('protects cover, OG and type-data gallery references added after migration', async () => {
    await db.query("update public.content_items set type='gallery',type_data=$1,cover_media_id=$2,og_media_id=$2 where id=$3", [JSON.stringify({ gallery_media_ids: [media, unused] }), unused, content]);
    expect((await db.query('select count(*)::int as count from public.content_media_references')).rows).toEqual([{ count: 2 }]);
    await expect(db.query('delete from public.media where id=$1', [unused])).rejects.toMatchObject({ code: expect.stringMatching(/^(23503|23001)$/) });
  });
  it('can be reapplied without changing content or duplicating references', async () => {
    await db.exec(migration);
    expect((await db.query('select count(*)::int as count from public.content_media_references')).rows).toEqual([{ count: 2 }]);
  });
});
