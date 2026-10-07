import {test,expect} from '@playwright/test';
const origin='http://127.0.0.1:4322',editor='00000000-0000-4000-8000-100000000002';
test('editor collection save survives validation failure without losing form inputs',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:editor,url:origin}]);
 await page.goto('/studio/?section=collections&panel=editor');
 const form=page.locator('.collection-editor');await expect(form).toBeVisible();
 const title='Collection QA '+Date.now(),slug='collection-qa-'+Date.now();
 await form.locator('[name=title]').fill(title);await form.locator('[name=slug]').fill(slug);
 await page.route('**/api/studio/',route=>route.fulfill({status:400,body:'Invalid collection'}));
 await form.getByRole('button',{name:'Koleksiyonu kaydet'}).click();await expect(form.locator('[role=status]').last()).toContainText('Girdileriniz korunuyor');
 await expect(form.locator('[name=title]')).toHaveValue(title);await expect(form.getByRole('button',{name:'Koleksiyonu kaydet'})).toBeEnabled();
 await page.unroute('**/api/studio/');await form.getByRole('button',{name:'Koleksiyonu kaydet'}).click();
 await expect(page.locator('table')).toContainText(title);await page.reload();await expect(page.locator('table')).toContainText(title);
});
