import { createClient } from '@supabase/supabase-js';

const { PUBLIC_SUPABASE_URL: url, PUBLIC_SUPABASE_ANON_KEY: key, QA_EDITOR_EMAIL: email, QA_EDITOR_PASSWORD: password } = process.env;
if (![url, key, email, password].every(Boolean)) throw new Error('Missing production content test environment');
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const check = (name, valid) => { if (!valid) throw new Error(`FAIL ${name}`); console.log(`PASS ${name}`); };
const created = [];
const nonce = Date.now();
const types = ['article', 'project', 'fm_mod', 'gallery', 'lab_entry'];
const base = 'https://palmarghe.com';
const body = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: `Production QA ${nonce}` }] }] };
const payload = (type, status, publishedAt) => ({
  locale: 'tr', type, status, title: `Production QA ${type} ${nonce}`,
  slug: `lab/qa-${type.replace('_', '-')}-${nonce}`, excerpt: `Controlled ${type} production check`, body,
  type_data: type === 'fm_mod' ? { compatibility: 'FM26', mod_version: 'QA' } : type === 'project' ? { project_url: 'https://palmarghe.com/' } : {},
  featured: false, indexable: false, published_at: publishedAt,
  seo_title: `QA SEO ${type} ${nonce}`, seo_description: `QA description ${type} ${nonce}`,
});
try {
  const auth = await db.auth.signInWithPassword({ email, password });
  check('editor Auth login', !auth.error && Boolean(auth.data.user));
  for (const type of types) {
    const draft = payload(type, 'draft', null);
    const inserted = await db.rpc('save_content_with_relations', { p_content_id: null, p_payload: draft, p_category_id: null, p_tag_ids: [] });
    check(`${type} draft save`, !inserted.error && Boolean(inserted.data));
    created.push(inserted.data);
    const path = `/${draft.slug}/`;
    const before = await fetch(`${base}${path}`);
    check(`${type} draft private`, before.status === 404);
    const published = await db.rpc('save_content_with_relations', { p_content_id: inserted.data, p_payload: payload(type, 'published', new Date(Date.now() - 60000).toISOString()), p_category_id: null, p_tag_ids: [] });
    check(`${type} published save`, !published.error && published.data === inserted.data);
    const live = await fetch(`${base}${path}`);
    const html = await live.text();
    check(`${type} live route and SEO`, live.status === 200 && html.includes(draft.seo_title) && html.includes(draft.seo_description) && html.includes('noindex'));
  }
  const scheduled = payload('lab_entry', 'scheduled', new Date(Date.now() + 86400000).toISOString());
  scheduled.slug = `lab/qa-scheduled-${nonce}`;
  const scheduledInsert = await db.rpc('save_content_with_relations', { p_content_id: null, p_payload: scheduled, p_category_id: null, p_tag_ids: [] });
  check('future scheduled save', !scheduledInsert.error && Boolean(scheduledInsert.data));
  created.push(scheduledInsert.data);
  const future = await fetch(`${base}/${scheduled.slug}/`);
  check('future scheduled private', future.status === 404);
} finally {
  for (const id of created.reverse()) {
    const removed = await db.from('content_items').delete().eq('id', id).select('id');
    check(`content cleanup ${id}`, !removed.error && removed.data?.length === 1);
  }
  await db.auth.signOut();
}
