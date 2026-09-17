import { env } from 'cloudflare:workers';

/** Read Worker bindings at request time; private values must never enter the build. */
export function runtimeSecret(name: string): string | undefined {
  const value = (env as Record<string, unknown>)[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
