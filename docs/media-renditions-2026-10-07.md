# Responsive original media — 7 October 2026

## Current checkpoint: deployed and prepared; final regression/CI pending

Original media files and rows remain unchanged. Studio can generate smaller 320/640/960px WebP versions from the actual original, without upscaling or cropping. Only files smaller than the original are accepted. A private job registers object paths before upload; descriptors become readable only after every intended object is confirmed. Public derivative reads follow the original parent visibility. Cleanup receipts retain completed and interrupted job paths.

Local E2E verifies a real failed request followed by a manual retry, original SHA256 preservation, actual decoded WebP dimensions, private anonymous 404 and write 401, published cover/body/search srcsets, referenced-media deletion protection and complete cleanup. The stale cover selector was corrected to the actual article image. Media permissions, revision references and separate cover editing also passed: 4/4 cases, 20.5s. Spotlight now receives the same readiness-bound srcset as cards and the visual reel. Final scoped checks must follow this last markup change.

Verify passed: 245 checked files with zero diagnostics, 43 test files / 221 tests, and build. Full local E2E is running at this checkpoint and has not yet been counted as passed.

Actual Supabase Chrome preflight confirms migration044 present, migration045 absent and no media_renditions table. The complete045 schema was executed inside a transaction ending in ROLLBACK; result rehearsal_passed / zero derived rows. This proves schema compatibility, not production role behavior or rollout. Subsequent read-only nine-table fingerprints exactly match docs/library-transaction-baseline-2026-10-07.json. No original production record or Storage object was changed.

Production follow-up: the rolled-back real admin/member/anon and Storage exercise passed (`role_rehearsal_passed`). It confirms incomplete-object rejection, complete/idempotent publication, private-job read denial, public parent-bound Storage reads and member/anonymous write denial. An initial proof transfer corrupted dollar quoting before execution; using a callback replacement preserved the SQL delimiters, and the corrected transaction passed. Migration045 and its migration-history row were then committed atomically. Read-only verification shows media_renditions present and history044/045 true. The complete nine-table result before/after is exactly equal. Native migration screenshot: media-renditions-migration-live-2026-10-07.png.

Runtime release: clean normally committed/pushed source e00f47b / Worker1b59e023-4cac-4984-9b19-136560928252. Full local114/114 E2E6.1m and unchanged visual36/36 comparisons38.0s passed. Actual Studio Chrome prepared29 WebP derivatives from10 existing originals;5 older originals have no stored dimensions and were preserved without rewriting their rows. Readiness survives reload. All eligible generated files are smaller than their originals. Native390px public Chrome selects640px derivatives without overflow and inspected warning/error logs are empty. Proof: media-renditions-studio-live-2026-10-07.png and media-renditions-mobile-live-2026-10-07.png.

Real production byte measurement (29 descriptors; equivalent-original sum compares each source once per width):

| Width | Files | Derived bytes | Equivalent original bytes | Reduction |
|---|---:|---:|---:|---:|
|320|10|107594|1010750|89.4%|
|640|10|304236|1010750|69.9%|
|960|9|448108|939770|52.3%|

Production responsive/permission/reservation6/6 passed18.0s. Tests decode real returned WebP files, compare dimensions/aspect and byte lengths, require private/no-store responses and deny invalid widths/anonymous generation/unknown parents. Existing reservation tests now delay the actual chosen candidate, retain655×1000 markup and <1px box/engagement shift limits. Initial full80 run encountered four stale original-only fixture failures; this partial run is not claimed as full green. Source CI37680371649 is fully green in actual Chrome: verify8m0s / visual2m17s / production-smoke2m37s, total10m47s. Final expanded full82 production run passed82/82 in6.4m. Latest typecheck246 files has zero diagnostics. New responsive cases are added to the production CI gate.

Remaining release gates: final full production regression, sequential performance lab comparison, source/documentation CI and final report update. Wider fourteen-item premium scope remains active.

Final full production run82/82 passed6.4m, after correcting the four original-only reservation fixtures. Sequential Lighthouse13.5.0 / installed Chrome154 mobile samples then measured home95 / LCP2.701s / transfer680648 bytes and KaanBuilder96 / LCP2.415s / transfer365644 bytes. Both have CLS0/TBT0 and accessibility/best-practices/SEO100. The earlier single-sample baseline was home96 /2.629s /855629 bytes and article87 /3.833s /479945 bytes. Samples include intervening application changes and normal network variance; they are not a causal-only experiment or median. Home score/LCP did not improve in this sample despite reduced transfer. Article document latency1174ms and remaining image-size savings162331 bytes identify further concrete performance work. Bounded settings/results/CSS/JS transfer are recorded in media-renditions-performance-2026-10-07.json. Documentation/test commit8350078 is normally pushed; expanded CI37682339676 is fully green in actual Chrome, total13m51s. Runtime source e00f47b CI is fully green.

Post-preparation integrity: all nine original-table fingerprints still match exactly. Actual source coverage SQL returns15 originals /5 without recorded dimensions /7 public originals /0 public originals missing measurements. Every currently public original is prepared. Read-only real private-original proof in docs/sql/media-renditions-private-read-proof.sql clears anonymous JWT claims, then verifies original rows, derivatives and Storage metadata are invisible to anon and the actual existing member; result private_original_and_derivative_reads_denied. It creates or deletes no record.

Rollback: old Worker continues using original files. New derivative tables/objects can remain private and unused while code is normally reverted; do not drop originals or replay unrelated migrations. Restore cleanup RPC compatibility before reverting the additive schema if schema rollback is actually needed.
