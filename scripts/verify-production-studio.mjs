import { chromium } from '@playwright/test';

const { QA_MEMBER_EMAIL: memberEmail, QA_MEMBER_PASSWORD: memberPassword, QA_EDITOR_EMAIL: editorEmail, QA_EDITOR_PASSWORD: editorPassword } = process.env;
if (![memberEmail, memberPassword, editorEmail, editorPassword].every(Boolean)) throw new Error('Missing Studio role test environment');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const check = (name, valid) => { if (!valid) throw new Error(`FAIL ${name}`); console.log(`PASS ${name}`); };
try {
  for (const [role, email, password] of [['member', memberEmail, memberPassword], ['editor', editorEmail, editorPassword]]) {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto('https://studio.palmarghe.com/account/');
      const form = page.locator('form').filter({ has: page.getByRole('button', { name: 'Giriş yap' }) });
      await form.getByRole('textbox', { name: 'Email' }).fill(email);
      await form.getByRole('textbox', { name: 'Şifre' }).fill(password);
      await form.getByRole('button', { name: 'Giriş yap' }).click();
      await page.getByText(email, { exact: true }).waitFor();
      check(`${role} Studio-domain Auth login`, true);
      await page.goto('https://studio.palmarghe.com/studio/');
      if (role === 'member') {
        check('member denied Studio dashboard', await page.getByText('Erişim engellendi').count() > 0 || await page.getByText('Erişim yok').count() > 0);
      } else {
        check('editor can open Studio dashboard', await page.getByRole('heading', { name: 'Genel bakış' }).count() > 0);
        await page.goto('https://studio.palmarghe.com/studio/?section=users');
        check('editor denied admin member management', await page.getByText('Yalnız admin erişebilir.').count() > 0);
        await page.goto('https://studio.palmarghe.com/studio/?section=content');
        check('editor can open content editor', await page.getByRole('heading', { name: 'Yeni içerik' }).count() > 0);
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
