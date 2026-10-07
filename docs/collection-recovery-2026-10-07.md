# Collection recovery — local implementation checkpoint

Production release remains source7d9557c / Worker80cecf11-7e8b-4ed4-b483-1497ed01f085. Migration044 is applied and history-registered atomically. The dependent Worker changes are not deployed yet, so collection recovery is NOT production complete.

The existing uncommitted collection repair now uses one SECURITY INVOKER transaction for collection metadata and ordered relations. Staff role and explicit content capability are required. Anonymous reads are limited to published collections and due published content. Missing boolean/object input is rejected. Original creator is preserved and update time comes from the database.

Studio collection forms use the bounded save helper and retain input on errors. Editor success redirects preserve panel=editor, preventing successful saves from sending an editor to the inaccessible admin view. The local adapter mirrors validation, permissions, atomic validation-before-write and collection-item cascade.

Verified: actual migration SQL in PGlite, two tests covering atomic replacement, duplicate-item rejection, missing published value, creator preservation, capability denial, member denial, anonymous published/private filtering. Studio save plus collection unit scope24 passed. Astro234 files had zero errors/warnings/hints before the final redirect-only repair. Actual local Chrome E2E1/1 passed, demonstrating editor failed-save retained input, retry, saved-list visibility and reload persistence.

Full local109/109 E2E passed5.5m; 36/36 unchanged visual references passed34.2s.

Pending: Worker deployment, actual Chrome production verification, cleanup fingerprints, normal Git push and green Actions. Production preflight confirmed zero collections/links and missing anon/authenticated privileges on both tables. The migration was first exercised inside a rolled-back production transaction, then applied and registered atomically, and its rolled-back transaction/anonymous privacy/member denial proof passed again. No collection records were retained. Full verify234 files/212 units/build passed. Existing commits7d9557c and32381f7 were normally pushed after the transient GitHub500 cleared. Full fourteen-item scope remains active.

## Rollback

Rollback the Worker to80cecf11 if runtime verification fails. Retain additive RPC/grants/policies044: older collection requests remain compatible, and the stricter staff capability and public due-item boundaries must not be weakened. No bulk migration replay/history repair. Production preflight and proof were executed through the official linked Supabase CLI.
