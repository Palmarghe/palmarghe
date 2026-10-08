import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:4322';
const admin='00000000-0000-4000-8000-100000000001',editor='00000000-0000-4000-8000-100000000002';

for(const entity of ['translation','content_revision'])test(entity+' retains input, guards unsaved content and allows a verified retry',async({page,context})=>{
 await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);await page.setViewportSize({width:390,height:844});
 const stamp=Date.now(),title='Auxiliary original '+entity+' '+stamp,slug='aux-'+entity.replace('_','-')+'-'+stamp;
 const body=JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Original auxiliary QA body.'}]}]});
 const fields={entity:'content',title,slug,locale:'tr',type:'article',status:'draft',body};
 const ids:string[]=[];
 const create=async(value:Record<string,string>)=>{
  expect((await context.request.post('/api/studio/',{headers:{origin},form:value})).ok()).toBe(true);
  await page.goto('/studio/?section=content&q='+encodeURIComponent(value.title));
  const href=(await page.locator('.content-list tbody tr').filter({hasText:value.title}).getByRole('link',{name:'Düzenle',exact:true}).getAttribute('href'))!;
  const id=new URL(href,origin).searchParams.get('edit')!;ids.push(id);return {id,href};
 };
 const source=await create(fields);
 try{
  const target=entity==='translation'?await create({...fields,title:'Auxiliary English '+stamp,locale:'en',slug:slug+'-en'}):null;
  if(entity==='content_revision')expect((await context.request.post('/api/studio/',{headers:{origin},form:{...fields,id:source.id,title:'Updated '+title}})).ok()).toBe(true);
  await page.goto(source.href);const main=page.locator('.content-editor-form');await expect(main).toHaveAttribute('data-editor-dirty','false');
  const form=page.locator('form[action="/api/studio/"]').filter({has:page.locator(`input[name=entity][value=${entity}]`)}).last();
  if(target)await form.locator('[name=target_id]').selectOption(target.id);
  else await form.locator('..').locator('summary').click();
  const revisionCount=await page.locator('.revision-list>li').count(),originalTitle=await main.locator('[name=title]').inputValue();
  const payload=await form.evaluate(f=>[...new FormData(f as HTMLFormElement).entries()].map(([key,value])=>[key,String(value)]));
  let posts=0,release!:()=>void;const held=new Promise<void>(resolve=>release=resolve);
  await page.route('**/api/studio/',async route=>{posts++;expect(route.request().postData()).toContain('name="expected_actor"');expect(route.request().postData()).toContain(admin);await held;await route.fulfill({status:503,body:'Controlled unavailable'});});
  const button=form.locator('button[type=submit],button:not([type])').first();await button.click();
  await expect(form).toHaveAttribute('aria-busy','true');await expect(main).toHaveAttribute('aria-busy','true');await expect(main.locator('[name=title]')).toBeDisabled();await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable','false');
  await form.evaluate(f=>f.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true})));await main.evaluate(f=>f.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true})));expect(posts).toBe(1);
  release();await expect(form.locator('.studio-settings-status')).toContainText('Girdileriniz korunuyor');await expect(button).toBeEnabled();await expect(main.locator('[name=title]')).toBeEnabled();await expect(page.locator('.ProseMirror')).toHaveAttribute('contenteditable','true');
  expect(await form.evaluate(f=>[...new FormData(f as HTMLFormElement).entries()].map(([key,value])=>[key,String(value)]))).toEqual(payload);await expect(main.locator('[name=title]')).toHaveValue(originalTitle);expect(await page.locator('.revision-list>li').count()).toBe(revisionCount);
  for(const width of [320,1440])for(const theme of ['dark','light','aurora']){await page.setViewportSize({width,height:844});await page.evaluate(value=>document.body.dataset.theme=value,theme);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const audit=await new AxeBuilder({page}).include('.revision-panel,.translation-panel').analyze();expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);}
  await main.locator('[name=title]').fill('Unsaved auxiliary title');await page.locator('.ProseMirror').press('End');await page.locator('.ProseMirror').pressSequentially(' Unsaved auxiliary body.');
  const unsaved=await main.locator('[name=body]').inputValue();await button.click();await expect(form.locator('.studio-settings-status')).toContainText('Önce editördeki değişiklikleri kaydedin');expect(posts).toBe(1);await expect(main.locator('[name=title]')).toHaveValue('Unsaved auxiliary title');await expect(main.locator('[name=body]')).toHaveValue(unsaved);
  const axe=await new AxeBuilder({page}).include('.revision-panel,.translation-panel').analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??''))).toEqual([]);
  await page.unroute('**/api/studio/');page.once('dialog',dialog=>dialog.accept());await page.reload();await expect(main).toHaveAttribute('data-editor-dirty','false');
  if(target)await form.locator('[name=target_id]').selectOption(target.id);else await form.locator('..').locator('summary').click();
  await context.addCookies([{name:'pg_mock_user',value:editor,url:origin}]);await button.click();await expect(form.locator('.studio-settings-status')).toContainText('Oturum başka bir hesaba geçti');await expect(main.locator('[name=title]')).toHaveValue(originalTitle);
  await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);await button.click();
  if(target)await expect(page.getByRole('button',{name:'Eşleşmeyi kaldır',exact:true})).toBeVisible();else{await expect(main.locator('[name=title]')).toHaveValue(title);await expect(page.locator('.revision-list>li')).toHaveCount(revisionCount+1);}
 }finally{await page.unroute('**/api/studio/');await context.addCookies([{name:'pg_mock_user',value:admin,url:origin}]);for(const id of ids)expect((await context.request.post('/api/studio/',{headers:{origin},form:{entity:'content',operation:'delete',id}})).ok()).toBe(true);}
});
