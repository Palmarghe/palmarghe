import { test,expect } from '@playwright/test';

const loginStudio=async(page:import('@playwright/test').Page)=>{ await page.goto('/studio/'); await page.getByRole('textbox',{name:'Email'}).fill('admin@example.test'); await page.locator('input[name="password"]').fill('LocalTest123!'); await page.getByRole('button',{name:'Giriş'}).click(); };

test('admin creates permission groups and manages a Studio membership',async({page})=>{
  await loginStudio(page);
  await page.goto('/studio/?section=access');
  await page.getByLabel('Grup adı').fill('Yorum moderatörü');
  await page.getByLabel('Kısa açıklama').fill('Yorumları ve mesajları takip eder.');
  await page.getByLabel('Temel rol').selectOption('editor');
  await page.locator('input[name="permission_messages"]').check();
  await page.getByRole('button',{name:'Grubu kaydet'}).click();
  await expect(page.getByRole('heading',{name:/Yorum moderatörü/})).toBeVisible();
  await page.goto('/studio/?section=members');
  const email=`studio-member-${Date.now()}@example.test`;
  await page.getByLabel('Görünen ad').fill('Yeni Studio Üyesi');
  await page.getByLabel('E-posta').fill(email);
  await page.getByLabel('Geçici şifre').fill('MemberTest123!');
  await page.locator('.member-create select[name="group_id"]').selectOption({label:'Yorum moderatörü'});
  await page.getByRole('button',{name:'Üyeliği oluştur'}).click();
  const card=page.locator('.member-card').filter({hasText:'Yeni Studio Üyesi'});
  await expect(card).toBeVisible();
  await page.context().clearCookies();
  await page.goto('/studio/');
  await page.getByRole('textbox',{name:'Email'}).fill(email);
  await page.locator('input[name="password"]').fill('MemberTest123!');
  await page.getByRole('button',{name:'Giriş'}).click();
  await expect(page.getByRole('navigation').getByRole('link',{name:'Mesajlar'})).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link',{name:'İçerikler'})).toHaveCount(0);
  const denied=await page.request.post('/api/studio/',{headers:{Origin:'http://127.0.0.1:4322'},form:{entity:'content',title:'Yetkisiz içerik',slug:'yetkisiz-icerik',locale:'tr',type:'article',status:'draft',body:'{}'}});
  expect(denied.status()).toBe(403);
  await page.context().clearCookies();
  await loginStudio(page);
  await page.goto('/studio/?section=members');
  const cleanupCard=page.locator('.member-card').filter({hasText:'Yeni Studio Üyesi'});
  await cleanupCard.getByText('Üyeliği sil').click();
  await cleanupCard.getByRole('button',{name:'Kalıcı olarak sil'}).click();
  await expect(page.locator('.member-card').filter({hasText:'Yeni Studio Üyesi'})).toHaveCount(0);
});

test('only a signed-in member can post a comment',async({page})=>{
  await loginStudio(page);
  const slug=`yorum-deneyi-${Date.now()}`;
  const created=await page.request.post('/api/studio/',{headers:{Origin:'http://127.0.0.1:4322'},form:{entity:'content',title:'Yorum deneyi',slug,locale:'tr',type:'article',status:'published',body:JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Yorum alanı testi.'}]}]})}});
  expect(created.status()).toBe(200);
  await page.context().clearCookies();
  const denied=await page.request.post('/api/comments/',{headers:{Origin:'http://127.0.0.1:4322'},form:{path:`/${slug}/`,body:'Anonim yorum'}});
  expect(denied.status()).toBe(401);
  await page.goto('/account/');
  const login=page.locator('form').filter({has:page.locator('input[value="login"]')});
  await login.getByRole('textbox',{name:'Email'}).fill('member@example.test'); await login.locator('input[name="password"]').fill('LocalTest123!'); await login.getByRole('button',{name:'Giriş yap'}).click();
  await page.goto(`/${slug}/`);
  await expect(page.getByRole('heading',{name:'Yorumlar'})).toBeVisible();
  await page.getByLabel('Yorumunuz').fill('Bu içerik için ilk üye yorumu.');
  await page.getByRole('button',{name:'Yorum gönder'}).click();
  await expect(page.locator('.comment').filter({hasText:'Bu içerik için ilk üye yorumu.'})).toBeVisible();
});
