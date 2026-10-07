import {afterAll,beforeAll,expect,it} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
const db=new PGlite(),user='00000000-0000-4000-8000-100000000003',other='00000000-0000-4000-8000-100000000001',content='00000000-0000-4000-8000-200000000001';
beforeAll(async()=>{
 await db.exec(`create role authenticated;create role anon;create schema auth;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('qa.uid',true),'')::uuid$$;
 create function public.current_role() returns text language sql stable as $$select 'member'::text$$;
 grant usage on schema public,auth to authenticated,anon;
 create table public.profiles(id uuid primary key);
 create table public.media(id uuid primary key);
 create table public.content_items(id uuid primary key,status text,published_at timestamptz);
grant select on public.content_items to authenticated,anon;
 alter default privileges in schema public grant all on tables to authenticated;
 alter default privileges in schema public grant usage on sequences to authenticated;
 insert into public.profiles values('${user}'),('${other}');
 insert into public.content_items values('${content}','published',now()-interval '1 hour');`);
 for(const name of ['202609270026_community_editorial_foundation.sql','202610030039_content_likes.sql','202610030040_bookmark_grants.sql'])await db.exec(readFileSync(new URL('../../supabase/migrations/'+name,import.meta.url),'utf8'));
 await db.exec('revoke update on public.content_bookmarks from authenticated;revoke all on public.content_follows,public.content_notifications from authenticated;');
 await db.exec(readFileSync(new URL('../../supabase/migrations/202610070043_library_grants.sql',import.meta.url),'utf8'));
 await db.exec(`insert into public.content_notifications(user_id,kind,title,href) values('${user}','system','Own QA','/account/'),('${other}','system','Foreign QA','/account/');`);
 await db.exec(`set role authenticated;set qa.uid='${user}';`);
},30000);
afterAll(async()=>{await db.close();});
it('uses the actual composite keys and RLS to make desired-state replay safe without UPDATE privileges',async()=>{
 for(const table of ['content_likes','content_bookmarks','content_follows']){
  const follow=table==='content_follows',columns=follow?'user_id,target_kind,target_id':'user_id,content_id';
  const values=follow?`'${user}','category','${content}'`:`'${user}','${content}'`;
  const insert=`insert into public.${table}(${columns}) values(${values}) on conflict(${columns}) do nothing`;
  await db.exec(insert);const original=(await db.query(`select created_at from public.${table}`)).rows;
  await db.exec(insert);expect((await db.query(`select created_at from public.${table}`)).rows).toEqual(original);
  await expect(db.exec(insert.replace(user,other))).rejects.toMatchObject({code:'42501'});
  await db.exec(`delete from public.${table} where user_id='${user}';delete from public.${table} where user_id='${user}';`);
  expect((await db.query(`select * from public.${table}`)).rows).toEqual([]);
 }
 await expect(db.exec(`update public.content_likes set user_id='${other}'`)).rejects.toMatchObject({code:'42501'});
 await db.exec('reset role;set role anon;');
 await expect(db.query('select * from public.content_likes')).rejects.toMatchObject({code:'42501'});
 await expect(db.query('select * from public.content_bookmarks')).rejects.toMatchObject({code:'42501'});
 await db.exec('reset role;');
});

it('limits notifications to own reads and read_at writes, denies changing recipient/title or creating messages',async()=>{
 await db.exec(`set role authenticated;set qa.uid='${user}';`);
 expect((await db.query('select title from public.content_notifications')).rows).toEqual([{title:'Own QA'}]);
 await db.exec(`update public.content_notifications set read_at=now() where user_id='${user}';update public.content_notifications set read_at=now() where user_id='${user}';`);
 expect((await db.query('select read_at is not null as confirmed from public.content_notifications')).rows).toEqual([{confirmed:true}]);
 await expect(db.exec("update public.content_notifications set title='changed'")).rejects.toMatchObject({code:'42501'});
 await expect(db.exec(`update public.content_notifications set user_id='${other}'`)).rejects.toMatchObject({code:'42501'});
 await expect(db.exec(`insert into public.content_notifications(user_id,kind,title,href) values('${user}','system','denied','/account/')`)).rejects.toMatchObject({code:'42501'});
 await db.exec(`reset role;set role anon;`);await expect(db.query('select * from public.content_notifications')).rejects.toMatchObject({code:'42501'});
 await db.exec(`reset role;`);expect((await db.query(`select read_at from public.content_notifications where user_id='${other}'`)).rows).toEqual([{read_at:null}]);
});
