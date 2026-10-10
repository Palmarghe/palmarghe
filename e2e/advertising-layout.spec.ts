import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('sponsor cards share public alignment, readable themed copy and no hidden space',async({page,context})=>{
 test.setTimeout(120000);
 const origin='http://127.0.0.1:4322';await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 await page.goto('/studio/?section=advertising');const original=await page.locator('.advertising-form').evaluate(form=>Object.fromEntries(new FormData(form as HTMLFormElement)) as Record<string,string>);
 const form:Record<string,string>={entity:'advertising'};
 for(const placement of ['header','article','footer'])Object.assign(form,{[placement+'_mode']:'manual',[placement+'_visible']:'on',[placement+'_device']:'all',[placement+'_scope']:'all',[placement+'_title']:'Palmarghe partner',[placement+'_description']:'A calm space for creative work.',[placement+'_cta']:'Explore',[placement+'_url']:'https://palmarghe.com/',[placement+'_image_url']:'/ads/test-'+placement+'-neutral.svg'});
 try{
  await page.goto('/');for(const theme of ['dark','light','aurora']){await page.evaluate(theme=>document.body.dataset.theme=theme,theme);const audit=await new AxeBuilder({page}).include('.promotion-slot').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']).analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);}
  const saved=await context.request.post('/api/studio/',{headers:{origin},form});expect(saved.ok()).toBe(true);expect(saved.url()).not.toContain('error=');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});await page.goto('/');await expect(page.locator('.promotion-slot')).toHaveCount(3);
   for(const theme of ['dark','light','aurora']){
    await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
    const boxes=await page.locator('.promotion-slot').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect();const shell=document.querySelector('.site-header')!.getBoundingClientRect();const text=node.querySelector('.promotion-copy')!.getBoundingClientRect();const image=node.querySelector('.promotion-image')!.getBoundingClientRect();return {left:box.left,right:box.right,height:box.height,shellLeft:shell.left,shellRight:shell.right,textLeft:text.left,textRight:text.right,imageLeft:image.left,imageRight:image.right,imageWidth:image.width};}));
    for(const box of boxes){expect(Math.abs(box.left-box.shellLeft)).toBeLessThan(1);expect(Math.abs(box.right-box.shellRight)).toBeLessThan(1);expect(box.imageRight).toBeLessThanOrEqual(box.textLeft);expect(box.imageWidth).toBe(width<=600?56:88);expect(box.height,JSON.stringify({width,theme,boxes})).toBeLessThan(170);}
    expect(Math.max(...boxes.map(box=>box.height))-Math.min(...boxes.map(box=>box.height))).toBeLessThan(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    const audit=await new AxeBuilder({page}).include('.promotion-slot').include('.site-footer').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']).analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
   }
  }
  await page.screenshot({path:'test-results/partner-layout-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/partner-layout-phone.png',fullPage:true});
  form.header_title='A longer partner title that must stay readable on a narrow phone';form.header_description='An informative description that wraps without covering the artwork or leaving the visible text outside the card.';delete form.header_image_url;
  expect((await context.request.post('/api/studio/',{headers:{origin},form})).ok()).toBe(true);await page.goto('/en/');await expect(page.locator('[data-promotion-placement=header] .promotion-image')).toHaveCount(0);await expect(page.locator('[data-promotion-placement=header] strong')).toHaveText(form.header_title);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);await expect(page.locator('.footer-discovery a[href="/en/rss.xml"]')).toBeVisible();expect((await context.request.get('/en/rss.xml')).ok()).toBe(true);
  for(const placement of ['header','article','footer'])delete form[placement+'_visible'];
  expect((await context.request.post('/api/studio/',{headers:{origin},form})).ok()).toBe(true);await page.goto('/');await expect(page.locator('.promotion-slot')).toHaveCount(0);await expect(page.locator('.footer-discovery')).toBeVisible();
  for(const href of ['/archive/','/collections/','/rss.xml'])await expect(page.locator('.footer-discovery a[href="'+href+'"]')).toBeVisible();
  expect((await context.request.get('/rss.xml')).ok()).toBe(true);
  for(const path of ['/','/search/?q=Digital','/archive/']){await page.goto(path);await expect(page.locator('.footer-discovery h2')).toBeVisible();}
 }finally{expect((await context.request.post('/api/studio/',{headers:{origin},form:original})).ok()).toBe(true);}
});

