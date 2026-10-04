import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('independent showcase card saves, renders, hides and preserves publication metadata',async({page,context})=>{
 test.setTimeout(90000);
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:'http://127.0.0.1:4322'}]);
 const origin='http://127.0.0.1:4322';
 const title='Showcase card QA '+Date.now();
 const created=await context.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'content',title,slug:'hero-card-qa-'+Date.now(),locale:'tr',type:'article',status:'published',cover_url:'/visuals/hero-glass.webp',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Local showcase fixture.'}]}]})}});
 expect(created.ok()).toBe(true);
 await page.goto('/studio/?section=homepage');
 const backup=await page.locator('.homepage-editor').evaluate(form=>[...new FormData(form as HTMLFormElement).entries()].map(([name,value])=>[name,String(value)]));
 const originalHeroTitle=await page.locator('[name=hero_title_tr]').inputValue();
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  expect(await page.locator('.hero-card-editor').evaluate(e=>{const box=e.getBoundingClientRect();return [...e.querySelectorAll('input,select')].every(input=>{const r=input.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right;});})).toBe(true);
 }
 const invalid=await context.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'homepage',homepage_section:'preview',preview_width:'999'}});expect(invalid.status()).toBe(400);
 const save=async()=>{const response=page.waitForResponse(r=>r.url().endsWith('/api/studio/')&&r.request().method()==='POST');const navigation=page.waitForEvent('framenavigated',frame=>frame===page.mainFrame());await page.getByRole('button',{name:'Vitrin kartı ayarlarını kaydet',exact:true}).click();expect((await response).status()).toBeLessThan(400);await navigation;await page.waitForLoadState('domcontentloaded');await expect(page.locator('.hero-card-editor')).toBeVisible();};
 try{
  await page.locator('[name=hero_visible]').check();await page.locator('[name=hero_mode]').selectOption('compact');
  await page.locator('[name=preview_visible]').check();
  await page.locator('[name=hero_title_tr]').fill('Bu başka alan kaydedilmemeli');
  await page.locator('[name=preview_content_id]').selectOption({label:title});
  await page.getByLabel('TR kart başlığı',{exact:true}).fill('Sadece vitrin başlığı');
  await page.getByLabel('TR kart üst satırı',{exact:true}).fill('ÖNE ÇIKAN');
  await page.locator('[name=preview_ratio]').selectOption('4/3');
  await page.locator('[name=preview_fit]').selectOption('cover');
  await page.locator('[name=preview_position]').selectOption('left');
  await expect(page.locator('[name=preview_zoom]')).toHaveValue('125');
  await expect.poll(()=>page.locator('[data-card-image]').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const left=await page.locator('[data-card-frame]').screenshot();
  await page.locator('[name=preview_position]').selectOption('right');
  const right=await page.locator('[data-card-frame]').screenshot();
  expect(left.equals(right),'Focus must change the rendered image, not just the selected option').toBe(false);
  await page.locator('[name=preview_position]').selectOption('top');
  await expect(page.locator('[data-card-title]')).toHaveText('Sadece vitrin başlığı');
  await save();
  await expect(page.locator('[name=hero_title_tr]')).toHaveValue(originalHeroTitle);
  await expect(page.getByLabel('TR kart başlığı',{exact:true})).toHaveValue('Sadece vitrin başlığı');
  await page.goto('/');
  const card=page.locator('.hero-preview');await expect(card).toContainText('Sadece vitrin başlığı');await expect(card).toContainText('ÖNE ÇIKAN');
  await expect(card.locator('.hero-card-image-frame')).toHaveCSS('aspect-ratio','4 / 3');await expect(card.locator('img')).toHaveCSS('transform','matrix(1.25, 0, 0, 1.25, 0, 0)');await expect(card.locator('img')).toHaveCSS('object-fit','cover');
  for(const width of [390,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  await card.click();await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
  await page.goto('/studio/?section=homepage');await page.locator('[name=preview_visible]').uncheck();await save();
  await page.goto('/');await expect(page.locator('.hero-preview')).toHaveCount(0);await expect(page.locator('.hero-copy')).toBeVisible();
  await page.goto('/studio/?section=homepage');await page.evaluate(()=>document.body.dataset.theme='light');
  await expect(page.locator('body')).toHaveCSS('color','rgb(32, 29, 39)');
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }finally{
  const form=new URLSearchParams(backup as [string,string][]);
  expect((await context.request.post('/api/studio/',{headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},data:form.toString()})).ok()).toBe(true);
 }
});
