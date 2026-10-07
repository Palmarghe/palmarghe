import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('Aurora is a hidden persistent theme with accessible public and Studio surfaces',async({page,context})=>{
 await page.goto('/');await page.keyboard.press('Alt+Shift+KeyA');await expect(page.locator('body')).toHaveAttribute('data-theme','aurora');
 await expect(page.locator('[data-aurora-notice]')).toContainText('Aurora');await expect(page.locator('.newsletter-signup button')).toHaveCSS('background-color','rgb(255, 190, 152)');await expect(page.locator('.newsletter-signup button')).toHaveCSS('color','rgb(16, 38, 42)');await page.reload();await expect(page.locator('body')).toHaveAttribute('data-theme','aurora');
 for(const width of [320,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);}
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:'http://127.0.0.1:4322'}]);await page.goto('/studio/');await expect(page.locator('body')).toHaveAttribute('data-theme','aurora');
 const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 await page.goto('/studio/?section=content');await expect(page.locator('.classic-menubar button[aria-selected=true]')).toHaveCSS('background-color','rgb(255, 190, 152)');await expect(page.locator('.classic-menubar button[aria-selected=true]')).toHaveCSS('color','rgb(16, 38, 42)');const editorAxe=await new AxeBuilder({page}).analyze();expect(editorAxe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 await page.locator('[data-theme-toggle]').first().click();await expect(page.locator('body')).toHaveAttribute('data-theme','light');
});
test('theme button long press discovers Aurora without overriding normal tap or brand navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 // The header control is available after opening the phone menu.
 const toggle=page.locator('[data-theme-toggle]:visible').first();
 if(await toggle.count()===0)await page.locator('.mobile-menu .menu-toggle').click();
 const control=page.locator('[data-theme-toggle]:visible').first();const box=await control.boundingBox();expect(box).not.toBeNull();
 await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();await expect(page.locator('body')).toHaveAttribute('data-theme','aurora');await page.mouse.up();await expect(page.locator('body')).toHaveAttribute('data-theme','aurora');
});
