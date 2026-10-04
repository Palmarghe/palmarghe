import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe,it,expect,vi} from 'vitest';
const source=readFileSync('public/scripts/library.js','utf8');
function setup(status=200,lang='tr'){
  let click:()=>Promise<void>=async()=>{};
  const attrs=new Map<string,string>();
  const feedback={dataset:{},className:'',textContent:'',setAttribute:vi.fn()};
  const button={dataset:{bookmark:'qa'},disabled:false,textContent:'Save',parentElement:{querySelector:()=>feedback},after:vi.fn(),removeAttribute:(name:string)=>attrs.delete(name),setAttribute:(name:string,value:string)=>attrs.set(name,value),addEventListener:(_name:string,callback:()=>Promise<void>)=>{click=callback;}};
  const assign=vi.fn();const fetch=vi.fn(async()=>({status,ok:status===200,json:async()=>({saved:true})}));
  runInNewContext(source,{document:{documentElement:{lang},createElement:()=>feedback,querySelectorAll:(selector:string)=>selector==='[data-bookmark]'?[button]:[]},fetch,AbortSignal,location:{assign},window:{location:{assign}}});
  return {button,click:()=>click(),attrs,fetch,assign,feedback};
}
describe('actual public reading-list script',()=>{
  it('runs plain JavaScript and confirms successful saved state',async()=>{const qa=setup();await qa.click();expect(qa.attrs.get('aria-pressed')).toBe('true');expect(qa.button.textContent).toBe('Okuma listesinde');expect(qa.button.disabled).toBe(false);});
  it('does not report an HTTP failure as saved',async()=>{const qa=setup(503);await qa.click();expect(qa.attrs.has('aria-pressed')).toBe(false);expect(qa.feedback.textContent).toContain('Kaydedilemedi');expect(qa.button.disabled).toBe(false);});
  it('keeps English sign-in navigation localized',async()=>{const qa=setup(401,'en');await qa.click();expect(qa.assign).toHaveBeenCalledWith('/en/account/');});
});
