import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:4322';
test('health trends are measured, bounded, accessible and preserve results after a failed refresh',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:'00000000-0000-4000-8000-100000000001',url:origin}]);
 const real=await context.request.get('/api/studio-health/');expect(real.status()).toBe(200);
 const payload=await real.json();expect(payload.trends.capacity).toBe(50);expect(payload.trends.sample_count).toBeLessThanOrEqual(50);expect(payload.trends.buckets).toHaveLength(7);
 expect(payload.trends.buckets.reduce((sum:number,b:{count:number})=>sum+b.count,0)).toBe(payload.trends.last_7d.count);
 let unavailable=false;
 // Controlled local rendering fixture; real endpoint/aggregation are checked above and in units.
 const current={count:10,failures:2,failure_percent:20,median_ms:150,p95_ms:900};
 await page.route('**/api/studio-health/',async route=>{
  if(unavailable){await route.abort('failed');return;}
  await route.fulfill({json:{...payload,observations:[],trends:{sample_count:50,capacity:50,possibly_truncated:true,from:'2026-10-01T12:00:00Z',to:'2026-10-07T12:00:00Z',current_24h:current,previous_24h:current,last_7d:{...current,count:50},comparison:{median_delta_ms:-50,failure_delta_points:5},buckets:Array.from({length:7},(_,i)=>({from:`2026-10-0${i+1}T00:00:00Z`,to:`2026-10-0${i+1}T12:00:00Z`,...current,...(i===0?{count:0,median_ms:null,failure_percent:null}: {})}))}}});
 });
 await page.goto('/studio/?section=health');
 const metrics=page.locator('[data-health-metrics]');await expect(metrics).toContainText('150 ms');await expect(metrics).toContainText('900 ms');await expect(metrics).toContainText('20% · 2 hata');
 await expect(page.locator('[data-health-coverage]')).toContainText('pencere eksik olabilir');await expect(page.locator('[data-health-comparison]')).toContainText('-50 ms');await expect(page.locator('[data-health-buckets]')).toContainText('Ölçülmedi');
 for(const width of [390,1440])for(const theme of ['dark','light','aurora']){
  await page.setViewportSize({width,height:900});await page.evaluate(t=>document.body.dataset.theme=t,theme);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const axe=await new AxeBuilder({page}).include('[data-studio-health]').analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
 }
 unavailable=true;await page.locator('[data-health-refresh]').click();await expect(page.locator('[data-health-status]')).toContainText('Önceki bilgiler korunuyor');await expect(metrics).toContainText('150 ms');await expect(page.locator('[data-health-refresh]')).toBeEnabled();
 unavailable=false;await page.locator('[data-health-refresh]').click();await expect(page.locator('[data-health-status]')).toContainText('Son 50');await expect(metrics.locator('.health-metric')).toHaveCount(4);await expect(page.locator('[data-health-buckets] table')).toHaveCount(1);
});
