import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { supabase, localTestRequest } from '../../lib/supabase';
import { sameOrigin, errorResponse, redirectTo } from '../../lib/security';
import { localAuthAllowed } from '../../lib/local-adapter';

const credentials = z.object({ email: z.email().max(254), password: z.string().min(8).max(128) });
async function allowed(request: Request, action: string, email: string): Promise<boolean | null> {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const max = action === 'login' ? 10 : 5;
  if (localTestRequest(request)) return localAuthAllowed(`${ip}:${action}`, 30) && localAuthAllowed(`${ip}:${action}:${email.toLowerCase()}`, max);
  const { PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, CONTACT_RATE_PEPPER: pepper } = import.meta.env;
  if (!url || !key || !pepper) return null;
  const service = createClient(url,key,{ auth: { persistSession: false } });
  for (const [identity,limit] of [[`${ip}:${action}`,30],[`${ip}:${action}:${email.toLowerCase()}`,max]] as const) {
    const hash = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${pepper}:${identity}`));
    const p_key_hash = Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2,'0')).join('');
    const { data, error } = await service.rpc('allow_auth_attempt',{ p_key_hash, p_max: limit, p_window_seconds: 900 });
    if (error) return null;
    if (!data) return false;
  }
  return true;
}
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Account service unavailable', 503);
  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  const locale = form.get('locale') === 'en' ? 'en' : 'tr';
  const account = `/${locale === 'en' ? 'en/' : ''}account/`;
  if (action === 'logout') { await db.auth.signOut(); return redirectTo(request, account); }
  if (action === 'logout_all') { await db.auth.signOut({ scope: 'global' }); return redirectTo(request, account); }
  if (action === 'profile') {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return errorResponse('Unauthorized',401);
    const display_name = z.string().trim().max(100).safeParse(form.get('display_name'));
    if (!display_name.success) return errorResponse('Invalid name');
    const { error } = await db.from('profiles').update({ display_name: display_name.data }).eq('id',user.id);
    if (error) return errorResponse('Update failed',400);
    return redirectTo(request, account);
  }
  if (action === 'delete_request') {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return errorResponse('Unauthorized',401);
    const { error } = await db.from('account_deletion_requests').insert({ user_id: user.id });
    if (error) return errorResponse('Request failed',400);
    return redirectTo(request, `${account}?notice=deletion`);
  }
  if (action === 'reset') {
    const email = z.email().safeParse(form.get('email'));
    if (!email.success) return errorResponse('Invalid email');
    const permitted = await allowed(request,action,email.data);
    if (permitted === null) return errorResponse('Account service unavailable',503);
    if (!permitted) return errorResponse('Rate limit exceeded',429);
    await db.auth.resetPasswordForEmail(email.data, { redirectTo: new URL('/auth/callback/?next=reset', request.url).href });
    return redirectTo(request, `${account}?notice=reset`);
  }
  if (action === 'update_password') {
    const password = z.string().min(8).max(128).safeParse(form.get('password'));
    if (!password.success) return errorResponse('Invalid password');
    const { data: { user } } = await db.auth.getUser();
    if (!user) return errorResponse('Unauthorized', 401);
    const { error } = await db.auth.updateUser({ password: password.data });
    if (error) return errorResponse('Update failed', 400);
    return redirectTo(request, account);
  }
  const parsed = credentials.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return errorResponse('Invalid credentials', 400);
  if (action !== 'login' && action !== 'signup') return errorResponse('Invalid action');
  const permitted = await allowed(request,action,parsed.data.email);
  if (permitted === null) return errorResponse('Account service unavailable',503);
  if (!permitted) return errorResponse('Rate limit exceeded',429);
  if (action === 'signup') {
    if (form.get('consent') !== 'on') return errorResponse('Consent required');
    const { error } = await db.auth.signUp({ ...parsed.data, options: { emailRedirectTo: new URL('/auth/callback/', request.url).href } });
    if (error) return errorResponse('Sign up unavailable', 400);
    return redirectTo(request, `${account}?notice=verify`);
  }
  if (action === 'login') {
    const { error } = await db.auth.signInWithPassword(parsed.data);
    if (error) return errorResponse('Invalid credentials', 400);
    return redirectTo(request, form.get('next') === 'studio' ? '/studio/' : account);
  }
  return errorResponse('Invalid action');
};
