import {afterAll,beforeAll,expect,it} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
const db=new PGlite();
beforeAll(async()=>{
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create table public.audit_logs(id bigint generated always as identity primary key,action text not null,entity text not null,entity_id text);
 alter table public.audit_logs enable row level security;
 grant usage on schema public to anon,authenticated,service_role;`);
 await db.exec(readFileSync(new URL('../../supabase/migrations/202610060041_studio_observation_grants.sql',import.meta.url),'utf8'));
},30000);
afterAll(async()=>{await db.close();});
it('permits Worker samples while denying browser writes and unnecessary service reads/updates',async()=>{
 for(const role of ['anon','authenticated']){
  await db.exec(`set role ${role};`);
  await expect(db.exec("insert into public.audit_logs(action,entity) values('OPERATION_OK','studio_request')")).rejects.toMatchObject({code:'42501'});
  await db.exec('reset role;');
 }
 await db.exec("set role service_role; insert into public.audit_logs(action,entity,entity_id) values('OPERATION_OK','studio_request','{\"status\":303,\"duration_ms\":42}');");
 await expect(db.query('select * from public.audit_logs')).rejects.toMatchObject({code:'42501'});
 await expect(db.exec("update public.audit_logs set action='changed'")).rejects.toMatchObject({code:'42501'});
 await expect(db.exec('delete from public.audit_logs')).rejects.toMatchObject({code:'42501'});
 await db.exec('reset role;');
 expect((await db.query('select action,entity,entity_id from public.audit_logs')).rows).toEqual([{action:'OPERATION_OK',entity:'studio_request',entity_id:'{"status":303,"duration_ms":42}'}]);
});
