import {test,expect} from '@playwright/test';

const origin='http://127.0.0.1:4322',admin='00000000-0000-4000-8000-100000000001',editor='00000000-0000-4000-8000-100000000002';

test('an open main editor refuses a different staff actor, retains the draft and confirms a real retry',async({page,context})=>{
 const title='Main editor actor QA '+Date.now();let createdId:string|null=null;
 const useActor=(value:string)=>context.addCookies([{name:'pg_mock_user',value,url:origin}]);
 await useActor(admin);
 try{
  await page.goto('/studio/?section=content');
  const form=page.locator('.content-editor-form'),body=page.locator('#block-editor .tiptap');
  await form.locator('[name=title]').fill(title);await body.fill('Unpublished text retained for its original staff actor.');
  await useActor(editor);
  const receipt=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/studio/');
  await page.getByRole('button',{name:'Taslak kaydet',exact:true}).click();const rejected=await receipt;
  expect(rejected.status()).toBe(409);expect(await rejected.json()).toEqual({error:'actor_session'});
  await expect(form).toHaveAttribute('aria-busy','false');await expect(form.locator('[name=title]')).toHaveValue(title);
  await expect(body).toHaveText('Unpublished text retained for its original staff actor.');await expect(body).toHaveAttribute('contenteditable','true');
  await expect(page.locator('.editor-status')).toContainText('Oturum başka bir hesaba geçti');
  await useActor(admin);expect(await (await context.request.get('/studio/?section=content')).text()).not.toContain(title);
  await page.getByRole('button',{name:'Taslak kaydet',exact:true}).click();
  const row=page.locator('.content-list tbody tr').filter({hasText:title});await expect(row).toBeVisible();
  createdId=new URL((await row.getByRole('link',{name:'Düzenle',exact:true}).getAttribute('href'))!,origin).searchParams.get('edit');expect(createdId).toBeTruthy();
 }finally{
  await useActor(admin);
  if(createdId){expect((await context.request.post('/api/studio/',{headers:{origin},form:{entity:'content',operation:'delete',id:createdId}})).ok()).toBe(true);expect(await (await context.request.get('/studio/?section=content')).text()).not.toContain(title);}
 }
});
