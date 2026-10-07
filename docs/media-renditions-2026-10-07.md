# Responsive original media — 7 October 2026

## Current checkpoint: local implementation, production rehearsal only

Original media files and rows remain unchanged. Studio can generate smaller 320/640/960px WebP versions from the actual original, without upscaling or cropping. Only files smaller than the original are accepted. A private job registers object paths before upload; descriptors become readable only after every intended object is confirmed. Public derivative reads follow the original parent visibility. Cleanup receipts retain completed and interrupted job paths.

Local E2E verifies a real failed request followed by a manual retry, original SHA256 preservation, actual decoded WebP dimensions, private anonymous 404 and write 401, published cover/body/search srcsets, referenced-media deletion protection and complete cleanup. The stale cover selector was corrected to the actual article image. Media permissions, revision references and separate cover editing also passed: 4/4 cases, 20.5s. Spotlight now receives the same readiness-bound srcset as cards and the visual reel. Final scoped checks must follow this last markup change.

Verify passed: 245 checked files with zero diagnostics, 43 test files / 221 tests, and build. Full local E2E is running at this checkpoint and has not yet been counted as passed.

Actual Supabase Chrome preflight confirms migration044 present, migration045 absent and no media_renditions table. The complete045 schema was executed inside a transaction ending in ROLLBACK; result rehearsal_passed / zero derived rows. This proves schema compatibility, not production role behavior or rollout. Subsequent read-only nine-table fingerprints exactly match docs/library-transaction-baseline-2026-10-07.json. No original production record or Storage object was changed.

Production follow-up: the rolled-back real admin/member/anon and Storage exercise passed (`role_rehearsal_passed`). It confirms incomplete-object rejection, complete/idempotent publication, private-job read denial, public parent-bound Storage reads and member/anonymous write denial. An initial proof transfer corrupted dollar quoting before execution; using a callback replacement preserved the SQL delimiters, and the corrected transaction passed. Migration045 and its migration-history row were then committed atomically. Read-only verification shows media_renditions present and history044/045 true. The complete nine-table result before/after is exactly equal. Native migration screenshot: media-renditions-migration-live-2026-10-07.png.

Remaining release gates: full local and visual tests, normal source commit/push, clean Worker deploy, existing-original derivative preparation, production E2E and measured image bytes/performance comparison, native Chrome verification, CI and final documentation. Wider fourteen-item premium scope remains active. The current Worker still serves the prior source until the runtime release below is recorded.

Rollback: old Worker continues using original files. New derivative tables/objects can remain private and unused while code is normally reverted; do not drop originals or replay unrelated migrations. Restore cleanup RPC compatibility before reverting the additive schema if schema rollback is actually needed.
