import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

test('phone archive keeps discovery above the fold with an enabled illustrated header advertisement',async({page,context})=>{
 const origin='http://127.0.0.1:4322';
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 await page.goto('/studio/?section=advertising');
 const original=await page.locator('.advertising-form').evaluate(form=>Object.fromEntries(new FormData(form as HTMLFormElement)) as Record<string,string>);
 const nonce=Date.now(),title=`Archive advertising QA ${nonce}`,slug=`archive-ad-qa-${nonce}`;
 let mediaId:string|undefined,contentId:string|undefined;
 try{
  const saved=await context.request.post('/api/studio/',{headers:{origin},form:{entity:'advertising',header_mode:'manual',header_visible:'on',header_device:'all',header_scope:'all',header_title:'Palmarghe',header_description:'Palmarghe',header_cta:'Palmarghe',header_url:'https://palmarghe.com/',header_image_url:'/ads/test-header-neutral.svg',article_mode:'placeholder',footer_mode:'placeholder'}});
  expect(saved.ok()).toBe(true);expect(saved.url()).not.toContain('error=');
  const uploaded=await context.request.post('/api/media/',{headers:{origin},multipart:{file:{name:`archive-ad-${nonce}.webp`,mimeType:'image/webp',buffer:await readFile('public/visuals/hero-glass.webp')},alt_tr:title}});
  expect(uploaded.ok()).toBe(true);
  await page.goto('/studio/?section=media');
  // Locate this QA upload by its unique, visible alt input rather than a pre-existing row.
  const ownMedia=page.locator('.entry-card').filter({has:page.locator(`input[value="${title}"]`)});
  mediaId=(await ownMedia.locator('input[name=id]').first().inputValue());
  const created=await context.request.post('/api/studio/',{headers:{origin},form:{entity:'content',title,slug,type:'article',locale:'tr',status:'published',cover_media_id:mediaId,body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Controlled local advertisement layout fixture.'}]}]})}});
  expect(created.ok()).toBe(true);
  const data=await (await context.request.get('/api/search/?q='+encodeURIComponent(title))).json();
  contentId=data.results.find((entry:any)=>entry.slug===slug)?.id;expect(contentId).toBeTruthy();
  for(const width of [320,390]){
   await page.setViewportSize({width,height:844});await page.goto('/archive/');
   await expect(page.locator('[data-promotion-placement=header]')).toBeVisible();
   await expect(page.locator('.entry-card').first()).toHaveAttribute('href',`/${slug}/`);
   await expect.poll(()=>page.locator('.entry-card img').first().evaluate(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0)).toBe(true);
   for(const theme of ['dark','light','aurora']){
    await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
    expect(await page.locator('.entry-card h3').first().evaluate(node=>node.getBoundingClientRect().top)).toBeLessThan(844);
    expect(await page.locator('.archive-filters').evaluate(node=>node.getBoundingClientRect().height)).toBeLessThanOrEqual(250);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    const audit=await new AxeBuilder({page}).include('.archive-section').analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
   }
  }
 }finally{
  if(contentId)expect((await context.request.post('/api/studio/',{headers:{origin},form:{entity:'content',operation:'delete',id:contentId}})).ok()).toBe(true);
  if(mediaId)expect((await context.request.post('/api/media/manage/',{headers:{origin},form:{id:mediaId,operation:'delete'}})).ok()).toBe(true);
  expect((await context.request.post('/api/studio/',{headers:{origin},form:original})).ok()).toBe(true);
 }
});
