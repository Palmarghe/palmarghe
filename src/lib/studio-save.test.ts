import { afterEach, describe, expect, it, vi } from 'vitest';
import { STUDIO_SAVE_TIMEOUT_MS, StudioSaveError, submitStudioForm, studioSaveMessage, validateStudioImage } from './studio-save';

const action = 'https://studio.palmarghe.com/api/studio/';
function response(status: number, url = 'https://studio.palmarghe.com/studio/?section=content', redirected = true) {
  const result = new Response(null, { status });
  Object.defineProperties(result, { url: { value: url }, redirected: { value: redirected } });
  return result;
}
afterEach(() => { vi.useRealTimers(); });
describe('bounded Studio save transport', () => {
  it('sends captured fields and follows only the expected same-origin Studio redirect', async () => {
    const body = new FormData(); body.set('title', 'Controlled QA');
    const transport = vi.fn<typeof fetch>(async () => response(200));
    expect(await submitStudioForm(action, body, 'content', transport)).toBe('https://studio.palmarghe.com/studio/?section=content');
    expect(transport).toHaveBeenCalledWith(action, expect.objectContaining({ method: 'POST', body, credentials: 'same-origin', signal: expect.any(AbortSignal) }));
    expect(body.get('title')).toBe('Controlled QA');
  });
  it.each([[400, 'validation'], [422, 'validation'], [401, 'authentication'], [403, 'permission'], [409, 'conflict'], [500, 'server'], [503, 'server']] as const)('classifies HTTP%s without reflecting a server body', async (status, reason) => {
    await expect(submitStudioForm(action, new FormData(), 'content', async () => response(status))).rejects.toMatchObject({ reason });
  });
  it.each([
    ['https://attacker.example/studio/?section=content', true],
    ['https://studio.palmarghe.com/account/', true],
    ['https://studio.palmarghe.com/studio/?section=media', true],
    ['https://studio.palmarghe.com/studio/?section=content', false],
    ['', false],
  ])('does not treat an unexpected 200 as a confirmed save: %s', async (url, redirected) => {
    await expect(submitStudioForm(action, new FormData(), 'content', async () => response(200, String(url), Boolean(redirected)))).rejects.toMatchObject({ reason: 'response' });
  });
  it('accepts the editor-panel media redirect', async () => {
    const destination = 'https://studio.palmarghe.com/studio/?panel=editor&section=media';
    expect(await submitStudioForm(action, new FormData(), 'media', async () => response(200, destination))).toBe(destination);
  });
  it('reports a connection failure without leaking internal transport details', async () => {
    await expect(submitStudioForm(action, new FormData(), 'content', async () => { throw new Error('private internal detail'); })).rejects.toMatchObject({ reason: 'network' });
    expect(studioSaveMessage(new Error('private internal detail'))).not.toContain('private internal');
  });
  it('aborts a hung request, distinguishes uncertain outcome, and clears its timer', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const transport: typeof fetch = async (_, options) => new Promise((_, reject) => {
      signal = options?.signal ?? undefined;
      signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    const result = expect(submitStudioForm(action, new FormData(), 'content', transport)).rejects.toMatchObject({ reason: 'timeout' });
    await vi.advanceTimersByTimeAsync(STUDIO_SAVE_TIMEOUT_MS);
    await result;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    expect(studioSaveMessage(new StudioSaveError('timeout'))).toContain('sonucu doğrulanamadı');
  });
});

describe('read-only image preflight transport',()=>{
  it('tells users to check the library before retrying an uncertain upload',async()=>{
    const pending=submitStudioForm(action,new FormData(),'media',async()=>Response.json({error:'upload_uncertain',detail:'PRIVATE'},{status:503}));
    try {await pending;throw new Error('Expected rejection');}
    catch(error){expect(error).toBeInstanceOf(StudioSaveError);expect(studioSaveMessage(error,true)).toContain('Yeniden yüklemeden önce');expect(studioSaveMessage(error,true)).not.toContain('PRIVATE');}
  });
  it('requests validation and accepts bounded decoded dimensions',async()=>{
    const body=new FormData();const transport=vi.fn<typeof fetch>(async()=>Response.json({validated:true,width:1200,height:1600,bytes:50000}));
    expect(await validateStudioImage(action,body,transport)).toMatchObject({width:1200,height:1600});
    expect(body.get('operation')).toBe('validate');
    expect(transport).toHaveBeenCalledWith(action,expect.objectContaining({credentials:'same-origin',signal:expect.any(AbortSignal)}));
  });
  it.each([{}, {validated:true,width:50000,height:1,bytes:20}, {validated:true,width:1,height:1,bytes:-1}])('rejects invalid success payloads',async data=>{
    await expect(validateStudioImage(action,new FormData(),async()=>Response.json(data))).rejects.toMatchObject({reason:'response'});
  });
  it('uses only whitelisted field explanations, never server text',async()=>{
    try {await validateStudioImage(action,new FormData(),async()=>Response.json({error:'image_dimensions',detail:'PRIVATE'},{status:400}));}
    catch(error){expect(studioSaveMessage(error,true)).toContain('4096');expect(studioSaveMessage(error,true)).not.toContain('PRIVATE');}
    try {await validateStudioImage(action,new FormData(),async()=>Response.json({error:'PRIVATE'},{status:400}));}
    catch(error){expect(studioSaveMessage(error,true)).not.toContain('PRIVATE');}
  });
});