test('Studio ad preview mirrors theme-aware cards across phone, tablet and desktop without saving',async({page,context})=>{
 test.setTimeout(60000);await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:'http://127.0.0.1:4322'}]);
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/studio/?section=advertising');
  await page.locator('[name=header_image_url]').fill('/ads/test-header-neutral.svg');await page.locator('[name=header_title]').fill('Unsaved preview title');
  const card=page.locator('[data-preview-placement=header]');await expect(card.locator('strong')).toHaveText('Unsaved preview title');await expect(card.locator('img')).toBeVisible();
  if(width===1440){const previewBox=await card.boundingBox(),modeBox=await page.locator('[name=header_mode]').boundingBox();expect(previewBox!.y).toBeLessThan(modeBox!.y+140);}
  for(const theme of ['dark','light','aurora']){
   await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
   const geometry=await card.evaluate(node=>{const copy=node.querySelector('.advertising-preview-copy')!,art=node.querySelector('img')!;const text=copy.getBoundingClientRect(),image=art.getBoundingClientRect();return{left:text.left,imageRight:image.right,imageWidth:image.width,background:getComputedStyle(node).backgroundImage,color:getComputedStyle(node).color,bodyColor:getComputedStyle(document.body).color};});
   expect(geometry.imageRight).toBeLessThanOrEqual(geometry.left);expect(geometry.background).toBe('none');expect(geometry.color).toBe(geometry.bodyColor);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   const audit=await new AxeBuilder({page}).include('[data-ad-preview]').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']).analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
  }
  await page.locator('[name=header_mode]').selectOption('google');await expect(card.locator('strong')).toHaveText('Google AdSense');await expect(card.locator('img')).toBeHidden();await page.locator('[name=header_mode]').selectOption('placeholder');
  await page.locator('[name=header_visible]').uncheck();await expect(card).toBeHidden();await page.locator('[name=header_visible]').check();await expect(card).toBeVisible();
  await page.locator('[name=header_image_url]').fill('');await expect(card.locator('img')).toBeHidden();await expect(card.locator('strong')).toBeVisible();
 }
 // No form is submitted: changing a design preview must not publish settings.
});

test('ad editor shortcuts open the right panel and preserve closed-panel fields on save',async({page,context})=>{
 const origin='http://127.0.0.1:4322';await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 await page.goto('/studio/?section=advertising#ad-footer');
 await expect(page.locator('#ad-footer')).toHaveAttribute('open','');await expect(page.locator('#ad-header')).not.toHaveAttribute('open','');
 const original=await page.locator('.advertising-form').evaluate(form=>Object.fromEntries(new FormData(form as HTMLFormElement)) as Record<string,string>);
 try{
  await page.locator('[data-ad-jump=ad-article]').click();await expect(page.locator('[name=article_visible]')).toBeFocused();await expect(page.locator('#ad-article')).toHaveAttribute('open','');await expect(page.locator('#ad-footer')).not.toHaveAttribute('open','');
  await page.locator('[name=article_title]').fill('Saved sponsor card');await page.locator('[name=article_mode]').selectOption('placeholder');
  await page.getByRole('button',{name:'Reklam ayarlarını kaydet'}).click();await expect(page).toHaveURL(/section=advertising$/);
  await page.locator('[data-ad-jump=ad-article]').click();await expect(page.locator('[name=article_title]')).toHaveValue('Saved sponsor card');
  const saved=await page.locator('.advertising-form').evaluate(form=>Object.fromEntries(new FormData(form as HTMLFormElement)) as Record<string,string>);
  for(const [key,value] of Object.entries(original))if(key.startsWith('header_')||key.startsWith('footer_'))expect(saved[key],key).toBe(value);
 }finally{expect((await context.request.post('/api/studio/',{headers:{origin},form:original})).ok()).toBe(true);}
});
