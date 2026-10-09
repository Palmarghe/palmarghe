import {test,expect} from '@playwright/test';
const origin='http://127.0.0.1:4322',admin='00000000-0000-4000-8000-100000000001';

test('indexes avoid inactive interaction downloads while article and account actions still persist',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 const stamp=Date.now(),title='Interaction payload QA '+stamp,slug='interaction-payload-'+stamp;
 expect((await context.request.post('/api/studio/',{headers:{origin},form:{entity:'content',title,slug,locale:'tr',type:'article',status:'published',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Local interaction payload verification.'}]}]})}})).ok()).toBe(true);
 const item=(await (await context.request.get('/api/search/?q='+encodeURIComponent(title))).json()).results.find((entry:any)=>entry.slug===slug);expect(item?.id).toBeTruthy();
 const requests=new Set<string>();page.on('request',request=>{if(request.resourceType()==='script')requests.add(new URL(request.url()).pathname);});
 const interactions=['/scripts/comments.js','/scripts/engagement.js','/scripts/library.js'];
 try{
  for(const path of ['/','/en/','/archive/','/en/archive/','/ai/','/about/','/search/?q=Interaction']){
   requests.clear();await page.goto(path);await expect(page.locator('main')).toBeVisible();
   for(const script of interactions)expect(requests.has(script),path+' must not download '+script).toBe(false);
  }
  requests.clear();await page.goto('/'+slug+'/');await expect(page.locator('.comments-section')).toBeVisible();
  for(const script of interactions)expect(requests.has(script),'article requires '+script).toBe(true);
  await page.locator('[data-like]').click();await expect(page.locator('[data-like]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-bookmark]').click();await expect(page.locator('[data-bookmark]')).toHaveAttribute('aria-pressed','true');
  await page.reload();await expect(page.locator('[data-like]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-bookmark]')).toHaveAttribute('aria-pressed','true');
  requests.clear();await page.goto('/account/');expect(requests.has('/scripts/library.js')).toBe(true);expect(requests.has('/scripts/comments.js')).toBe(false);expect(requests.has('/scripts/engagement.js')).toBe(false);
 }finally{expect((await context.request.post('/api/studio/',{headers:{origin},form:{entity:'content',operation:'delete',id:item.id}})).ok()).toBe(true);}
});

test('authorized Studio header entry stays on one line at intermediate desktop widths',async({page,context})=>{
 for(const actor of [admin,'00000000-0000-4000-8000-100000000002']){
  await context.addCookies([{name:'pg_mock_user',value:actor,url:origin}]);
  for(const path of ['/','/en/']){
   await page.goto(path);await page.evaluate(()=>document.fonts.ready);
   for(const width of [901,921,1024,1100])for(const theme of ['dark','light','aurora']){
    await page.setViewportSize({width,height:900});await page.evaluate(value=>document.body.dataset.theme=value,theme);
    const geometry=await page.locator('.head-actions .studio-entry-link').evaluate(link=>{const box=link.getBoundingClientRect(),text=document.createRange();text.selectNodeContents(link);const rows=new Set([...text.getClientRects()].filter(rect=>rect.width>0&&rect.height>0).map(rect=>Math.round(rect.top*10)));return {rows:rows.size,left:box.left,right:box.right,width:innerWidth};});
    expect(geometry.rows).toBe(1);expect(geometry.left).toBeGreaterThanOrEqual(0);expect(geometry.right).toBeLessThanOrEqual(geometry.width);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   }
  }
 }
 await page.setViewportSize({width:921,height:900});await page.goto('/');
 for(let count=0;count<30&&!await page.locator('.head-actions .studio-entry-link').evaluate(link=>link===document.activeElement);count++)await page.keyboard.press('Tab');
 await expect(page.locator('.head-actions .studio-entry-link')).toBeFocused();
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000003',url:origin}]);await page.goto('/');await expect(page.locator('.studio-entry-link')).toHaveCount(0);
});
