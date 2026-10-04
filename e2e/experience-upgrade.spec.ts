import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:4322';
const admin='00000000-0000-4000-8000-100000000001',member='00000000-0000-4000-8000-100000000003';
test.beforeEach(async({context})=>{await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);});

test('draft recovery is explicit, preserves body after reload and preview does not publish',async({page})=>{
 page.on('dialog',dialog=>dialog.accept());
 await page.goto('/studio/?section=content');const title='Recovery autonomy '+Date.now();
 await page.locator('[name=title]').fill(title);await page.locator('#block-editor .tiptap').fill('Saved in this tab, not published.');
 await expect(page.locator('.editor-recovery')).toContainText('Sekme kopyası korundu');
 await page.getByRole('button',{name:'Yayın önizlemesi',exact:true}).click();
 const preview=page.getByRole('dialog',{name:'Yayın önizlemesi'});await expect(preview).toContainText(title);await expect(preview).toContainText('Saved in this tab');
 await preview.getByRole('button',{name:'Mobil',exact:true}).click();expect(await preview.evaluate(e=>e.getBoundingClientRect().width)).toBeLessThanOrEqual(390);
 await preview.getByRole('button',{name:'Önizlemeyi kapat'}).click();
 await page.reload();await expect(page.locator('[name=title]')).toHaveValue('');
 await page.getByRole('button',{name:'Taslağı geri getir'}).click();await expect(page.locator('[name=title]')).toHaveValue(title);await expect(page.locator('#block-editor .tiptap')).toContainText('Saved in this tab');
 await page.getByRole('button',{name:'Taslak kaydet',exact:true}).click();await expect(page.getByRole('cell',{name:title,exact:true})).toBeVisible();
 expect(await page.evaluate(()=>Object.keys(sessionStorage).filter(key=>key.startsWith('palmarghe-draft:')))).toEqual([]);
 const search=await page.request.get('/api/search/?q='+encodeURIComponent(title));expect((await search.json()).results).toEqual([]);
});

