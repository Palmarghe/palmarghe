import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('hidden Aurora theme survives navigation and has bounded accessible public surfaces',async({page})=>{
 await page.goto('/');await page.keyboard.press('Alt+Shift+KeyA');await expect(page.locator('body')).toHaveAttribute('data-theme','aurora');
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);}
 await page.goto('/search/');await expect(page.locator('body')).toHaveAttribute('data-theme','aurora');await page.locator('main input[name=q]').fill('Palmarghe');await expect(page.locator('main [data-search-result]').first()).toBeVisible();
 await page.getByRole('button',{name:'Açık modu aç',exact:true}).first().click();await expect(page.locator('body')).toHaveAttribute('data-theme','light');
});
