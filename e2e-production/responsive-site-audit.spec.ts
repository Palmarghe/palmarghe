import {test,expect} from '@playwright/test';

test('all live sitemap pages retain bounded forms and headings on phone, tablet and desktop',async({page,request})=>{
 test.setTimeout(300000);
 const sitemap=await request.get('/sitemap.xml');expect(sitemap.ok()).toBe(true);
 const routes=[...new Set([...((await sitemap.text()).matchAll(/<loc>(https:\/\/palmarghe\.com[^<]*)<\/loc>/g))].map(([,url])=>new URL(url).pathname))];expect(routes.length).toBeGreaterThan(10);
 const failures:string[]=[];
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   const response=await page.goto(route+'?verify=responsive-audit');expect(response?.ok(),route).toBe(true);
   for(const theme of ['dark','light','aurora']){
    await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
    const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,heading:!!document.querySelector('main h1'),outside:Array.from(document.querySelectorAll('main input:not([type=hidden]),main textarea,main select,main button')).filter(node=>{const rect=node.getBoundingClientRect();return rect.width>0&&(rect.left<0||rect.right>document.documentElement.clientWidth+1)}).map(node=>node.tagName+':'+(node.getAttribute('name')??node.getAttribute('aria-label')??''))}));
    if(result.overflow||!result.heading||result.outside.length)failures.push(JSON.stringify({route,width,theme,...result}));
   }
  }
 }
 expect(failures,failures.join('\n')).toEqual([]);
});
