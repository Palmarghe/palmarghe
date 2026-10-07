import {test,expect} from '@playwright/test';
import sharp from 'sharp';

test('published original media has smaller real WebP candidates and safe bounded reads',async({page,request})=>{
 await page.setViewportSize({width:390,height:900});await page.goto('/');
 const images=page.locator('img[srcset*="/api/media/"][srcset*="?w=320"]');
 expect(await images.count()).toBeGreaterThan(0);
 const seen=new Set<string>();
 for(const image of await images.all()){
  const source=await image.getAttribute('src');if(!source||seen.has(source))continue;seen.add(source);
  const original=await request.get(source);expect(original.status()).toBe(200);
  const originalBytes=await original.body(),originalShape=await sharp(originalBytes).metadata();
  const srcset=(await image.getAttribute('srcset'))!;
  expect(srcset).toContain(`${source} ${originalShape.width}w`);
  for(const width of [320,640,960]){
   if(!srcset.includes(`?w=${width} ${width}w`))continue;
   const candidate=await request.get(source+`?w=${width}`);expect(candidate.status()).toBe(200);
   expect(candidate.headers()['content-type']).toBe('image/webp');
   expect(candidate.headers()['cache-control']).toMatch(/private.*no-store/);
   const bytes=await candidate.body(),shape=await sharp(bytes).metadata();
   expect(shape.width).toBe(width);expect(shape.height).toBe(Math.max(1,Math.round(originalShape.height!*width/originalShape.width!)));
   expect(bytes.length).toBeLessThan(originalBytes.length);
  }
  expect((await request.get(source+'?w=4096')).status()).toBe(400);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('anonymous responsive generation and unknown-parent reads remain denied',async({request})=>{
 const unknown='/api/media/11111111-1111-4111-8111-111111111111/';
 expect((await request.get(unknown+'?w=320')).status()).toBe(404);
 expect((await request.post('https://studio.palmarghe.com/api/media/renditions/',{
  headers:{origin:'https://studio.palmarghe.com'},form:{media_id:'11111111-1111-4111-8111-111111111111'}
 })).status()).toBe(401);
});
