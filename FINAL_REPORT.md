# Palmarghe V1 Final Report

## Status — 19 September 2026

**FAZ 1 applicable scope complete; only external or user-dependent gates remain.** The public site and Studio run on Cloudflare Workers with Supabase production. The existing Astro architecture and local/GitHub history were preserved. FAZ 2 deep review may proceed. This status does not claim that the external gates below have passed.

## Live services

- Public: `https://palmarghe.com/` and English routes under `/en/`.
- Studio: `https://studio.palmarghe.com/studio/`.
- Worker preview: `https://palmarghe.palmarghe.workers.dev/`, marked noindex.
- Repository: `https://github.com/Palmarghe/palmarghe`, branch `main`, remote `origin`. No force push was used. GitHub's original README commit was reconciled with local history via `cee944f`; its README is retained in `docs/github-initial-readme.md`.

After QA account cleanup, real Chrome opened the apex homepage and authenticated Studio dashboard. Both rendered their expected headings over HTTPS. The final read-only production E2E suite passed 10/10. `www` redirects to apex; account, Studio and API responses carry no-store/noindex protections.

## Delivered product

- Bilingual Astro SSR editorial site with home, AI, gaming, Football Manager, Lab, archive, search, details, About, Contact, Privacy and Account routes.
- Responsive navigation and footer, SVG identity, five optimized generated WebP illustrations (about 274 KB total), soft menu transitions and reduced-motion support.
- Studio content CRUD with controlled Tiptap blocks, five content types, category/tag relations, drafts, preview, publishing, UTC scheduling, translation groups, SEO and indexability fields.
- Category/tag CRUD, private media library with type/signature/size checks, alt and cover controls, appearance/homepage/navigation/social settings, redirect manager, contact inbox, audit view and member role management.
- Supabase Auth login/signup/reset/session/profile/deletion request endpoints, local/test adapter, Turnstile contact validation, DB-backed contact/auth rate limits, Origin checks and security headers.
- Canonical/hreflang, JSON-LD on content, sitemap, robots and TR/EN RSS.

See `docs/architecture.md`, `docs/content-model.md`, `docs/admin-guide.md` and `docs/deployment.md` for implementation details.

## Production database, Auth and permissions

Supabase project `ozztqhiqzchlbxscbwhy` is active. Migrations `202609160001`–`202609160009` and `202609170010_content_transaction.sql` were applied in production. The latter adds `save_content_with_relations`, a SECURITY INVOKER RPC that writes an item and its category/tag links in one transaction while retaining RLS. A local regression proved an invalid category leaves no partial item; live Studio resaved the existing private QA draft through the RPC with its fields and relations intact. The RPC Worker deployment was version `0c6e5d92-ce3d-4849-967d-99da82cf3490`. No later application-code deployment was required for verification scripts and documents.

All 15 public tables have RLS enabled. Anonymous REST access to public categories/content succeeds; private inbox/audit reads and anonymous writes are denied. Production role script `scripts/verify-production-roles.mjs` passed 20/20 checks with separate `member` and `editor` users: Auth login, own-profile and cross-profile boundaries, private drafts, inbox/audit access, category and appearance writes, and private Storage upload/download. An isolated Chrome Playwright run (`scripts/verify-production-studio.mjs`) verified member Studio denial, editor dashboard/content access and editor denial of admin member management. Existing admin Studio access and private Storage upload had already been verified.

The two temporary Auth users were identified by exact email, UUID and role before removal. The editor's 19 audit rows were checked against its QA category and six QA contents, then removed to clear the restrictive profile FK. Supabase Auth deleted **only** `qa-member-20260919@example.test` and `qa-editor-20260919@example.test`. Final SQL returned `0` remaining Auth rows, `0` profile rows and `0` audit rows for those UUIDs; the real owner `recepkaanerkay@gmail.com` remained an `admin` (`owner_admin_intact = 1`). The test category and Storage object were already removed by the role script.

## Publication and production E2E

