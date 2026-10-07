import {beforeAll,afterAll,it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
const db=new PGlite(),id='11111111-1111-4111-8111-111111111111',owner='22222222-2222-4222-8222-222222222222';
const descriptors=[{width:320,height:200,bytes:12000},{width:640,height:400,bytes:24000}];
beforeAll(async()=>{
 await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('qa.uid',true),'')::uuid$$;
 create function public.current_role() returns text language sql stable as $$select current_setting('qa.role',true)$$;
 create function public.has_permission(text) returns boolean language sql stable as $$select current_setting('qa.permission',true)='media'$$;
 create table public.profiles(id uuid primary key);insert into public.profiles values('${owner}');
 create table public.media(id uuid primary key,path text unique,width integer,height integer,bytes integer,published boolean);
 create table storage.objects(bucket_id text,name text,metadata jsonb);
 create table public.refs(media_id uuid references public.media on delete restrict);
 create function public.media_is_public(uuid) returns boolean language sql stable security definer as $$select published from public.media where id=$1$$;
 grant usage on schema public,auth,storage to anon,authenticated;
 grant select on public.media,storage.objects to anon,authenticated;
 grant insert,update,delete on storage.objects to authenticated;
 alter table public.media enable row level security;alter table storage.objects enable row level security;
 create policy original_media_read on public.media for select to anon,authenticated using(published or public.current_role() in ('admin','editor') and public.has_permission('media'));
 create policy original_storage_read on storage.objects for select to anon,authenticated using(exists(select 1 from public.media m where m.path=name and m.published));
 create policy staff_storage on storage.objects for all to authenticated using(public.current_role() in ('admin','editor') and public.has_permission('media')) with check(public.current_role() in ('admin','editor') and public.has_permission('media'));
 insert into public.media values('${id}','original.png',1000,625,200000,true);
 insert into storage.objects values('media','original.png','{"size":200000,"mimetype":"image/png"}');`);
 for(const name of ['202610020037_media_cleanup_queue.sql','202610070045_media_renditions.sql'])
  await db.exec(readFileSync(new URL('../../supabase/migrations/'+name,import.meta.url),'utf8'));
},30000);
afterAll(()=>db.close());
async function staff(){await db.exec(`set local qa.uid='${owner}';set local qa.role='editor';set local qa.permission='media';set local role authenticated;`);}
async function prepare(values=descriptors){return (await db.query<{job:{id:string;descriptors:any[]}}>('select public.prepare_media_renditions($1,$2,$3::jsonb) job',[id,'original.png',JSON.stringify(values)])).rows[0].job;}
async function tx(action:()=>Promise<void>){await db.exec('begin');try{await action();}finally{await db.exec('rollback');}}
it('installation preserves original metadata and creates no derived records',async()=>{
 expect((await db.query('select path,width,height,bytes from public.media')).rows).toEqual([{path:'original.png',width:1000,height:625,bytes:200000}]);
 expect((await db.query('select count(*)::int n from public.media_renditions')).rows).toEqual([{n:0}]);
});
it('registers durable paths before upload and publishes all descriptors only after all objects exist',async()=>tx(async()=>{
 await staff();const job=await prepare();expect(job.descriptors.map(d=>d.path)).toEqual(descriptors.map(d=>`renditions/${id}/${job.id}/${d.width}.webp`));
 expect((await db.query('select public.complete_media_renditions($1) ok',[job.id])).rows).toEqual([{ok:false}]);
 expect((await db.query('select count(*)::int n from public.media_renditions')).rows).toEqual([{n:0}]);
 for(const d of job.descriptors)await db.query('insert into storage.objects values($1,$2,$3::jsonb)',['media',d.path,JSON.stringify({mimetype:'image/webp',size:d.bytes})]);
 expect((await db.query('select public.complete_media_renditions($1) ok',[job.id])).rows).toEqual([{ok:true}]);
 expect((await db.query('select public.complete_media_renditions($1) ok',[job.id])).rows).toEqual([{ok:true}]);
 expect((await db.query('select width,height from public.media_renditions order by width')).rows).toEqual([{width:320,height:200},{width:640,height:400}]);
 await expect(db.query('select * from public.media_rendition_jobs')).rejects.toMatchObject({code:'42501'});
}));
it('denies members even with a media capability and rejects malformed/foreign-source descriptors',async()=>{
 await expect(tx(async()=>{await staff();await db.exec("set local qa.role='member'");await prepare();})).rejects.toMatchObject({code:'42501'});
 await expect(tx(async()=>{await db.exec('set local role anon');await prepare();})).rejects.toMatchObject({code:'42501'});
 for(const values of [[{width:320,height:200}],[{width:320,height:199,bytes:12000}],[{width:960,height:600,bytes:300000}],[descriptors[0],descriptors[0]]])
  await expect(tx(async()=>{await staff();await prepare(values as any);})).rejects.toMatchObject({code:'22023'});
 await expect(tx(async()=>{await staff();await db.query('select public.prepare_media_renditions($1,$2,$3::jsonb)',[id,'foreign.png',JSON.stringify(descriptors)]);})).rejects.toMatchObject({code:'22023'});
});
it('revokes public derivative and Storage reads when the original becomes private; live paths cannot be overwritten/deleted',async()=>tx(async()=>{
 await staff();const job=await prepare();for(const d of job.descriptors)await db.query('insert into storage.objects values($1,$2,$3::jsonb)',['media',d.path,JSON.stringify({mimetype:'image/webp',size:d.bytes})]);
 await db.query('select public.complete_media_renditions($1)',[job.id]);
 expect((await db.query('delete from storage.objects where name=$1 returning name',[job.descriptors[0].path])).rows).toEqual([]);
 expect((await db.query('update storage.objects set metadata=$1::jsonb where name=$2 returning name',['{}',job.descriptors[0].path])).rows).toEqual([]);
 await db.exec('set local role anon');expect((await db.query('select count(*)::int n from public.media_renditions')).rows).toEqual([{n:2}]);
 expect((await db.query("select count(*)::int n from storage.objects where name like 'renditions/%'")).rows).toEqual([{n:2}]);
 await db.exec(`reset role;update public.media set published=false where id='${id}';set local qa.role='';set local role anon`);
 expect((await db.query('select * from public.media_renditions')).rows).toEqual([]);expect((await db.query('select * from storage.objects')).rows).toEqual([]);
}));
it('snapshots completed and interrupted paths before cascade and completes cleanup only after every object is absent',async()=>tx(async()=>{
 await staff();const first=await prepare();for(const d of first.descriptors)await db.query('insert into storage.objects values($1,$2,$3::jsonb)',['media',d.path,JSON.stringify({mimetype:'image/webp',size:d.bytes})]);
 await db.query('select public.complete_media_renditions($1)',[first.id]);const interrupted=await prepare([descriptors[0]]);
 await db.query('insert into storage.objects values($1,$2,$3::jsonb)',['media',interrupted.descriptors[0].path,JSON.stringify({mimetype:'image/webp',size:12000})]);
 await db.exec(`reset role;delete from public.media where id='${id}';`);await staff();
 const receipt=(await db.query<{id:string;derived_paths:string[]}>('select * from public.pending_media_cleanup()')).rows[0];
 expect(receipt.derived_paths.sort()).toEqual([...first.descriptors,...interrupted.descriptors].map(d=>d.path).sort());
 expect((await db.query('select * from public.media_renditions')).rows).toEqual([]);
 expect((await db.query('select public.complete_media_cleanup($1) ok',[receipt.id])).rows).toEqual([{ok:false}]);
 await db.query("delete from storage.objects where bucket_id='media' and name=any($1)",[receipt.derived_paths]);
 expect((await db.query('select public.complete_media_cleanup($1) ok',[receipt.id])).rows).toEqual([{ok:false}]);
 await db.exec("delete from storage.objects where name='original.png'");
 expect((await db.query('select public.complete_media_cleanup($1) ok',[receipt.id])).rows).toEqual([{ok:true}]);
}));
it('a referenced original cannot be deleted and produces no cleanup receipt',async()=>tx(async()=>{
 await db.exec(`insert into public.refs values('${id}')`);
  await db.exec('savepoint deletion');await expect(db.exec(`delete from public.media where id='${id}'`)).rejects.toMatchObject({code:expect.stringMatching(/^(23503|23001)$/)});
 await db.exec('rollback to savepoint deletion');expect((await db.query('select * from public.media_cleanup_queue')).rows).toEqual([]);
}));
