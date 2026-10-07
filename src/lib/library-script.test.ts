import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe,it,expect,vi} from 'vitest';
const source=readFileSync('public/scripts/library.js','utf8');
function setup(status=200,lang='tr'){
  let click:()=>Promise<void>=async()=>{};
  const attrs=new Map<string,string>();
  const feedback={dataset:{},className:'',textContent:'',setAttribute:vi.fn()};
  const button={dataset:{bookmark:'qa',libraryViewer:'00000000-0000-4000-8000-000000000003'},getAttribute:(name:string)=>attrs.get(name)??null,disabled:false,textContent:'Save',parentElement:{querySelector:()=>feedback},after:vi.fn(),removeAttribute:(name:string)=>attrs.delete(name),setAttribute:(name:string,value:string)=>attrs.set(name,value),addEventListener:(_name:string,callback:()=>Promise<void>)=>{click=callback;}};
  const assign=vi.fn();const fetch=vi.fn(async(_url:string,_options:RequestInit)=>({status,ok:status===200,json:async()=>({saved:true,viewer_id:'00000000-0000-4000-8000-000000000003'})}));
  runInNewContext(source,{document:{documentElement:{lang},createElement:()=>feedback,querySelectorAll:(selector:string)=>selector==='[data-bookmark]'?[button]:[]},fetch,AbortController,setTimeout,clearTimeout,location:{assign},window:{location:{assign}}});
  return {button,click:()=>click(),attrs,fetch,assign,feedback};
}
describe('actual public reading-list script',()=>{
  it('runs plain JavaScript and confirms successful saved state',async()=>{const qa=setup();await qa.click();expect(qa.attrs.get('aria-pressed')).toBe('true');expect(qa.button.textContent).toBe('Okuma listesinde');expect(qa.button.disabled).toBe(false);});
  it('does not report an HTTP failure as saved',async()=>{const qa=setup(503);await qa.click();expect(qa.attrs.has('aria-pressed')).toBe(false);expect(qa.feedback.textContent).toContain('Sonuç doğrulanamadı');expect(qa.button.disabled).toBe(false);});
  it('retries the original desired state after an uncertain response',async()=>{const qa=setup();qa.fetch.mockImplementationOnce(async()=>{throw new Error('lost acknowledgement');});await qa.click();expect(qa.attrs.has('aria-pressed')).toBe(false);await qa.click();const bodies=qa.fetch.mock.calls.map(call=>JSON.parse((call as unknown as [string,{body:string}])[1].body));expect(bodies[0]).toEqual(bodies[1]);expect(bodies[1].desired).toBe(true);expect(qa.attrs.get('aria-pressed')).toBe('true');});
  it('rejects another session acknowledgement without reporting success',async()=>{const qa=setup();qa.fetch.mockResolvedValueOnce({status:200,ok:true,json:async()=>({saved:true,viewer_id:'00000000-0000-4000-8000-000000000004'})});await qa.click();expect(qa.attrs.has('aria-pressed')).toBe(false);expect(qa.feedback.textContent).toContain('Sonuç doğrulanamadı');});
  it('clears the pending state only after confirmation so the next click can remove it',async()=>{const qa=setup();await qa.click();qa.fetch.mockResolvedValueOnce({status:200,ok:true,json:async()=>({saved:false,viewer_id:qa.button.dataset.libraryViewer})});await qa.click();expect(JSON.parse(qa.fetch.mock.calls[1][1].body as string).desired).toBe(false);expect(qa.attrs.get('aria-pressed')).toBe('false');});
  it('bounds JSON body consumption and restores the control after headers arrive',async()=>{vi.useFakeTimers();try{const qa=setup();qa.fetch.mockImplementationOnce(async(_url,options)=>({status:200,ok:true,json:()=>new Promise((_resolve,reject)=>options.signal!.addEventListener('abort',()=>reject(new Error('body deadline'))))}));const pending=qa.click();await vi.advanceTimersByTimeAsync(12001);await pending;expect(qa.button.disabled).toBe(false);expect(qa.attrs.has('aria-pressed')).toBe(false);expect(qa.feedback.textContent).toContain('Sonuç doğrulanamadı');}finally{vi.useRealTimers();}});
  it('keeps English sign-in navigation localized',async()=>{const qa=setup(401,'en');await qa.click();expect(qa.assign).toHaveBeenCalledWith('/en/account/');});
});