`scripts/verify-production-content.mjs` exercised article, project, FM mod, gallery and Lab entries against the live database and Worker. Each private draft route returned 404; each temporarily published route returned 200 with the expected SEO title/description and noindex directive. A future scheduled item stayed private. All six controlled content rows were removed in the script's cleanup block. Earlier Chrome checks also confirmed a staff preview, anonymous preview denial, generated cover, live Turnstile submission/inbox entry and appearance setting round-trip. The private `Production QA taslağı` draft remains in Studio for repeatable staff checks.

Final local `npm run verify` returned zero typecheck errors/warnings, 11/11 unit tests and a successful Cloudflare build. Local Chrome E2E passed 25/25. After account cleanup, `npm run test:e2e:production` passed 10/10: 12 public routes/assets, response/privacy headers, six viewports and mobile menu, console checks, plus six live axe scans. Those scans found no serious or critical WCAG 2 A/AA or 2.1 A/AA violation on TR/EN home, contact, account, archive and Studio sign-in. `npm audit --omit=dev --audit-level=high` reported zero high-severity vulnerabilities. Production Lighthouse on 19 September scored Performance 99, Accessibility 100, Best Practices 100 and SEO 100, with LCP 2.2 s and CLS 0; ignored local evidence is `test-results/lighthouse-production-2026-09-19.json`.

## DNS, Cloudflare and Search Console

Initial SERVFAIL came from lame Turhost delegation: parent NS pointed to servers returning REFUSED. Parent DS was absent, so DNSSEC was not the cause. After backup and rollback planning in `docs/dns-backup-2026-09-16.md`, registrar NS moved to Cloudflare's `kaiser.ns.cloudflare.com` and `serenity.ns.cloudflare.com`; DS/DNSSEC were not changed. Cloudflare serves three proxied Worker hostnames: apex, `studio` and `www`. The Worker holds `CONTACT_RATE_PEPPER`, `SUPABASE_SERVICE_ROLE_KEY` and `TURNSTILE_SECRET_KEY` as encrypted secrets. HTTPS and custom domains were verified in Chrome.

Before Search Console DNS changes, the Cloudflare zone was exported and the three Worker records omitted by that export were recorded. One apex TXT verified `palmarghe.com` domain ownership. Search Console processed `https://palmarghe.com/sitemap.xml` successfully and discovered 20 pages. Apex and Studio continued returning HTTPS 200, and the NS pair stayed intact. Backup and rollback details are in `docs/dns-search-console-2026-09-19.md`.

## External and user-dependent gates

1. **Custom SMTP and email callbacks:** Supabase custom SMTP is disabled. Real signup mail delivery, confirmation and reset callback cannot be certified without a mail provider and delivery access. Auth password login and role controls were verified independently.
2. **MFA:** Supabase TOTP is enabled at the provider, but app-level enrollment, enforcement and owner second-factor setup are not complete. Enforcing it on the real owner requires an intentional enrollment and recovery process.
3. **Cloudflare Access:** Zero Trust onboarding required a payment card, Terms acceptance and authorization for possible overage charges, including on Free. The flow was left for the account owner. Studio still requires server-side Supabase Auth and staff role.
4. **Search field data:** The new Search Console property is verified and its sitemap processed. Indexing reports and field Core Web Vitals need Google to collect data over time.
5. **Manual assistive-technology review:** Automated axe, keyboard navigation E2E, responsive and Lighthouse checks passed, but a human screen reader pass remains.

These external/user-dependent gates remain open in `docs/production-checklist.md` and do not block starting FAZ 2. No P0/P1 defect was found in the tested applicable FAZ 1 scope. FAZ 2 must re-audit this claim against its own requirements.

## GitHub and deployment verification

All changes were normal commits on `main`; the repository was clean and in sync before this report update. GitHub Actions Verify #20–#25 passed, including the live accessibility test commit `e1e963b`. The final documentation commit's action must also pass before FAZ 1 closure. Cloudflare's current production app remained healthy after the QA cleanup; documentation/test-only changes do not require a Worker redeploy.
