import {test,expect} from '@playwright/test';
test('live health samples and trends remain private to authenticated administrators',async({request})=>{
 const result=await request.get('https://studio.palmarghe.com/api/studio-health/?verify=health-boundary');
 expect(result.status()).toBe(401);expect(result.headers()['cache-control']).toContain('private');expect(result.headers()['cache-control']).toContain('no-store');
 expect(await result.json()).toEqual({error:'unauthorized'});
});
