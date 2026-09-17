# Palmarghe V1 Final Report

## Status

**IN PROGRESS — production is live; final production E2E and external service checks remain.** Public site and Studio are reachable through Cloudflare. The remaining checks below must pass before this report can say COMPLETE.

## Live URLs

- Production: `https://palmarghe.com/` (opened in Chrome, HTTPS valid).
- Studio: `https://studio.palmarghe.com/studio/` (opened in Chrome, HTTPS valid).
- Worker preview: `https://palmarghe.palmarghe.workers.dev/` (noindex).
- Local: `http://127.0.0.1:4321/` with `npm run dev`; E2E uses port 4322 and `LOCAL_TEST_MODE=true`.

## What Was Built

- Astro SSR bilingual public routes (Turkish root, English `/en/`), category/hierarchy listings, archive, search, detail pages for article/project/FM mod/gallery/Lab, About, Contact, Privacy, Account.
- Responsive editorial UI, SVG logo, navigation, footer, homepage visibility/order, appearance presets and social links.
- Generated editorial glass hero and four AI/Gaming/FM/Lab illustrations, optimized to 274 KB total WebP; animated desktop/mobile menus with reduced motion support.
- Studio content CRUD with Tiptap controlled block editor and server-side JSON allowlist, category/tag relationships, type-specific fields, draft/staff preview/publish/UTC scheduling, SEO fields and translation group.
- Category and tag CRUD, media library with PNG/JPEG/WebP signature and 10 MB validation, alt editing, cover selection, protected deletion, contact inbox, redirect manager with loop detection, audit view, member roles and account deletion request review.
- Supabase Auth login/signup/reset/session/profile/deletion request endpoints, server role checks, RLS and private Storage migration. Local-only in-memory adapter provides admin/editor/member accounts and controlled tests.
- Contact Turnstile validation and DB rate limit RPC; hashed IP/action/email auth rate limit RPC; Origin/input checks, CSP/headers, noindex/no-store.
- Canonical/hreflang for matched translations, OG, sitemap, robots and TR/EN RSS. GitHub Actions runs typecheck, unit/build and Playwright E2E.

## Architecture

One Astro SSR app targeting Cloudflare Workers with Supabase Auth/Postgres/Storage. See `docs/architecture.md` and `docs/content-model.md`.

## Database & Auth

Production Supabase project `ozztqhiqzchlbxscbwhy` is active. Migrations `202609160001`–`202609160009` were applied through the SQL Editor. Migration 009 adds API grants required in addition to RLS; anon REST reads for public categories/content return 200, while anon reads of contact messages/audit logs and category writes return 401. All 15 public tables have RLS enabled, with 26 public policies and five private media Storage policies. Auth site URL and callback allowlist point to production. A verified admin session reached Studio in Chrome and uploaded the generated hero image to private Storage, where its thumbnail and alt text appeared.

## Security Controls

RLS policies, server role checks, same-origin checks, constrained form input and block rendering, media signature/size limits, Turnstile, DB contact/auth rate limits, no-store/noindex and audit triggers are implemented. Cloudflare Worker stores `CONTACT_RATE_PEPPER`, `SUPABASE_SERVICE_ROLE_KEY` and `TURNSTILE_SECRET_KEY` as encrypted secrets; Wrangler confirmed all three after redeploy. Production anonymous RLS read/write checks and authenticated Storage upload passed. Contact submission/Turnstile response, SMTP, full role matrix and Cloudflare Access remain to be proven. MFA and external security review are pending. Account deletion requests need verified human handling in Supabase Auth.

## SEO

Canonical, paired hreflang, sitemap/RSS, JSON-LD for published content, content indexability, and noindex for private/search routes are implemented. Search uses bounded, sanitized title/excerpt matching; advanced full-text/filtering is absent. Search Console remains unverified.

## Performance & Accessibility

Limited client JavaScript, semantic HTML, skip link, focus states and reduced motion are present. Mobile/tablet Playwright checks and axe WCAG scans cover critical routes and Studio form with no serious/critical findings. Five generated WebP assets total about 274 KB. Chrome desktop screenshot confirmed the live hero; all five live images loaded. Production Lighthouse, Core Web Vitals and full manual assistive technology checks remain outstanding.

## Tests

