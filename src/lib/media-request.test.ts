import { afterEach, describe, expect, it, vi } from 'vitest';
import { claimMediaUpload, mediaFormData, MAX_MEDIA_REQUEST_BYTES, MEDIA_BODY_TIMEOUT_MS } from './media-request';

afterEach(()=>vi.useRealTimers());
describe('bounded multipart intake',()=>{
  it('parses actual multipart fields',async()=>{
    const form=new FormData();form.set('alt_tr','Deneme');
    expect((await mediaFormData(new Request('https://example.test',{method:'POST',body:form}))).get('alt_tr')).toBe('Deneme');
  });
  it('rejects non multipart and oversized declared bodies',async()=>{
    await expect(mediaFormData(new Request('https://example.test',{method:'POST',body:'text'}))).rejects.toMatchObject({status:400});
    await expect(mediaFormData(new Request('https://example.test',{method:'POST',body:'x',headers:{'content-type':'multipart/form-data; boundary=x','content-length':String(MAX_MEDIA_REQUEST_BYTES+1)}}))).rejects.toMatchObject({status:413});
  });
  it('bounds actual streamed bytes without trusting content length',async()=>{
    const cancel=vi.fn();
    const body=new ReadableStream<Uint8Array>({start(controller){controller.enqueue(new Uint8Array(MAX_MEDIA_REQUEST_BYTES+1));},cancel});
    const request=new Request('https://example.test',{method:'POST',body,duplex:'half',headers:{'content-type':'multipart/form-data; boundary=x'}} as RequestInit);
    await expect(mediaFormData(request)).rejects.toMatchObject({status:413});expect(cancel).toHaveBeenCalledOnce();
  });
  it('cancels an idle stream on the bounded deadline',async()=>{
    vi.useFakeTimers();const cancel=vi.fn();
    const body=new ReadableStream<Uint8Array>({cancel});
    const request=new Request('https://example.test',{method:'POST',body,duplex:'half',headers:{'content-type':'multipart/form-data; boundary=x'}} as RequestInit);
    const assertion=expect(mediaFormData(request)).rejects.toMatchObject({status:408});
    await vi.advanceTimersByTimeAsync(MEDIA_BODY_TIMEOUT_MS);await assertion;expect(cancel).toHaveBeenCalledOnce();
  });
  it('prevents simultaneous buffered uploads and ignores stale releases',()=>{
    const release=claimMediaUpload()!;expect(release).toBeTypeOf('function');expect(claimMediaUpload()).toBeNull();
    release();const next=claimMediaUpload()!;release();expect(claimMediaUpload()).toBeNull();next();
    const final=claimMediaUpload()!;expect(final).toBeTypeOf('function');final();
  });
});
