# Production operation observation repair — 6 October 2026

## Root cause and change

Read-only production SQL confirmed service_role INSERT on audit_logs=false and sequence USAGE=false; no studio_request rows existed. Migration202610060041 grants only table INSERT and identity-sequence USAGE to the existing Worker service role. Browser anon/authenticated INSERT remain false; existing RLS read policies are retained. No source code or Worker secret changed.

The migration and its history entry were applied together in a transaction through the already authenticated Supabase CLI Management API to projectozztqhiqzchlbxscbwhy. A follow-up privilege query confirmed both Worker grants true, browser INSERT false, and history version202610060041 present. Previously applied036–040 have not been registered in remote migration history (latest pre-repair version035); reconcile them from actual catalog evidence before using bulk db push/include-all. They were not replayed by this repair.

## Evidence

- PostgreSQL WASM test executes the real migration: Worker insert succeeds; anon/authenticated writes fail; unnecessary service-role SELECT/UPDATE/DELETE are not granted by this migration.
- Verify199 files: zero diagnostics;182/182 units and build pass. Targeted local premium Studio E2E4/4 passes. Previous full84/84 and production12/12 release gates remain recorded separately.
- Actual Chrome reapplied current archived QA revision9 without changing its values. Production health recorded19:04:15,302ms,HTTP303.
- A duplicate published URL was entered only in the disposable QA form. The database rejected the transaction, the editor retained title/body/status/URL and showed a readable duplicate-URL error. Restoring the QA URL and retrying succeeded. Health recorded19:06:07,859ms,HTTP400 and19:06:24,335ms,HTTP303.
- QA remains archived as Production QA taslağı with slugqa-production-draft. No original publication, account, media or site setting was edited or removed. Operation rows are genuine diagnostic evidence and retained.
- Screenshot: health-live-observation-2026-10-06.png. Worker remains61c892a5-c187-40c0-a87b-0992e707bdb1/source52d4b9e8818a; no Worker redeployment is necessary for this database permission repair.

## Limits and rollback

These are sampled authenticated Studio request durations, not organic traffic, field Core Web Vitals or comprehensive tracing. Samples exclude titles, paths, form bodies, tokens and exception details. Server insert timeout is2s; sampling is per actor/status group per Worker instance, so the30s interval is best effort across distributed instances.

Rollback grants with `revoke insert on public.audit_logs from service_role; revoke usage on sequence public.audit_logs_id_seq from service_role;` through a normal reviewed migration. Keep existing diagnostic rows and all RLS policies; do not delete history or original data. Full14-item premium scope remains active; this fixes the production persistence evidence for item13 without closing unrelated work.
