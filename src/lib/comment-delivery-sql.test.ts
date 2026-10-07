import {afterAll,beforeAll,it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';import {readFileSync} from 'node:fs';
const db=new PGlite(),user='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222',content='33333333-3333-4333-8333-333333333333',request='44444444-4444-4444-8444-444444444444';
beforeAll(async()=>{await db.exec(`create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('qa.uid',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated;create table public.profiles(id uuid primary key);create table public.content_items(id uuid primary key,status text,published_at timestamptz);create table public.comments(id uuid primary key default gen_random_uuid(),content_id uuid references public.content_items(id),user_id uuid references public.profiles(id),body text,status text);insert into public.profiles values('${user}'),('${other}');insert into public.content_items values('${content}','published',now()-interval '1 day');`);await db.exec(readFileSync(new URL('../../supabase/migrations/202610070042_comment_delivery.sql',import.meta.url),'utf8'));},30000);
afterAll(async()=>db.close());
const call=()=>db.query<{result:{id:string|null;created:boolean;removed:boolean}}>(`select public.deliver_comment('${content}','${request}','A retained comment') result`);
it('durably deduplicates retries, validates payload, scopes keys to identity and keeps receipts private',async()=>{
 await db.exec(`set qa.uid='${user}';set role authenticated;`);const first=(await call()).rows[0].result;expect(first.created).toBe(true);expect((await call()).rows[0].result).toEqual({...first,created:false});
 await expect(db.query(`select public.deliver_comment('${content}','${request}','Changed body')`)).rejects.toMatchObject({code:'22023'});
 await expect(db.query('select * from public.comment_deliveries')).rejects.toMatchObject({code:'42501'});await expect(db.exec(`insert into public.comment_deliveries(user_id,request_id,content_id,body_hash) values('${other}','${request}','${content}',sha256('forged'))`)).rejects.toMatchObject({code:'42501'});
 await db.exec(`set qa.uid='${other}';`);expect((await call()).rows[0].result.created).toBe(true);
 await db.exec('reset role;');expect((await db.query('select count(*)::int n from public.comments')).rows).toEqual([{n:2}]);
 await db.exec(`delete from public.comments where id='${first.id}';set qa.uid='${user}';set role authenticated;`);expect((await call()).rows[0].result).toEqual({id:null,created:false,removed:true});
 await db.exec('reset role;set role anon;');await expect(call()).rejects.toMatchObject({code:'42501'});await expect(db.query('select * from public.comment_deliveries')).rejects.toMatchObject({code:'42501'});await db.exec('reset role;');
});
it('rejects no identity, missing key, invalid body and unpublished content without leaving receipts',async()=>{
 await db.exec("set qa.uid='';set role authenticated;");await expect(call()).rejects.toMatchObject({code:'42501'});await db.exec(`set qa.uid='${user}';`);
 for(const query of [`select public.deliver_comment('${content}',null,'A body')`,`select public.deliver_comment('${content}',gen_random_uuid(),'x')`,`select public.deliver_comment('${content}',gen_random_uuid(),null)`])await expect(db.query(query)).rejects.toMatchObject({code:'22023'});
 await db.exec(`reset role;update public.content_items set status='archived';set role authenticated;`);await expect(call()).rejects.toMatchObject({code:'22023'});await db.exec('reset role;');expect((await db.query('select count(*)::int n from public.comment_deliveries')).rows).toEqual([{n:2}]);
 await db.exec(`delete from public.profiles where id='${user}';`);expect((await db.query('select count(*)::int n from public.comment_deliveries')).rows).toEqual([{n:1}]);
});
