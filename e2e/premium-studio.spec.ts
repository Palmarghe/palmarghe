import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:4322';
const admin='00000000-0000-4000-8000-100000000001',editor='00000000-0000-4000-8000-100000000002',member='00000000-0000-4000-8000-100000000003';
test('staff command palette is keyboard accessible, responsive and finds saved records',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 const title='Palette QA '+Date.now();const saved=await context.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'content',title,slug:'palette-qa-'+Date.now(),locale:'tr',type:'article',status:'draft',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Local fixture'}]}]})}});expect(saved.ok()).toBe(true);
 await page.goto('/studio/');const opener=page.locator('[data-command-open]');await opener.focus();await page.keyboard.press('Control+k');const dialog=page.getByRole('dialog',{name:'Studio komut paleti'});await expect(dialog).toBeVisible();
 const input=dialog.locator('input');await expect(input).toBeFocused();await input.fill(title);const result=dialog.getByRole('link',{name:new RegExp(title)});await expect(result).toBeVisible();await expect(result).toHaveAttribute('href',/section=content&edit=/);
 await input.press('Enter');await expect(page).toHaveURL(/section=content&edit=/);await expect(page.locator('[name=title]')).toHaveValue(title);
 for(const width of [320,1440])for(const theme of ['dark','light']){await page.setViewportSize({width,height:844});await page.evaluate(t=>document.body.dataset.theme=t,theme);await opener.click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const findings=await new AxeBuilder({page}).include('[data-command-dialog]').analyze();expect(findings.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);await page.keyboard.press('Escape');await expect(opener).toBeFocused();}
});
test('command discovery rejects visitors and members; editor palette omits admin-only sections',async({browser})=>{
 for(const identity of [null,member,editor]){const context=await browser.newContext();if(identity)await context.addCookies([{name:'pg_mock_user',value:identity,url:origin}]);const page=await context.newPage();const response=await context.request.get(origin+'/api/studio-discovery/?q=Yapay');expect(response.status()).toBe(identity===null?401:identity===member?403:200);if(identity===editor){await page.goto(origin+'/studio/?panel=editor');await page.locator('[data-command-open]').click();const dialog=page.getByRole('dialog',{name:'Studio komut paleti'});await expect(dialog.getByRole('link',{name:'Üyeler',exact:false})).toHaveCount(0);await expect(dialog.getByRole('link',{name:'Ayarlar',exact:false})).toHaveCount(0);await expect(dialog.getByRole('link',{name:'Medya',exact:false})).toHaveCount(1);}await context.close();}
});

test('homepage preview selects fields, supports tablet and reports reversible changes',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);
 await page.goto('/studio/?section=homepage');
 const title=page.locator('[name=hero_title_tr]');const original=await title.inputValue();
 await title.fill('Premium preview local QA');
 await expect(page.locator('[data-preview-title]')).toHaveText('Premium preview local QA');
 await expect(page.locator('.studio-change-summary')).toContainText('alan değişti');
 await page.locator('[data-preview-title]').click();await expect(title).toBeFocused();
 const preview=page.locator('[data-homepage-preview]');
 await preview.locator('xpath=preceding-sibling::*[1]').getByRole('button',{name:'Tablet',exact:true}).click();
 await expect(preview).toHaveAttribute('data-preview-device','tablet');
 await page.getByRole('button',{name:'Değişiklikleri geri al',exact:true}).click();
 await expect(title).toHaveValue(original);await expect(page.locator('.studio-change-summary')).toHaveText('');
});

test('health panel reports actual checks and remains admin-only',async({browser})=>{
 for(const identity of [null,member,editor,admin]){
  const context=await browser.newContext();if(identity)await context.addCookies([{name:'pg_mock_user',value:identity,url:origin}]);
  const result=await context.request.get(origin+'/api/studio-health/');
  expect(result.status()).toBe(identity===null?401:identity===admin?200:403);
  if(identity===admin){const data=await result.json();expect(data.services.database).toBe('ok');expect(data.database_ms).toBeGreaterThanOrEqual(0);expect(data.checked_at).toBeTruthy();expect(JSON.stringify(data)).not.toContain(admin);const page=await context.newPage();await page.goto(origin+'/studio/?section=health');await expect(page.locator('[data-health-details]')).toContainText('Veritabanı');await expect(page.locator('[data-health-status]')).toContainText('Son 50');}
  await context.close();
 }
});
