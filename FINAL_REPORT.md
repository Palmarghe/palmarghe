# Palmarghe V1 Final Report

## Status

**INCOMPLETE — external production integration remains.** Local/test environment implements the public site and Studio flows listed below. Supabase migrations, Cloudflare deployment, domain/DNS and live security behavior have not been verified. This report records the exact boundary; a local adapter does not prove production readiness.

## Live URLs

- Production, Studio and preview: not deployed or verified.
- Local: `http://127.0.0.1:4321/` with `npm run dev`; E2E uses port 4322 and `LOCAL_TEST_MODE=true`.

## What Was Built

- Astro SSR bilingual public routes (Turkish root, English `/en/`), category/hierarchy listings, archive, search, detail pages for article/project/FM mod/gallery/Lab, About, Contact, Privacy, Account.
- Responsive editorial UI, SVG logo, navigation, footer, homepage visibility/order, appearance presets and social links.
- Studio content CRUD with Tiptap controlled block editor and server-side JSON allowlist, category/tag relationships, type-specific fields, draft/staff preview/publish/UTC scheduling, SEO fields and translation group.
- Category and tag CRUD, media library with PNG/JPEG/WebP signature and 10 MB validation, alt editing, cover selection, protected deletion, contact inbox, redirect manager with loop detection, audit view, member roles and account deletion request review.
- Supabase Auth login/signup/reset/session/profile/deletion request endpoints, server role checks, RLS and private Storage migration. Local-only in-memory adapter provides admin/editor/member accounts and controlled tests.
- Contact Turnstile validation and DB rate limit RPC; hashed IP/action/email auth rate limit RPC; Origin/input checks, CSP/headers, noindex/no-store.
- Canonical/hreflang for matched translations, OG, sitemap, robots and TR/EN RSS. GitHub Actions runs typecheck, unit/build and Playwright E2E.

## Architecture

One Astro SSR app targeting Cloudflare Workers with Supabase Auth/Postgres/Storage. See `docs/architecture.md` and `docs/content-model.md`.

## Database & Auth

Migration files `202609160001`–`202609160008` are prepared, **not applied to a real Supabase project**. Auth flows were exercised with the local adapter only. Initial admin bootstrap requires a controlled privileged transaction after confirming the owner UUID.

## Security Controls

RLS policies, server role checks, same-origin checks, constrained form input and block rendering, media signature/size limits, Turnstile, DB contact/auth rate limits, no-store/noindex and audit triggers are implemented. Production behavior, migrations, Storage policy, SMTP and RLS have not been tested on Supabase. MFA and external security review are pending. Account deletion requests need verified human handling in Supabase Auth; marking a request complete does not delete an identity.

## SEO

Canonical, paired hreflang, sitemap/RSS, JSON-LD for published content, content indexability, and noindex for private/search routes are implemented. Search uses bounded, sanitized title/excerpt matching; advanced full-text/filtering is absent. Search Console remains unverified.

## Performance & Accessibility

Limited client JavaScript, semantic HTML, skip link, focus states and reduced motion are present. Mobile/tablet Playwright checks and axe WCAG scans cover critical routes and Studio form with no serious/critical findings. Production Lighthouse, Core Web Vitals and full manual assistive technology checks remain outstanding. Image derivatives are absent.

## Tests

- `npm run verify`: typecheck 0 errors/warnings, Vitest 10/10, Cloudflare build passed.
- `npm run test:e2e`: Playwright Chrome 21/21 passed against local adapter (roles, CRUD, blocks, media, settings, translations, redirects, contact/auth limits, schedule/preview, mobile/tablet and axe WCAG checks on four public routes plus Studio). A serial rerun passed after test IP isolation prevented rate limits from coupling separate test cases.
- `npm audit --omit=dev --audit-level=high`: 0 reported vulnerabilities at the prior check; recheck before release.
- Production browser tests, real Supabase Auth/RLS/Storage integration, Cloudflare Worker preview and DNS/SSL smoke: **not run**.

## GitHub / CI

The original local Git history and GitHub README initial commit were merged via `cee944f`, with the original README retained in `docs/github-initial-readme.md`. `origin` is `https://github.com/Palmarghe/palmarghe.git`. Commits `b2bb02e`, `4f76588` and `284dc38` were pushed to `main` without force; the root file tree and commit were verified in Chrome. GitHub Actions Verify #3 passed; the latest run must be checked after the final push.

## Deployments

No staging or production deployment was made: Supabase project credentials are unavailable and the available Cloudflare account has no domain zone. See `docs/deployment.md`.

## DNS Changes

No DNS edit or nameserver change was made. Public DNS precheck on 16 September returned SERVFAIL from Google and Cloudflare DoH; Cloudflare reported no reachable authority and `REFUSED` from `37.230.111.111:53`. Turhost's old tab redirected to login, so a complete zone export was unavailable. See `docs/dns-before.md`. Existing records need a panel snapshot and equivalent MX/SPF/DKIM verification before any transition. Desired hosts: apex/www, `studio.palmarghe.com`, isolated preview.

## External Services

GitHub remote and Actions are connected. Chrome showed an authenticated Cloudflare account, but its Domains overview has no zones. Supabase redirected to sign-in and Turhost redirected to login; Turnstile, DNS and Search Console are not configured for this app.

## Environment Variables Required

`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_RATE_PEPPER`, `APP_URL`, and `STUDIO_URL` are described in `.env.example`. `LOCAL_TEST_MODE` is development only. Secrets stay outside Git.

## Remaining Blockers

1. Supabase redirected to sign-in; no project configuration is available. **User step:** sign in to the authorized Supabase account and provide the project URL and publishable/anon key, with the service role key in a server secret store. Then apply migrations and test Auth, CRUD, RLS and Storage against real roles.
2. Cloudflare account access exists, but Domains shows no zones and Turnstile/Worker secrets are not configured. **User step:** identify the intended Cloudflare account/zone and configure the relevant secrets. Then deploy isolated preview, test contact bot protection, and promote after checks.
3. Domain/DNS management is blocked by an expired Turhost session; public resolvers currently return SERVFAIL. **User step:** sign in to the authorized Turhost DNS panel. Then export zone records, diagnose the refused authority/delegation, preserve mail records, route hosts and verify TLS/redirects.
4. Search Console ownership is unverified. **User step:** provide authorized Google account access. Then verify domain property and submit sitemap after production DNS is ready.

## Admin First Login

Create and verify the owner account in Supabase Auth. Confirm its UUID independently. In a privileged SQL transaction, temporarily disable `prevent_profile_role_change`, set only that UUID's `public.profiles.role` to `admin`, re-enable the trigger and verify both role and trigger. Do not store the password or UUID in Git. See `docs/admin-guide.md`.

## Content Publishing Guide

In Studio > Content, enter title/slug/language/type, compose blocks, and save as `draft`. Open the staff preview, then publish or schedule with a future UTC time. Choose category/tags, cover, featured and indexability as needed. See `docs/admin-guide.md`.

## Known Limitations

- Production migration/RPC behavior and Auth callback/email have not been proven. Preview isolation and MFA must be configured in the provider.
- Content relationship writes span multiple requests, so a failed later tag write can leave an earlier content update; transaction-backed RPC would strengthen atomicity.
- Search is intentionally basic; image derivative optimization, member self-service deletion execution, extensive automated accessibility/performance coverage and full content analytics remain open.

## Recommended V2

- Transaction-backed content and relation save, optimized media derivatives, richer search/filtering, analytics, and automated account deletion processing after identity verification.
