# Measurement write boundary — 1 October 2026

## Production migration

`202610010035_measurement_worker_boundary.sql` was applied to the existing production project through its Chrome SQL Editor and registered in `supabase_migrations.schema_migrations`. Only execute grants changed; existing aggregates, visitors, content and Auth records were preserved.

| Function | Before anon / authenticated / service_role | After |
| --- | --- | --- |
| `record_traffic_visit(text,uuid)` | true / true / false | false / false / true |
| `record_qualified_traffic_visit(text,uuid,text)` | true / true / false | false / false / true |
| `record_content_engagement(uuid,text)` | true / true / false | false / false / true |

The database owner retains administration access. Staff traffic reads and public aggregate reads retain their existing permissions. Chrome verified that the authenticated Studio traffic report remained accessible.

## Worker boundary

Same-origin checks, schema validation, Studio path exclusion and known-bot exclusion precede privileged writes. The server-only client uses the existing Worker secret, disables session persistence/refresh, and never forwards that key to the browser. A peppered IP hash scoped by measurement endpoint is passed to the existing private rate RPC; raw IP is not added to the traffic tables. Limits are 30 requests per 60 seconds per IP per endpoint, within the existing RPC's allowed parameter range. Missing configuration/rate-service failure returns 503, exhausted allowance returns 429, before counter writes. Shared networks can reach this limit collectively. The local adapter uses the same measurement window while keeping existing Auth's 15-minute default.

The initial validation deployment used a rate value outside the existing database RPC's allowed range; this was corrected to 30 before successful positive production verification. Failed validation requests fail closed and are not counted. The initial grant inspection also showed that service_role required explicit execute grants; the migration supplied them atomically with the anonymous grant removal. This record does not claim an uninterrupted counter collection during the deployment verification window.

## Controlled production evidence and cleanup

`node --env-file=.env.production scripts/verify-measurement-boundary.mjs` uses public configuration, prints no keys, and passed all five assertions:

- Three actual anonymous Supabase RPC requests rejected with PostgreSQL code `42501`.
- A Worker traffic write accepted with HTTP 204 after migration.
- A Worker engagement write for an absent QA content slug returned 404, without changing a real article's metrics.

The unique path `/qa-measurement-boundary-20261001/` had **0 / 0 / 0 / 0** rows before QA in `traffic_daily`, `traffic_visitors`, `traffic_qualified_daily`, `traffic_qualified_visitors`. The single permitted Worker event produced **1 / 1 / 1 / 1**. A transaction deleted only that exact reserved path from those four tables; a follow-up SQL query confirmed **0 / 0 / 0 / 0**. No real content, visitor path, Auth account or historical aggregate was cleared.

A separate burst of 31 requests for the absent QA content produced **30 × 404, 1 × 429**. Those requests only exercised the private rate ledger; they did not create traffic or engagement events. Automated production browser testing intercepts synthetic writes before they reach counters.

## Reporting corrections

Pageview/organic totals exclude advertising click and Studio paths. Advertising events remain visible in the event table. Summed daily/path visitor counts are labelled as such, rather than site-wide unique people. The interface states that browser-reported attribution does not certify human traffic, and that pre-1-October aggregates may include previous classification/test artifacts. Report totals describe the displayed records in the last 30 days (the query has a 500-row cap), rather than claiming a complete unlimited aggregation. Existing historical rows have not been rewritten.

## Rollback plan (not executed)

If a full rollback is required, first restore execute grants to `anon,authenticated` for the three functions, then roll the Worker back to the preceding anonymous-writer version `88cfc28d-95da-4cfe-a605-468d49cdba97`. Only after that Worker is restored, revoke those three execute grants from service_role to match the inspected original state. Use a new corrective migration to record the rollback; do not erase migration history. This rollback reopens the original bypass and is an incident recovery option, not the preferred state. No counter restoration is needed because the migration does not alter counter rows.

## Limits and remaining scope

The execute bypass is closed. Browser attribution remains spoofable; absent referrer data, blockers, multiple devices, NAT and throttling limit statistical accuracy. Old bot/test and source-classification artifacts cannot be reliably reconstructed and have not been re-labelled. This is not certified organic/human traffic. Retention/cleanup of the existing private rate ledger and full analytics/privacy/performance coverage remain part of the broader audit.


## Current production state — 1 October 2026, search pointer follow-up

Worker `fb1a8e0d-63ae-4147-bc3e-9efb75dd0b55` is live. Search now uses native pointers throughout its modal: text/caret in the input, pointer on buttons and links, auto on the backdrop. The decorative brand cursor is hidden only while search is open and restored on close. This supersedes the earlier top-layer reparenting implementation below. Mouse and Ctrl+K opening, repeated close/reopen and both themes are covered; real Chrome confirmed input focus, text pointer, accent caret and a live Lamine result.

Production migration `202610010035_measurement_worker_boundary` is applied and journalled. All three measurement RPCs deny anon/authenticated execution and allow the private Worker service role. Worker writes use a peppered IP hash and a 30-request/60-second endpoint rate window; missing configuration or rate-provider errors fail closed. Controlled anonymous RPC calls returned 42501; Worker traffic returned 204, absent-content engagement 404. The reserved QA path was verified 0→1→0 in all four traffic tables. A 31-request absent-content burst returned 30×404 and 1×429, without engagement rows. See `docs/measurement-boundary-2026-10-01.md` for initial fail-closed verification issues and rollback.

Studio pageview totals exclude ad clicks and Studio paths. Daily/path visits are no longer presented as global unique visitors. Attribution and historical-data limitations are displayed; historical rows are preserved. Authenticated Chrome confirmed the deployed labels. Metrics are not certified organic or human traffic.

Verification: Astro 0 diagnostics, unit 46/46, build successful. Full local suite before the pointer follow-up 47/47; added local pointer regression 1/1. Live Chrome search/cursor 8/9 initially, with one obsolete top-layer expectation; the corrected semantic test passed on rerun. Analytics, semantic cursor, security headers and console rerun passed 5/5. The other eight initial search/cursor cases passed, including mobile search, keyboard navigation, network recovery, modal focus/scroll, device/theme and rendered pointer tracking. Previous commit 9870bf0 Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36918416447. Current CI is checked after push. The broader audit remains active.

Earlier deployment and test counts below are historical evidence, not the current production state.

