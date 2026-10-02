import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({
  usage: { data: false as unknown, error: null as unknown },
  deletion: { error: null as unknown },
  remove: vi.fn(async () => ({ error: null as unknown })),
  cleanupError: null as unknown, completed: true, cleanupReads: 0,
  delete: vi.fn(), rpc: vi.fn(),
}));
vi.mock('./supabase', () => ({ localMode: false, supabase: () => ({
 auth: { getUser: async () => ({ data: { user: { id: 'qa-admin' } } }) },
 from: (table: string) => {
  let deleting=false;
  const q={ select: () => q, eq: () => deleting ? Promise.resolve(state.deletion) : q,
   single: async () => ({ data: table==='profiles' ? {role:'admin'} : {id:'11111111-1111-4111-8111-111111111111',path:'qa.png'}, error:null }),
   delete: () => {state.delete();deleting=true;return q;},
  };return q;
 },
 rpc: (name:string) => {
   state.rpc(name);
   if(name==='pending_media_cleanup') return Promise.resolve({data:++state.cleanupReads===1 ? [] : [{id:'22222222-2222-4222-8222-222222222222',media_id:'11111111-1111-4111-8111-111111111111',path:'qa.png'}],error:state.cleanupError});
   if(name==='complete_media_cleanup') return Promise.resolve({data:state.completed,error:null});
   return Promise.resolve(state.usage);
 },
 storage: {from: () => ({remove:state.remove})},
}) }));
import { POST } from '../pages/api/media/manage';
async function removeMedia(operation='delete'){
 const data=new FormData();data.set('id','11111111-1111-4111-8111-111111111111');data.set('operation',operation);data.set('path','browser-supplied-do-not-delete.png');
 const request=new Request('https://studio.palmarghe.com/api/media/manage/',{method:'POST',headers:{origin:'https://studio.palmarghe.com'},body:data});
 return POST({request,cookies:{}} as Parameters<typeof POST>[0]);
}
beforeEach(()=>{vi.clearAllMocks();state.usage={data:false,error:null};state.deletion={error:null};state.cleanupError=null;state.completed=true;state.cleanupReads=0;state.remove.mockResolvedValue({error:null});});
describe('authoritative media deletion guard',()=>{
 it.each([{data:null,error:{code:'42883'}},{data:null,error:null},{data:'false',error:null}])('fails closed when usage cannot be verified: %j',async usage=>{
  state.usage=usage;expect((await removeMedia()).status).toBe(503);expect(state.delete).not.toHaveBeenCalled();expect(state.remove).not.toHaveBeenCalled();
 });
 it('returns conflict without deleting a referenced object',async()=>{
  state.usage={data:true,error:null};expect((await removeMedia()).status).toBe(409);expect(state.delete).not.toHaveBeenCalled();expect(state.remove).not.toHaveBeenCalled();
 });
 it.each(['23503','23001'])('preserves the stored file when FK rejects a raced deletion: %s',async code=>{
  state.deletion={error:{code}};expect((await removeMedia()).status).toBe(409);expect(state.delete).toHaveBeenCalledOnce();expect(state.remove).not.toHaveBeenCalled();
 });
 it('removes Storage only after metadata deletion succeeds',async()=>{
  expect((await removeMedia()).status).toBe(303);expect(state.delete).toHaveBeenCalledOnce();expect(state.remove).toHaveBeenCalledWith(['qa.png']);expect(state.delete.mock.invocationCallOrder[0]).toBeLessThan(state.remove.mock.invocationCallOrder[0]);
 });
 it('fails before metadata deletion when durable cleanup support is unavailable',async()=>{
  state.cleanupError={code:'42883'};expect((await removeMedia()).status).toBe(503);expect(state.delete).not.toHaveBeenCalled();expect(state.remove).not.toHaveBeenCalled();
 });
 it('shows pending cleanup instead of success after a Storage error',async()=>{
  state.remove.mockResolvedValue({error:{message:'storage unavailable'}});
  const response=await removeMedia();expect(response.status).toBe(303);expect(response.headers.get('location')).toContain('cleanup=pending');expect(state.rpc).not.toHaveBeenCalledWith('complete_media_cleanup');
 });
 it('requires database confirmation that the stored object is absent',async()=>{
  state.completed=false;expect((await removeMedia()).headers.get('location')).toContain('cleanup=pending');
 });
 it('retains the receipt when Storage transport throws',async()=>{
  state.remove.mockRejectedValueOnce(new Error('network'));expect((await removeMedia()).headers.get('location')).toContain('cleanup=pending');
 });
 it('retries an existing receipt without deleting metadata again or trusting a browser path',async()=>{
  state.cleanupReads=1;const response=await removeMedia('cleanup');expect(response.headers.get('location')).toContain('cleanup=complete');expect(state.delete).not.toHaveBeenCalled();expect(state.remove).toHaveBeenCalledWith(['qa.png']);
 });
 it('does not delete Storage for an unknown cleanup receipt',async()=>{
  expect((await removeMedia('cleanup')).headers.get('location')).toContain('cleanup=pending');expect(state.delete).not.toHaveBeenCalled();expect(state.remove).not.toHaveBeenCalled();
 });
});

