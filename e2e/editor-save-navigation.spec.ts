import {test,expect} from '@playwright/test';
test('an editor publishes and returns to the authorized editor workspace',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000002',url:'http://127.0.0.1:4322'}]);
 await page.setViewportSize({width:390,height:900});await page.goto('/studio/?section=content&panel=editor');
 const title='editor-save-qa-'+Date.now();const form=page.locator('.content-editor-form');
 await form.locator('[name=title]').fill(title);await page.locator('.tiptap').fill('Editor publication navigation QA.');
 const confirmation=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/studio/');const loaded=page.waitForEvent('domcontentloaded');
 await form.locator('[data-publish-action=published]').click();expect((await confirmation).status()).toBe(303);await loaded;
 expect(new URL(page.url()).searchParams.get('panel')).toBe('editor');await expect(page.locator('.content-editor-form')).toBeVisible();await expect(page.locator('.admin-table')).toContainText(title);
 await page.reload();await expect(page.locator('.admin-table')).toContainText(title);
 const result=await page.request.get('/api/search/?q='+title);expect((await result.json()).results.some((r:any)=>r.title===title)).toBe(true);
});
