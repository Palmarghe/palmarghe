import { beforeEach, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
const state=vi.hoisted(()=>({insert:vi.fn(),storage:vi.fn(),upload:vi.fn()}));
vi.mock('./media-permission',()=>({canManageMedia:async()=>true}));
vi.mock('./supabase',()=>({localMode:false,supabase:()=>({auth:{getUser:async()=>({data:{user:{id:'qa'}}})},from:()=>({insert:state.insert}),storage:{from:state.storage}})}));
import {POST} from '../pages/api/media/index';
beforeEach(()=>{vi.clearAllMocks();state.insert.mockResolvedValue({error:null});state.upload.mockResolvedValue({error:null});state.storage.mockReturnValue({upload:state.upload});});
async function request(operation:string,bytes:Uint8Array){
  const form=new FormData();form.set('operation',operation);form.set('alt_tr','Test');form.set('file',new File([bytes as BlobPart],'qa.png',{type:'image/png'}));
  return POST({request:new Request('https://studio.palmarghe.com/api/media/',{method:'POST',headers:{origin:'https://studio.palmarghe.com'},body:form}),cookies:{}} as Parameters<typeof POST>[0]);
}
describe('real decoder API boundary',()=>{
  it('validates decoded dimensions without any Storage or metadata writes',async()=>{
    const bytes=await sharp({create:{width:43,height:29,channels:3,background:'#9271ac'}}).png().toBuffer();
    const response=await request('validate',bytes);expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({validated:true,width:43,height:29,mime:'image/png'});
    expect(state.storage).not.toHaveBeenCalled();expect(state.insert).not.toHaveBeenCalled();
  });
  it('stores actual dimensions on a normal upload',async()=>{
    const bytes=await sharp({create:{width:43,height:29,channels:3,background:'#9271ac'}}).png().toBuffer();
    expect((await request('upload',bytes)).status).toBe(303);
    expect(state.upload).toHaveBeenCalledOnce();expect(state.insert).toHaveBeenCalledWith(expect.objectContaining({width:43,height:29,uploaded_by:'qa'}));
  });
  it('rejects invalid pixels before any mutation and releases the claim',async()=>{
    expect((await request('upload',new Uint8Array([137,80,78,71,13,10,26,10]))).status).toBe(400);
    expect(state.storage).not.toHaveBeenCalled();expect(state.insert).not.toHaveBeenCalled();
    const good=await sharp({create:{width:1,height:1,channels:3,background:'#9271ac'}}).png().toBuffer();
    expect((await request('validate',good)).status).toBe(200);
  });
});
