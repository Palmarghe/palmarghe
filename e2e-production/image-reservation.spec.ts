import { test, expect } from '@playwright/test';

for (const width of [390,1440]) {
  for (const theme of ['dark','light']) {
    // Each combination receives a fresh browser context; decoded-image reuse
    // must not bypass the deliberately delayed cover response.
    test(`portrait and readership reserve their final box at ${width}px in ${theme}`, async ({ page,request }) => {
    await page.setViewportSize({ width, height:900 });
      let release!: () => void;
      const held = new Promise<void>(resolve => { release = resolve; });
      let releaseMetrics!: () => void;
      const heldMetrics = new Promise<void>(resolve => { releaseMetrics = resolve; });
      const html=await (await request.get('/fm/lamine-yamal-fm26/?verify=reservation-source')).text();
      const tag=html.match(/<img\b[^>]*fetchpriority="high"[^>]*>/)?.[0];
      const source=tag?.match(/\bsrc="([^"]+)"/)?.[1];
      expect(source).toMatch(/^\/(?:editorial\/|api\/media\/)/);
      const coverUrl=new URL(source!,'https://palmarghe.com').href;let heldCover=false,heldCoverUrl='';
      const coverRoute=coverUrl+'*';
      await page.route(coverRoute,async route=>{heldCover=true;heldCoverUrl=route.request().url();await held;await route.continue();});
      await page.addInitScript(theme=>localStorage.setItem('palmarghe-theme',theme),theme);
      await page.route('**/api/engagement/**', async route => {
        if (route.request().method() === 'POST') return route.fulfill({status:204});
        await heldMetrics;
        await route.fulfill({status:200,contentType:'application/json',body:'{"reads":1234,"shares":2}'});
      });
      try {
        await page.goto('/fm/lamine-yamal-fm26/?verify=reservation', { waitUntil:'domcontentloaded' });
        await expect(page.locator('body')).toHaveAttribute('data-theme',theme);
        await page.evaluate(async()=>{await document.fonts.ready;});
        await expect.poll(()=>heldCover).toBe(true);
        const cover = page.locator('.content-detail > img');
        await expect(cover).toHaveAttribute('width','655');
        await expect(cover).toHaveAttribute('height','1000');
        expect(await cover.evaluate((image:HTMLImageElement) => image.complete)).toBe(false);
        const before = await cover.boundingBox();
        release();
        await expect.poll(() => cover.evaluate((image:HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
        expect(await cover.evaluate((image:HTMLImageElement)=>image.currentSrc)).toBe(heldCoverUrl);
        const after = await cover.boundingBox();
        expect(before).not.toBeNull();
        expect(after).not.toBeNull();
        for (const key of ['x','y','width','height'] as const) expect(Math.abs(before![key]-after![key]),`${width}/${theme}/${key}`).toBeLessThan(1);
        expect(after!.width).toBeGreaterThan(0);
        expect(after!.x+after!.width).toBeLessThanOrEqual(width);
        expect(await cover.evaluate(image => getComputedStyle(image).objectFit)).toBe('cover');
        releaseMetrics();
        await expect(page.locator('[data-content-engagement]')).toHaveText('1.234 okunma · 2 paylaşım');
        const afterMetrics=await cover.boundingBox();
        for (const key of ['x','y','width','height'] as const) expect(Math.abs(before![key]-afterMetrics![key]),`${width}/${theme}/metrics/${key}`).toBeLessThan(1);
      } finally { release(); releaseMetrics(); await page.unroute(coverRoute); await page.unroute('**/api/engagement/**'); }
    });
  }
}
