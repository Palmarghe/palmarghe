import { beforeEach, describe, expect, it, vi } from 'vitest';
const state=vi.hoisted(()=>({role:'editor',signIn:vi.fn(),from:vi.fn()}));
vi.mock('./supabase',()=>({supabase:()=>({auth:{signInWithPassword:state.signIn},from:state.from}),localTestRequest:()=>true}));
vi.mock('./local-adapter',()=>({localAuthAllowed:()=>true}));
vi.mock('./runtime-secrets',()=>({runtimeSecret:()=>undefined}));
import { POST } from '../pages/api/auth';
async function login(next='studio',locale='tr') {
  const request=new Request('https://studio.palmarghe.com/api/auth/',{method:'POST',headers:{Origin:'https://studio.palmarghe.com'},body:new URLSearchParams({action:'login',email:'role-qa@example.invalid',password:'LocalTest123!',next,locale})});
  return POST({request,cookies:{}} as Parameters<typeof POST>[0]);
}
describe('Studio login destinations',()=>{
  beforeEach(()=>{
    state.role='editor';state.signIn.mockReset();state.from.mockReset();
    state.signIn.mockResolvedValue({data:{user:{id:'known-user'}},error:null});
    const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),single:vi.fn(async()=>({data:{role:state.role},error:null}))};
    state.from.mockReturnValue(query);
  });
  it('takes an authenticated editor to the existing editor entry point',async()=>{
    const response=await login();
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://studio.palmarghe.com/studio/editor/');
    expect(state.from).toHaveBeenCalledWith('profiles');
    expect(state.from.mock.results[0].value.eq).toHaveBeenCalledWith('id','known-user');
  });
  it.each(['admin','member'])('preserves the normal guarded Studio destination for %s',async role=>{
    state.role=role;
    expect((await login()).headers.get('location')).toBe('https://studio.palmarghe.com/studio/');
  });
  it('does not accept an external destination and retains the localized account flow',async()=>{
    expect((await login('https://example.com/','en')).headers.get('location')).toBe('https://studio.palmarghe.com/en/account/');
    expect(state.from).not.toHaveBeenCalled();
  });
  it('never reads a role or redirects on failed authentication',async()=>{
    state.signIn.mockResolvedValue({data:{user:null},error:{message:'denied'}});
    expect((await login()).status).toBe(400);
    expect(state.from).not.toHaveBeenCalled();
  });
});
