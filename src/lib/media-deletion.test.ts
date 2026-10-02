import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({
  usage: { data: false as unknown, error: null as unknown },
  deletion: { error: null as unknown },
  remove: vi.fn(async () => ({ error: null })),
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
 rpc: () => {state.rpc();return Promise.resolve(state.usage);},
 storage: {from: () => ({remove:state.remove})},
}) }));
import { POST } from '../pages/api/media/manage';
async function removeMedia(){
 const data=new FormData();data.set('id','11111111-1111-4111-8111-111111111111');data.set('operation','delete');
 const request=new Request('https://studio.palmarghe.com/api/media/manage/',{method:'POST',headers:{origin:'https://studio.palmarghe.com'},body:data});
 return POST({request,cookies:{}} as Parameters<typeof POST>[0]);
}
beforeEach(()=>{vi.clearAllMocks();state.usage={data:false,error:null};state.deletion={error:null};});
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
});

