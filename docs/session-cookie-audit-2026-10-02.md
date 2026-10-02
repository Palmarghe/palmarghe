# Server session cookie audit — 2 October 2026

Worker `a9f7f102-e50a-463e-8b37-ee87a27d87d3` deployed successfully.

## Finding and applicability

The installed `@supabase/ssr` cookie defaults explicitly set `httpOnly: false`. Palmarghe's `src/lib/supabase.ts` enforced Secure in production, SameSite=Lax and root path, but did not override that default. Auth login, signup, PKCE exchange, session refresh, authenticated API calls and logout all execute on the server. Repository inspection found no browser Supabase Auth client or browser cookie reader in `src` / `public/scripts`; interactive browser controls call same-origin application endpoints instead.

Supabase documents that browser Auth clients require access to their cookies. That caveat was evaluated against this server-mediated application rather than blindly copied. [Supabase SSR advanced guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide), [sessions guide](https://supabase.com/docs/guides/auth/sessions).

The centralized cookie writer now forces HttpOnly on all SDK cookie writes, including session chunks, PKCE material and removals, preserving Secure, SameSite, path and SDK lifetime/chunk behavior. No token is logged or exposed in markup. Existing cookies are replaced when the server writes or refreshes them; old cookies are not claimed retroactively protected before a rewrite. Cookie names/domains, role grants, passwords, Auth configuration and account data are unchanged.

## Evidence

- **Before deploy:** a live request with fabricated, expired, invalid tokens to `/account/?verify=session-cookie` returned anonymous HTML and a clearing cookie with Max-Age=0, Path=/, Secure, SameSite=Lax **without HttpOnly**. The production regression failed exactly on the missing attribute. This observes the real server writer; it does not prove a successful token theft or exploit.
- **After deploy:** the same synthetic invalid session was rejected and removed on both apex `/account/` and Studio `/studio/`, now including HttpOnly, Secure, SameSite=Lax, Path=/ and Max-Age=0. No synthetic token appeared in HTML. Production cookie tests 2/2 passed. No real credential/token was used, inspected, created or logged by this test; no Auth user was created or deleted.
- **Real SDK with controlled transport:** password login generates multiple session chunks; each has the protected attributes. A subsequent logout request carrying those chunks clears them with the same protections. An expired session triggers the real SDK refresh path and writes protected renewed cookies. Two tests pass. Remote Auth responses in these unit tests are controlled fixtures, not production email/login evidence.
- **Local affected browser tests:** membership management, authenticated-only comments, member denial of Studio and login rate limit: 4/4. These use the adapter; they supplement, not replace, the real SDK transport tests.
- **Verify:** Astro 0 diagnostics, Vitest 57/57 (13 files), build successful.
- **Live combined checks:** cookies, signup rejection/notice accessibility and native search pointers: 5/5. Existing real admin Chrome session still opens the Studio dashboard after deploy. No admin logout, new-user creation, profile change or content mutation was performed.

## Limits and rollback

SMTP/reset callback delivery, a fresh real production password login/logout and browser-wide removal across all sessions are not proven by these tests. Existing admin continuity and server cookie attributes are proven within the scopes above. CSRF/XSS/rate/upload/retention reviews remain separate requirements; HttpOnly is one defense, not a complete security audit.

Rollback is a normal revert/build/deploy of the cookie writer. No database rollback is required. Reverting removes the new protection on subsequent cookie writes, so use only for a verified server/browser integration regression; do not weaken it merely to accommodate an unreviewed future browser Auth client. Full webmaster scope remains active.
