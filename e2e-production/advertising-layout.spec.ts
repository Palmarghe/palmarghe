import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('live partner bands align with the public grid and the connected footer stays usable',async({page,request})=>{
 test.setTimeout(60000);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/?verify=partner-layout');
  for(const theme of ['dark','light','aurora']){
   await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
   const boxes=await page.locator('.promotion-slot').evaluateAll(nodes=>nodes.map(node=>{const box=node.getBoundingClientRect(),shell=document.querySelector('.site-header')!.getBoundingClientRect();return {left:box.left,right:box.right,shellLeft:shell.left,shellRight:shell.right};}));
   for(const box of boxes){expect(Math.abs(box.left-box.shellLeft)).toBeLessThan(1);expect(Math.abs(box.right-box.shellRight)).toBeLessThan(1);}
   await expect(page.locator('.footer-discovery h2')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   const audit=await new AxeBuilder({page}).include('.site-footer').include('.promotion-slot').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']).analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
  }
 }
 await expect(page.locator('.newsletter-consent input')).not.toBeChecked();await expect(page.locator('.newsletter-consent input')).toHaveAttribute('required','');
 for(const url of ['/rss.xml','/en/rss.xml']){const response=await request.get(url);expect(response.ok()).toBe(true);expect(response.headers()['content-type']).toContain('application/rss+xml');}
 // Live placement settings are respected: hiding a slot is permitted and does not make this audit publish it.
});
