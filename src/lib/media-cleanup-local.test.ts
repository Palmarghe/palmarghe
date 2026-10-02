import { describe, expect, it } from 'vitest';
import { localSupabase, localStoreMedia, localReadMedia, localDeleteMedia } from './local-adapter';
import type { AstroCookies } from 'astro';
const actor=(suffix:number)=>localSupabase({get:()=>({value:`00000000-0000-4000-8000-10000000000${suffix}`})} as unknown as AstroCookies);
describe('local cleanup lifecycle',()=>{
 it('retains a receipt while file bytes remain, then completes without repeat deletion',async()=>{
  const db=actor(1),path=`cleanup-${crypto.randomUUID()}.png`,id=crypto.randomUUID();
  localStoreMedia(path,new Uint8Array([1,2,3]));
  await db.from('media').insert({id,path,mime:'image/png'});
  await db.from('media').delete().eq('id',id);
  const pending=await db.rpc('pending_media_cleanup',{p_media_id:id});
  expect(pending.data).toHaveLength(1);
  const task=pending.data[0];expect(task.path).toBe(path);expect(localReadMedia(path)).not.toBeNull();
  expect((await db.rpc('complete_media_cleanup',{p_task_id:task.id})).data).toBe(false);
  localDeleteMedia(path);
  expect((await db.rpc('complete_media_cleanup',{p_task_id:task.id})).data).toBe(true);
  expect((await db.rpc('pending_media_cleanup',{p_media_id:id})).data).toEqual([]);
  expect((await db.rpc('complete_media_cleanup',{p_task_id:task.id})).data).toBe(false);
 });
 it('denies queue operations to an ordinary member',async()=>{
  for(const name of ['pending_media_cleanup','complete_media_cleanup']) expect((await actor(3).rpc(name,{})).error?.code).toBe('42501');
 });
});
