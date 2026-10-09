import {test,expect} from '@playwright/test';

test('live indexes omit inactive modules while real article controls still load and route visitors safely',async({page})=>{
 const scripts=new Set<string>();page.on('request',request=>{if(request.resourceType()==='script')scripts.add(new URL(request.url()).pathname);});
 const interactions=['/scripts/comments.js','/scripts/engagement.js','/scripts/library.js'];
 for(const path of ['/?verify=e2e','/en/?verify=e2e','/archive/?verify=e2e','/search/?q=Palmarghe&verify=e2e']){
  scripts.clear();await page.goto(path);await expect(page.locator('main')).toBeVisible();for(const script of interactions)expect(scripts.has(script),path+' must not download '+script).toBe(false);
 }
 scripts.clear();await page.goto('/gaming/minecraft/kaanbuilder/?verify=e2e');await expect(page.locator('.comments-section')).toBeVisible();
 for(const script of interactions)expect(scripts.has(script),'real article requires '+script).toBe(true);
 await page.locator('[data-like]').click();await expect(page).toHaveURL('https://palmarghe.com/account/');await expect(page.locator('main h1')).toBeVisible();expect(scripts.has('/scripts/library.js')).toBe(true);
});
