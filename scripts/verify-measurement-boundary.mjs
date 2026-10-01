import { createClient } from '@supabase/supabase-js';

// Run once with production public configuration. Creates one clearly marked
// traffic QA path; remove that exact path's four rows after checking it in SQL.
// Never calls the engagement writer on a real content ID.
const { PUBLIC_SUPABASE_URL: url, PUBLIC_SUPABASE_ANON_KEY: key } = process.env;
if (url !== 'https://ozztqhiqzchlbxscbwhy.supabase.co' || !key) throw Error('Expected Palmarghe production public configuration');
const path = '/qa-measurement-boundary-20261001/';
const visitor = '11111111-1111-4111-8111-111111111111';
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
for (const [name, body] of [
  ['record_traffic_visit', { p_path: path, p_visitor_id: visitor }],
  ['record_qualified_traffic_visit', { p_path: path, p_visitor_id: visitor, p_source: 'direct' }],
  ['record_content_engagement', { p_content_id: visitor, p_event: 'read' }],
]) {
  const { error } = await db.rpc(name, body);
  if (error?.code !== '42501') throw Error(`Permission boundary failed for ${name}: ${error?.code ?? 'accepted'}`);
  console.log(`PASS anonymous RPC denied: ${name}`);
}
for (const [endpoint, body, expected] of [
  ['traffic', { path, visitor, source: 'direct' }, 204],
  ['engagement', { path, event: 'read' }, 404],
]) {
  const response = await fetch(`https://palmarghe.com/api/${endpoint}/`, {
    method: 'POST', headers: { origin: 'https://palmarghe.com', 'content-type': 'application/json', 'user-agent': 'Palmarghe controlled measurement QA' },
    body: JSON.stringify(body),
  });
  if (response.status !== expected) throw Error(`Worker ${endpoint} returned ${response.status}`);
  console.log(`PASS Worker ${endpoint}: ${expected}`);
}
console.log(`Cleanup required only for reserved test path: ${path}`);