- `npm run verify`: typecheck 0 errors/warnings, Vitest 11/11, Cloudflare build passed.
- `npm run test:e2e`: 21/22 passed on first run after menu markup changed; the remaining test still targeted the old `summary` element. Updated it and reran the two responsive/menu tests: 2/2 passed. Full suite should be rerun after commit.
- `npm audit --omit=dev --audit-level=high`: 0 reported vulnerabilities; recheck before release.
- Production Chrome: TR home, Studio, account, contact opened; valid HTTPS; generated assets loaded; no browser console errors on checked pages. HTTP smoke: TR/EN, Studio, sitemap, robots, RSS and hero asset returned 200; `www` returned 301 to apex. Supabase REST anonymous grant/RLS checks and authenticated Studio media upload passed. Full production E2E remains open.

## GitHub / CI

The original local Git history and GitHub README initial commit were merged via `cee944f`, with the original README retained in `docs/github-initial-readme.md`. `origin` is `https://github.com/Palmarghe/palmarghe.git`. The local history was pushed to `main` without force. Chrome showed the files and latest code commit `f108a42`; GitHub Actions Verify #10 completed successfully. The final report commit requires its own CI check after push.

## Deployments

Cloudflare Worker `palmarghe` deployed via Wrangler 4.132.0. Current version `fba9976c-376d-4817-94db-3937e511f1ef`; apex, Studio and www custom domains are attached. Cloudflare zone is active. No separate staging environment was created; Workers.dev preview is noindex. See `docs/deployment.md`.

## DNS Changes

SERVFAIL root cause was lame Turhost delegation: the parent pointed at cpns servers that returned REFUSED. Parent DS was absent, so DNSSEC was not the cause. Turhost DNS service was disabled and zone export unavailable; backup and rollback were recorded before change in `docs/dns-backup-2026-09-16.md`. Registrar NS changed from `cpns1.turhost.com`/`cpns2.turhost.com` to Cloudflare's `kaiser.ns.cloudflare.com`/`serenity.ns.cloudflare.com`. Cloudflare zone activated with three Worker DNS records. DS/DNSSEC were not changed. Chrome verified valid HTTPS for apex and Studio; www redirects to apex.

## External Services

GitHub, Cloudflare, Supabase and Turhost authenticated sessions were available. Production Supabase, Cloudflare zone/Worker/custom domains and Turnstile widget were configured. Search Console and Cloudflare Access are not yet configured; Turnstile live completion is unverified.

## Environment Variables Required

`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `CONTACT_RATE_PEPPER`, `APP_URL`, and `STUDIO_URL` are described in `.env.example`. `LOCAL_TEST_MODE` is development only. Secrets stay outside Git.

## Remaining Blockers

1. Turnstile live widget on contact page has not produced a response token in Chrome. Determine whether a CAPTCHA needs human completion or a widget configuration fix; then submit and inspect a controlled production contact message.
2. Cloudflare Access for Studio, full production member/editor permission matrix, SMTP email callback/reset and Search Console ownership have not yet been verified. Continue these independent checks; request user intervention only if 2FA/CAPTCHA, account ownership or explicit approval is required.
3. Production content CRUD/preview/publish, Storage policy denial cases, Lighthouse/Core Web Vitals and full E2E remain open. Test without leaving published sample content.

## Admin First Login

Create and verify the owner account in Supabase Auth. Confirm its UUID independently. As the migration owner `postgres`, set only that UUID's `public.profiles.role` to `admin`; keep `prevent_profile_role_change` enabled and verify the role and trigger. Do not store the password or UUID in Git. See `docs/admin-guide.md`.

## Content Publishing Guide

In Studio > Content, enter title/slug/language/type, compose blocks, and save as `draft`. Open the staff preview, then publish or schedule with a future UTC time. Choose category/tags, cover, featured and indexability as needed. See `docs/admin-guide.md`.

## Known Limitations

- Production migration/RPC behavior and Auth callback/email have not been proven. Preview isolation and MFA must be configured in the provider.
- Content relationship writes span multiple requests, so a failed later tag write can leave an earlier content update; transaction-backed RPC would strengthen atomicity.
- Search is intentionally basic; image derivative optimization, member self-service deletion execution, extensive automated accessibility/performance coverage and full content analytics remain open.

## Recommended V2

- Transaction-backed content and relation save, optimized media derivatives, richer search/filtering, analytics, and automated account deletion processing after identity verification.
