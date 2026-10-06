import {test,expect} from '@playwright/test';
test('deployed private preview rejects anonymous requests and public framing remains denied',async({request})=>{
 const preview=await request.get('https://studio.palmarghe.com/studio/preview/homepage/');expect(preview.status()).toBe(401);
 expect(preview.headers()['cache-control']).toContain('no-store');expect(preview.headers()['x-robots-tag']).toContain('noindex');
 expect(preview.headers()['x-frame-options']).toBe('SAMEORIGIN');expect(preview.headers()['content-security-policy']).toContain("frame-ancestors 'self'");
 const home=await request.get('/');expect(home.status()).toBe(200);expect(home.headers()['x-frame-options']).toBe('DENY');expect(home.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
 for(const script of ['homepage-device-preview.js','homepage-device-frame.js'])expect((await request.get('/scripts/'+script)).status()).toBe(200);
});
