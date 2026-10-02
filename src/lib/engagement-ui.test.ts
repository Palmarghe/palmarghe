import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync('public/scripts/engagement.js','utf8');
async function render(lang: string, metrics: unknown, ok = true, reject = false) {
  const attributes = new Map<string,string>();
  const stat = { textContent:'Readership', setAttribute:(k:string,v:string)=>attributes.set(k,v), removeAttribute:(k:string)=>attributes.delete(k) };
  const fetch = vi.fn(() => reject ? Promise.reject(new Error('Network unavailable')) : Promise.resolve({ ok, json:async()=>metrics }));
  const clearTimeout = vi.fn();
  let abort!: () => void;
  runInNewContext(script, {
    document:{ documentElement:{lang,dataset:{}}, querySelector:()=>({querySelector:()=>stat}), querySelectorAll:()=>[] },
    navigator:{webdriver:true,userAgent:'QA'}, location:{pathname:'/fm/example/',search:''},
    fetch, Intl, AbortController, setTimeout:(callback:()=>void)=>{abort=callback; return 1;}, clearTimeout,
  });
  expect(stat.textContent).toBe(lang==='en' ? 'Loading readership…' : 'Okunma bilgisi yükleniyor…');
  await new Promise(resolve=>setImmediate(resolve));
  return {stat,attributes,fetch,clearTimeout,abort};
}
describe('readership reservation feedback', () => {
  it('updates the existing reserved node with real localized metrics', async () => {
    for (const lang of ['tr','en']) {
      const result=await render(lang,{reads:1234,shares:2});
      expect(result.stat.textContent).toBe(lang==='en' ? '1,234 reads · 2 shares' : '1.234 okunma · 2 paylaşım');
      expect(result.attributes.has('aria-busy')).toBe(false);
      expect(result.clearTimeout).toHaveBeenCalledWith(1);
      expect(result.fetch).toHaveBeenCalledTimes(1); // Automated checks never emit a read write.
    }
  });
  it('reports HTTP and network failure without inventing zero counts', async () => {
    expect((await render('en',null,false)).stat.textContent).toBe('Readership unavailable');
    expect((await render('tr',null,true,true)).stat.textContent).toBe('Okunma bilgisi alınamadı');
  });
  it('rejects malformed and negative metric values', async () => {
    for (const metrics of [{reads:'12',shares:0},{reads:-1,shares:0},{reads:1,shares:Infinity},null]) {
      expect((await render('en',metrics)).stat.textContent).toBe('Readership unavailable');
    }
  });
  it('bounds the request with an abort signal', async () => {
    const result=await render('en',{reads:1,shares:0});
    const signal=(result.fetch.mock.calls[0] as unknown as [string,{signal:AbortSignal}])[1].signal;
    expect(signal.aborted).toBe(false);
    result.abort();
    expect(signal.aborted).toBe(true);
  });
});
