# Media reference safety audit — 2 October 2026

## Change and purpose

Migration `202610020036_media_references.sql` derives private normalized references from current body image/gallery nodes, gallery metadata, cover/OG IDs, and saved revision body/gallery data. Restrictive foreign keys protect referenced media metadata even if a usage preflight races a content writer. Anonymous media/Storage visibility is based on current publication eligibility, never revisions. Direct authenticated Storage deletion requires deleting metadata first through its FK guard. No original content, revision, media or Storage records were edited by the migration.

The Worker checks `media_has_references` before deletion, denies failed/nonboolean checks, and maps FK conflicts to HTTP409 without touching Storage. Local/test adapter models references, publication visibility, content/revision cascading and permission checks. It does not simulate native PostgreSQL concurrency or every Storage policy.

## Production evidence

Applied through authenticated Chrome to Palmarghe Production (`ozztqhiqzchlbxscbwhy`), PostgreSQL17.6. SQL Editor reported success. Preflight: current references8, revision references2, missing references0. Postflight: derived rows8/2; source content12, revisions8, media7, Storage7.

All four before/after fingerprints also match after the rollback QA:

| Source | MD5 comparison fingerprint |
| --- | --- |
| Content | da994147bf5e708510de8bb3c773d999 |
| Revisions | 82bcbe7e2efb4d5157b6f5cc51d36c95 |
| Media | 81fadd99e1a17df128e72179e68b219b |
| Storage metadata | 55c6aa7a6cdfe66fa650b554649d3084 |

These are change-detection comparisons, not credential hashes or a substitute for a database backup. Saved prior policies/rollback notes: `media-references-before-2026-10-02.sql`. No file bytes were modified.

Production `media-references-production-qa.sql` runs in a transaction ending ROLLBACK. Seven checks passed: an actual referenced media metadata DELETE is rejected by FK even as owner; two restrictive guards exist; anon cannot read reference tables/call usage helper; actual anon and authenticated-without-permission calls reject; anonymous visible media is publication eligible. No committed QA records or real Auth account changes. This is not a fresh production editor/admin mutation matrix, concurrent load test, or physical Storage file deletion test.

Screenshots: `media-references-production-2026-10-02.png`, `media-references-production-qa-2026-10-02.png`. Query sources: preflight/postflight/production-qa SQL files.

Worker `5a7488ea-cfdd-4536-9337-87b35d16e058` deployed after the database migration. Real Chrome home: ten loaded images, no broken image in that rendered view; search has native text pointer/accent caret and native button pointer.

## Tests

- PostgreSQL-in-WASM tests10/10 apply the actual migration to a production-shaped narrow fixture: nested backfill, draft/due/archived visibility, real FK, private helpers/tables, Storage metadata-first deletion, revisions, missing-reference rollback, gallery/OG/cover, idempotency.
- Worker deletion guard tests7: RPC unavailable/malformed, references conflict, both FK error codes preserve Storage, metadata-before-Storage ordering. Physical orphan cleanup failures are not covered as solved.
- Local Chrome media suite4/4: permitted editor CRUD, body-image privacy/public rendering/revision retention and cleanup, admin media/settings, gallery publication/caption.
- Production Chrome23/23: images, desktop/mobile search/network/focus, custom pointer outside search, native pointer inside search, responsive layouts/form routes, console, security/privacy, same-origin write boundaries on apex/Studio. No production content/profile/media writes in browser tests.
- `npm run verify` final results recorded in FINAL_REPORT. Dependency: PGlite0.5.8 is test-only. Transitive devalue updated5.9.4; npm audit including dev dependencies reports0 vulnerabilities. No exploit claim.

## Limitations and next work

Upload decoding/byte-validity checks, orphan Storage cleanup and honest cleanup-failure UX remain open. The metadata/reference race is guarded by database constraints; file deletion and metadata deletion are not one distributed transaction. Test adapters and green test totals do not prove all webmaster requirements. Physical Safari/Firefox/AT checks, broad form/state matrices and performance gates remain separate open work.

## Rollback

Revert the Worker dependency on the usage RPC first if schema rollback is necessary. Prior read/delete policies can be restored using the saved file; keep the derived reference tables/FKs by default. Dropping derived schema requires a reviewed maintenance step after reverting the Worker; it does not require editing source documents or files. Current migration is idempotently tested; migrations must be applied before deploying a dependent Worker.

Additional production body-media regression1/1: existing public FM26 article’s two actual /api/media images load anonymously on 390/1440px × dark/light, real image bytes/MIME/nosniff verified, serious/critical WCAG2.2 axe scans pass in those four combinations; unknown UUID404. Source: e2e-production/media-references.spec.ts. This closes actual public-body load evidence for that controlled existing article, not a production staff write matrix.

## CI isolation follow-up

Initial release CI36990797101 failed three sign-in scenarios (51 passed): the new multi-login media workflow exhausted the shared local-adapter login bucket. A local full run reproduced `Rate limit exceeded`. The new workflow now uses its own reserved test IP198.51.100.250; production Auth limits/code were not changed. The next full local run passed those three scenarios and53 tests, but one existing FM-mod test navigated before the asynchronous editor save redirect completed (`ERR_ABORTED`). That test now waits for the saved content table row before opening the public page; its targeted rerun passed. The final full-suite/Actions gate is checked after this follow-up push. Failed observations are retained rather than called production bugs or omitted.

The next local full run again passed53/54: the same async save/navigation race appeared in the existing translation-pair scenario. Both translation saves now wait for their persisted table cells; translation/FM targeted2/2 passed. Full-suite validation follows the final test-only commit. Production remains Worker5a7488ea; no redeploy is required for these test synchronization changes.

Final sequential local full Playwright suite54/54 passed with quota isolation and both save-navigation waits. Prior follow-up1fd852d Actions36991852507 succeeded. Final code verification artifact: https://github.com/Palmarghe/palmarghe/actions/runs/36992173418 ; the subsequent documentation commit’s Actions status is checked separately after push. The full webmaster objective remains open.
