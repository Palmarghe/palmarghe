import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const db=new PGlite();
const id='11111111-1111-4111-8111-111111111111';
beforeAll(async()=>{
 await db.exec(`create role anon;create role authenticated;create schema storage;
 create table public.media(id uuid primary key,path text unique);
 create table storage.objects(bucket_id text,name text);
 create table public.refs(media_id uuid references public.media on delete restrict);
 create function public.has_permission(text) returns boolean language sql stable as $$select current_setting('qa.permission',true)='media'$$;
 grant usage on schema public to anon,authenticated;
 insert into public.media values('${id}','qa.png');insert into storage.objects values('media','qa.png');`);
 await db.exec(readFileSync(new URL('../../supabase/migrations/202610020037_media_cleanup_queue.sql',import.meta.url),'utf8'));
},30000);
afterAll(async()=>{await db.close();});
async function transaction(sql:string){await db.exec('begin');try{return (await db.exec(sql)).at(-1)!;}finally{await db.exec('rollback');}}
describe('durable deletion cleanup running in PostgreSQL WASM',()=>{
 it('does not create tasks or alter source rows when migration is installed',async()=>{
  expect((await db.query('select count(*)::int n from public.media_cleanup_queue')).rows).toEqual([{n:0}]);
  expect((await db.query('select * from public.media')).rows).toEqual([{id,path:'qa.png'}]);
 });
 it('records the exact server path atomically with metadata deletion',async()=>{
  const result=await transaction(`with deleted as(delete from public.media where id='${id}' returning id) select * from deleted`);expect(result.rows).toEqual([{id}]);
  await db.exec('begin');try{
   await db.exec(`delete from public.media where id='${id}'`);
   expect((await db.query('select media_id,path from public.media_cleanup_queue')).rows).toEqual([{media_id:id,path:'qa.png'}]);
  }finally{await db.exec('rollback');}
 });
 it('preserves metadata and creates no receipt when a restrictive FK rejects deletion',async()=>{
  await db.exec(`insert into public.refs values('${id}')`);
  try{await expect(db.exec(`delete from public.media where id='${id}'`)).rejects.toMatchObject({code:expect.stringMatching(/^(23503|23001)$/)});
   expect((await db.query('select count(*)::int n from public.media_cleanup_queue')).rows).toEqual([{n:0}]);
  }finally{await db.exec('delete from public.refs');}
 });
 it('denies anonymous calls, direct table reads and callers without media permission',async()=>{
  await expect(transaction('set local role anon;select * from public.pending_media_cleanup()')).rejects.toMatchObject({code:'42501'});
  await expect(transaction('set local role authenticated;select * from public.media_cleanup_queue')).rejects.toMatchObject({code:'42501'});
  await expect(transaction('set local role authenticated;select * from public.pending_media_cleanup()')).rejects.toMatchObject({code:'42501'});
 });
 it('keeps the receipt until the actual Storage object is absent and completion is idempotent',async()=>{
  await db.exec('begin');try{
   await db.exec(`delete from public.media where id='${id}';set local qa.permission='media';set local role authenticated;`);
   const task=(await db.query<{id:string}>('select * from public.pending_media_cleanup()')).rows[0];
   expect((await db.query('select public.complete_media_cleanup($1) completed',[task.id])).rows).toEqual([{completed:false}]);
   await db.exec('reset role;delete from storage.objects;set local role authenticated;');
   expect((await db.query('select public.complete_media_cleanup($1) completed',[task.id])).rows).toEqual([{completed:true}]);
   expect((await db.query('select public.complete_media_cleanup($1) completed',[task.id])).rows).toEqual([{completed:false}]);
  }finally{await db.exec('rollback');}
 });
 it('does not authorize cleanup completion for an anonymous caller',async()=>{
  await expect(transaction(`set local role anon;select public.complete_media_cleanup('${id}')`)).rejects.toMatchObject({code:'42501'});
 });
});
