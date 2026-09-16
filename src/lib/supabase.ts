import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import { localSupabase } from './local-adapter';

export const localMode = import.meta.env.DEV && import.meta.env.LOCAL_TEST_MODE === 'true';
export const localTestRequest = (request: Request) => localMode && new URL(request.url).hostname === '127.0.0.1';

export function configured() {
  return localMode || Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
}

export function supabase(cookies: AstroCookies, request: Request): ReturnType<typeof createServerClient> | null {
  if (localTestRequest(request)) return localSupabase(cookies) as unknown as ReturnType<typeof createServerClient>;
  if (localMode && !import.meta.env.PUBLIC_SUPABASE_URL) return null;
  if (!configured()) return null;
  return createServerClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => (request.headers.get('cookie') ?? '').split(';').map((part) => part.trim()).filter(Boolean).map((part) => { const separator = part.indexOf('='); return { name: part.slice(0, separator), value: part.slice(separator + 1) }; }),
      setAll: (items) => items.forEach(({ name, value, options }) => cookies.set(name, value, { ...options, path: '/', sameSite: 'lax', secure: import.meta.env.PROD })),
    },
  });
}
