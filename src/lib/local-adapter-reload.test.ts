import {afterEach,expect,it,vi} from 'vitest';
import type {AstroCookies} from 'astro';

const key=Symbol.for('palmarghe.local-qa-store.v1');
const cookies={get:()=>({value:'00000000-0000-4000-8000-100000000001'})} as unknown as AstroCookies;
afterEach(()=>{Reflect.deleteProperty(globalThis,key);vi.unstubAllEnvs();vi.resetModules();});

it('keeps media rows and bytes coherent when local QA SSR modules reload',async()=>{
 vi.stubEnv('DEV',true);vi.stubEnv('LOCAL_TEST_MODE','true');
 const first=await import('./local-adapter');
 const id='00000000-0000-4000-8000-900000000001';
 await first.localSupabase(cookies).from('media').insert({id,path:'reload.webp',mime:'image/webp'});
 first.localStoreMedia('reload.webp',new Uint8Array([1,2,3]));
 vi.resetModules();const second=await import('./local-adapter');
 expect(second).not.toBe(first);
 const row=await second.localSupabase(cookies).from('media').select('id,path').eq('id',id).single();
 expect(row.error).toBeNull();expect(row.data).toEqual({id,path:'reload.webp'});
 expect(second.localReadMedia('reload.webp')).toEqual(new Uint8Array([1,2,3]));
});

it('never shares a development store in a production module',async()=>{
 vi.stubEnv('DEV',true);vi.stubEnv('LOCAL_TEST_MODE','true');
 const local=await import('./local-adapter');local.localStoreMedia('private-qa.webp',new Uint8Array([7]));
 vi.stubEnv('DEV',false);vi.resetModules();const production=await import('./local-adapter');
 expect(production.localReadMedia('private-qa.webp')).toBeNull();
});
