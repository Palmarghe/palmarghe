import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('revision comparison shows actual changes and restoration preserves a reversible history',async({page,context})=>{
 const origin='http://127.0.0.1:4322';await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 const stamp=Date.now(),before='Revision before '+stamp,after='Revision after '+stamp;
 const fields={entity:'content',title:before,slug:'revision-compare-'+stamp,locale:'tr',type:'article',status:'draft',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Original text'}]}]})};
 expect((await context.request.post('/api/studio/',{headers:{Origin:origin},form:fields})).ok()).toBe(true);
 await page.goto('/studio/?section=content&q='+encodeURIComponent(before));const href=await page.locator('.content-list tbody tr').filter({hasText:before}).getByRole('link',{name:'Düzenle',exact:true}).getAttribute('href');expect(href).toBeTruthy();const id=new URL(href!,origin).searchParams.get('edit')!;
 expect((await context.request.post('/api/studio/',{headers:{Origin:origin},form:{...fields,id,title:after,body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Updated text'}]}]})}})).ok()).toBe(true);
 await page.goto(href!);const row=page.locator('.revision-list>li').last();await row.locator('.revision-comparison>summary').click();await expect(row.locator('.revision-comparison-columns').first()).toContainText(before);await expect(row.locator('.revision-comparison-columns').first()).toContainText(after);
 for(const width of [320,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const axe=await new AxeBuilder({page}).include('.revision-panel').analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);}
 await row.getByText('Bu sürümü geri yükle',{exact:true}).click();await row.getByRole('button',{name:/geri yüklensin/}).click();await expect(page.locator('[name=title]')).toHaveValue(before);await expect(page.locator('.content-editor-form [name=status]')).toHaveValue('draft');await expect(page.locator('.revision-list>li')).toHaveCount(3);
 const revisionId=await page.locator('.revision-list>li').nth(1).locator('[name=revision_id]').inputValue();
 const restore={entity:'content_revision',operation:'restore',content_id:id,revision_id:revisionId};
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000003',url:origin}]);
 expect((await context.request.post('/api/studio/',{headers:{Origin:origin},form:restore,maxRedirects:0})).status()).toBe(403);
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000002',url:origin}]);
 const editorRestore=await context.request.post('/api/studio/',{headers:{Origin:origin},form:restore,maxRedirects:0});expect(editorRestore.status()).toBe(303);expect(editorRestore.headers().location).toContain('panel=editor');
 await page.goto(editorRestore.headers().location);await expect(page.locator('[name=title]')).toHaveValue(after);await expect(page.locator('.revision-list>li')).toHaveCount(4);
});