test('Studio image preview, touch focus and undo remain usable in both themes and sizes',async({page})=>{
 test.setTimeout(90000);await page.goto('/studio/?section=homepage');
 const initial=await page.locator('[name=hero_title_tr]').inputValue();await page.locator('[name=hero_title_tr]').fill('Unsaved preview');
 await expect(page.locator('[data-preview-title]')).toHaveText('Unsaved preview');await expect(page.locator('.studio-change-bar')).toContainText('Kaydedilmemiş');
 await page.getByRole('button',{name:'Değişiklikleri geri al',exact:true}).click();await expect(page.locator('[name=hero_title_tr]')).toHaveValue(initial);
 const frame=page.locator('[data-card-frame]');await frame.scrollIntoViewIfNeeded();const box=await frame.boundingBox();expect(box).not.toBeNull();await page.mouse.click(box!.x+box!.width*.8,box!.y+box!.height*.25);
 await expect(page.locator('[name=preview_focus_x]')).toHaveValue('80');await expect(page.locator('[name=preview_focus_y]')).toHaveValue('25');
 await expect(page.locator('[data-card-image]')).toHaveCSS('object-position','80% 25%');
 await page.getByRole('button',{name:'Görseli orijinal kadraja döndür'}).click();await expect(page.locator('[name=preview_zoom]')).toHaveValue('100');
 for(const width of [320,390,1440])for(const theme of ['light','dark']){await page.setViewportSize({width,height:900});await page.evaluate(theme=>document.body.dataset.theme=theme,theme);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 const findings=await new AxeBuilder({page}).include('.admin-main,.admin-main *').analyze();expect(findings.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
});

test('category search includes descendants, excludes drafts and suggests real publications',async({page,context})=>{
 const stamp=Date.now();const title='FM discovery '+stamp;
 for(const [suffix,status,category] of [['match','published','00000000-0000-4000-8000-000000000005'],['outside','published','00000000-0000-4000-8000-000000000002'],['draft','draft','00000000-0000-4000-8000-000000000005']]){const response=await context.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'content',title:title+' '+suffix,slug:'discovery-'+stamp+'-'+suffix,locale:'tr',type:'article',status,category_id:category,body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Discovery example'}]}]})}});expect(response.ok()).toBe(true);}
 const response=await context.request.get('/api/search/?q='+encodeURIComponent(title)+'&category=fm');const data=await response.json();expect(data.results.map((e:any)=>e.title)).toEqual([title+' match']);
 await page.goto('/search/?q='+encodeURIComponent(title));const root=page.locator('main [data-live-search]');await expect(root.locator('[name=category] option[value="00000000-0000-4000-8000-000000000003"]')).toHaveCount(1);
 await root.locator('[name=category]').selectOption('00000000-0000-4000-8000-000000000003');await expect(root.locator('[data-search-result]')).toHaveCount(1);await expect(root.locator('[data-search-result]')).toContainText(title+' match');
 await root.locator('[name=q]').fill('nonsensicalzeroresults');await expect(root.locator('[data-search-status]')).toContainText('Sonuç yok');await expect(root.locator('.search-suggestion-heading')).toBeVisible();await expect(root.locator('[data-search-result]')).toHaveCount(1);
});

test('account organizes private own likes and bookmarks with action feedback',async({page,context,browser})=>{
 const title='Account library '+Date.now();await context.request.post('/api/studio/',{headers:{Origin:origin},form:{entity:'content',title,slug:'account-library-'+Date.now(),locale:'tr',type:'article',status:'published',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Account example'}]}]})}});
 const search=await context.request.get('/api/search/?q='+encodeURIComponent(title));const entry=(await search.json()).results[0];expect(entry).toBeTruthy();
 await context.addCookies([{name:'pg_mock_user',value:member,url:origin}]);await page.goto('/'+entry.slug+'/');
 await page.locator('[data-bookmark]').click();await expect(page.locator('.action-feedback')).toContainText('Okuma listene eklendi');await page.locator('[data-like]').click();await expect(page.locator('[data-like]')).toHaveAttribute('aria-pressed','true');
 await page.goto('/account/');await page.getByRole('tab',{name:'Okuma listesi',exact:true}).click();await expect(page.locator('.saved-reading')).toContainText(title);
 await page.getByRole('tab',{name:'Beğeniler',exact:true}).click();await expect(page.locator('.liked-reading')).toContainText(title);
 await page.getByRole('tab',{name:'Beğeniler',exact:true}).press('ArrowRight');await expect(page.getByRole('tab',{name:'Bildirimler'})).toBeFocused();
 const other=await browser.newContext({baseURL:origin});await other.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);const otherPage=await other.newPage();await otherPage.goto('/account/#likes');await expect(otherPage.locator('.liked-reading')).not.toContainText(title);await other.close();
 for(const width of [320,1440])for(const theme of ['dark','light']){await page.setViewportSize({width,height:900});await page.evaluate(theme=>document.body.dataset.theme=theme,theme);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
});

test('mobile editor collapses settings while draft, preview and publish stay reachable',async({page})=>{
 await page.setViewportSize({width:320,height:850});await page.goto('/studio/?section=content');
 await expect(page.locator('.editor-settings-disclosure')).not.toHaveAttribute('open','');
 for(const name of ['Taslak kaydet','Yayın önizlemesi','Yayınla']){const button=page.getByRole('button',{name,exact:true});await expect(button).toBeVisible();expect(await button.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})).toBe(true);}
 await page.locator('.editor-settings-disclosure>summary').click();await expect(page.locator('[name=category_id]')).toBeVisible();
 await page.getByRole('button',{name:'Detaylı',exact:true}).click();await expect(page.locator('[name=seo_title]')).toBeVisible();
 for(const theme of ['light','dark']){await page.evaluate(t=>document.body.dataset.theme=t,theme);const axe=await new AxeBuilder({page}).include('.admin-main').analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);}
});

test('settings save failure retains unsaved values and warns instead of accepting an error redirect',async({page})=>{
 await page.goto('/studio/?section=homepage');const title='Retained hero '+Date.now();await page.locator('[name=hero_title_tr]').fill(title);
 await page.route('**/api/studio/',route=>route.fulfill({status:503,body:'Private failure details'}));
 await page.getByRole('button',{name:'Ana sayfayı kaydet',exact:true}).click();await expect(page.locator('.studio-settings-status')).toContainText('Girdileriniz korunuyor');await expect(page.locator('[name=hero_title_tr]')).toHaveValue(title);await expect(page.getByRole('button',{name:'Ana sayfayı kaydet',exact:true})).toBeEnabled();
 expect(await page.evaluate(()=>!dispatchEvent(new Event('beforeunload',{cancelable:true})))).toBe(true);await expect(page.locator('body')).not.toContainText('Private failure details');
 await page.getByRole('button',{name:'Değişiklikleri geri al',exact:true}).click();
});
