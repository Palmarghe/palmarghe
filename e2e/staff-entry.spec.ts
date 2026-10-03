import {test,expect} from '@playwright/test';
test('article editing portal is staff-only and opens the matching Studio content',async({page,context})=>{
 const origin='http://127.0.0.1:4322';
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 const slug=`edit-portal-${Date.now()}`;
 const response=await page.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'content',title:'Editing portal QA',slug,locale:'tr',type:'article',status:'published',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Portal QA.'}]}]})}});
 expect(response.ok()).toBeTruthy();
 for(const [role,id] of [['anonymous',''],['member','00000000-0000-4000-8000-100000000003'],['editor','00000000-0000-4000-8000-100000000002'],['admin','00000000-0000-4000-8000-100000000001']]){
  await context.clearCookies();if(id)await context.addCookies([{name:'pg_mock_user',value:id,url:origin}]);
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await page.goto(`/${slug}/`);
   const link=page.locator('.content-edit-link');
   await expect(link).toHaveCount(['admin','editor'].includes(role)?1:0);
   if(['admin','editor'].includes(role)){
    const href=await link.getAttribute('href');const destination=new URL(href!);
    expect(destination.origin).toBe('https://studio.palmarghe.com');
    expect(destination.searchParams.get('section')).toBe('content');
    await page.goto(`/studio/${destination.search}`);
    await expect(page.locator('.content-editor-form input[name="title"]')).toHaveValue('Editing portal QA');
   }
  }
 }
});
test('Studio header entry is restricted to admin/editor at desktop and mobile sizes',async({page,context})=>{
 for(const [role,id] of [['anonymous',''],['member','00000000-0000-4000-8000-100000000003'],['editor','00000000-0000-4000-8000-100000000002'],['admin','00000000-0000-4000-8000-100000000001']]){
  await context.clearCookies();
  if(id)await context.addCookies([{name:'pg_mock_user',value:id,url:'http://127.0.0.1:4322'}]);
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await page.goto('/');
   expect(await page.locator('.studio-entry-link').count()).toBe(['admin','editor'].includes(role)?2:0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.goto('/account/');
  await expect(page.locator('.account-content a[href^="https://studio.palmarghe.com/"]')).toHaveCount(0);
 }
});
