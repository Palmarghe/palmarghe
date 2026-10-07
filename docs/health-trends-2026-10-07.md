# Sampled Studio operation trends — 7 October 2026

## Implementation

Admin-only live health retains actual release/build/service/database checks and the existing last50 persisted request observations. It adds rolling24h sample count, median and nearest-rank p95 milliseconds, failed sample count/rate, previous24h sample comparison (minimum5 per interval), and seven rolling24h buckets. Missing measurements remain null/Ölçülmedi rather than invented zero latency or uptime. The actual sample period, bounded50-record capacity and possible incomplete windows are shown. Comparisons explicitly describe sample differences, not global performance. Request bodies, account identifiers, tokens and publication paths remain absent from the API payload.

No database migration, new permissions, tracking, credentials or production content/account changes are required. Existing service-role audit insertion and admin-only read remain unchanged. These are sampled Studio request durations; not organic traffic, field Core Web Vitals, all requests, distributed tracing or uptime. The existing best-effort30-second actor/status sampling is unchanged. Samples are aggregated at read time, with exact rolling boundaries and invalid/future observations excluded from summaries.

## Local evidence so far

219 Astro files, zero diagnostics;192/192 units/build passed. Five new units cover missing data, exact time windows/quantiles, malformed/future values/capacity and minimum sample comparison and capacity warnings after malformed persisted rows are discarded. Targeted health/palette/preview/role tests5/5 passed16.1s after a genuine dark-theme health refresh contrast defect was found and repaired. New local E2E verifies real API aggregation envelope, controlled rendering fixture,390/1440 dark/light/Aurora axe/overflow, failed refresh retaining prior measurements, and explicit successful retry without duplicate widgets. Fixtures are local only and are not claimed as production observations.

Full local95/95 E2E passed4.3m; unchanged original30-reference visual comparison passed32.5s. Added six fixed local health-panel references without rewriting the original thirty; full unchanged-reference36/36 comparison passed32.6s. Health phone light and desktop Aurora renders were inspected. Final capacity-warning verify219/192/build and scoped health/Studio5/5 passed20.3s. Production rollout/actual authenticated Chrome/CI verification remain pending. No completion claim for the broader fourteen-item programme.

## Rollback

Normal Git revert and clean build/deploy. No stored sample/history removal and no database/Auth rollback are needed. Original publications, media, homepage choices and Git history remain preserved.
