import { createClient } from '@supabase/supabase-js';

const { PUBLIC_SUPABASE_URL: url, PUBLIC_SUPABASE_ANON_KEY: key, QA_MEMBER_EMAIL: memberEmail, QA_MEMBER_PASSWORD: memberPassword, QA_EDITOR_EMAIL: editorEmail, QA_EDITOR_PASSWORD: editorPassword } = process.env;
if (![url, key, memberEmail, memberPassword, editorEmail, editorPassword].every(Boolean)) throw new Error('Missing production role test environment');
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const check = (name, valid) => { if (!valid) throw new Error(`FAIL ${name}`); console.log(`PASS ${name}`); };
const member = client();
const editor = client();
let testCategory;
let testStoragePath;
try {
  for (const [label, db, email, password, role] of [['member', member, memberEmail, memberPassword, 'member'], ['editor', editor, editorEmail, editorPassword, 'editor']]) {
    const { data: auth, error } = await db.auth.signInWithPassword({ email, password });
    check(`${label} Auth login`, !error && Boolean(auth.user));
    const profile = await db.from('profiles').select('id,role').eq('id', auth.user.id).single();
    check(`${label} own profile`, !profile.error && profile.data?.role === role);
    const other = await db.from('profiles').select('id').neq('id', auth.user.id);
    check(`${label} cannot read other profiles`, !other.error && other.data?.length === 0);
  }
  const memberMessages = await member.from('contact_messages').select('id');
  check('member cannot read inbox', !memberMessages.error && memberMessages.data.length === 0);
  const memberAudit = await member.from('audit_logs').select('id');
  check('member cannot read audit', !memberAudit.error && memberAudit.data.length === 0);
  const editorAudit = await editor.from('audit_logs').select('id');
  check('editor cannot read audit', !editorAudit.error && editorAudit.data.length === 0);
  const privateDraftId = '97e2c328-6be3-40bb-b4d4-52f607ea0114';
  const hidden = await member.from('content_items').select('id').eq('id', privateDraftId);
  check('member cannot read private draft', !hidden.error && hidden.data.length === 0);
  const visible = await editor.from('content_items').select('id').eq('id', privateDraftId);
  check('editor can read private draft', !visible.error && visible.data.length === 1);
  const nonce = Date.now();
  const categoryPayload = { name_tr: `QA ${nonce}`, name_en: `QA ${nonce}`, slug: `qa-role-${nonce}`, active: false };
  const blockedWrite = await member.from('categories').insert(categoryPayload).select('id');
  check('member cannot create category', Boolean(blockedWrite.error));
  const editorWrite = await editor.from('categories').insert(categoryPayload).select('id').single();
  check('editor can create category', !editorWrite.error && Boolean(editorWrite.data?.id));
  testCategory = editorWrite.data.id;
  const memberSettings = await member.from('site_settings').update({ value: { qa: nonce } }).eq('key', 'appearance').select('key');
  check('member cannot edit appearance', Boolean(memberSettings.error) || memberSettings.data.length === 0);
  const editorSettings = await editor.from('site_settings').update({ value: { qa: nonce } }).eq('key', 'appearance').select('key');
  check('editor cannot edit appearance', Boolean(editorSettings.error) || editorSettings.data.length === 0);
  const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64'));
  testStoragePath = `qa/role-matrix-${nonce}.png`;
  const memberUpload = await member.storage.from('media').upload(testStoragePath, png, { contentType: 'image/png', upsert: false });
  check('member cannot upload media', Boolean(memberUpload.error));
  const editorUpload = await editor.storage.from('media').upload(testStoragePath, png, { contentType: 'image/png', upsert: false });
  check('editor can upload media', !editorUpload.error);
  const memberDownload = await member.storage.from('media').download(testStoragePath);
  check('member cannot download unpublished media', Boolean(memberDownload.error));
} finally {
  if (testStoragePath) {
    const removed = await editor.storage.from('media').remove([testStoragePath]);
    check('editor storage cleanup', !removed.error);
  }
  if (testCategory) {
    const removed = await editor.from('categories').delete().eq('id', testCategory).select('id');
    check('editor category cleanup', !removed.error && removed.data?.length === 1);
  }
  await Promise.all([member.auth.signOut(), editor.auth.signOut()]);
}
