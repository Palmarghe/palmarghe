import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function configured() {
  return Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
}

export function supabase(cookies: AstroCookies, request: Request) {
  if (!configured()) return null;
  return createServerClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => (request.headers.get('cookie') ?? '').split(';').map((part) => part.trim()).filter(Boolean).map((part) => { const separator = part.indexOf('='); return { name: part.slice(0, separator), value: part.slice(separator + 1) }; }),
      setAll: (items) => items.forEach(({ name, value, options }) => cookies.set(name, value, { ...options, path: '/', sameSite: 'lax', secure: import.meta.env.PROD })),
    },
  });
}
