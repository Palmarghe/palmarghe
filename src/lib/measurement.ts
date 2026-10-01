import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import { localTestRequest, supabase } from './supabase';
import { localAuthAllowed } from './local-adapter';
import { runtimeSecret } from './runtime-secrets';

/** Privileged writes are confined to validated Worker measurement endpoints. */
export async function measurementWriter(cookies: AstroCookies, request: Request, kind: 'traffic' | 'engagement') {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (localTestRequest(request)) {
    const db = supabase(cookies, request);
    return { db, status: !db ? 503 : localAuthAllowed(`${ip}:measurement:${kind}`, 30, 60) ? 200 : 429 };
  }
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = runtimeSecret('SUPABASE_SERVICE_ROLE_KEY');
  const pepper = runtimeSecret('CONTACT_RATE_PEPPER');
  if (!url || !key || !pepper) return { db: null, status: 503 };
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${pepper}:${ip}:measurement:${kind}`));
  const p_key_hash = Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  const { data, error } = await db.rpc('allow_auth_attempt', { p_key_hash, p_max: 30, p_window_seconds: 60 });
  return { db, status: error ? 503 : data ? 200 : 429 };
}
