import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { errorResponse, redirectTo } from '../../lib/security';
export const GET: APIRoute = async ({ request, cookies, url }) => {
  const code = url.searchParams.get('code');
  if (!code) return errorResponse('Invalid callback', 400);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Account service unavailable', 503);
  const { error } = await db.auth.exchangeCodeForSession(code);
  if (error) return errorResponse('Invalid callback', 400);
  return redirectTo(request, url.searchParams.get('next') === 'reset' ? '/account/?reset=1' : '/account/');
};
