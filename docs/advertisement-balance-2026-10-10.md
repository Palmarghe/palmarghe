# Advertisement balance follow-up — 10 October 2026

> Historical checkpoint: the advertisement design and deployed state below were superseded by the sponsor-card rebuild and generated FM27/YouTube/GitHub release. See [current release audit](sponsor-card-rebuild-2026-10-10.md) and [FINAL_REPORT](../FINAL_REPORT.md). Uses of “current” below refer to that recorded checkpoint.


User follow-up: advertisement bands still look disproportionate. Native current runtime3ffa2b3 showed three equally aligned1377px bands but a70% copy area with sparse text and a30% artwork area: alignment alone did not solve visual balance.

Desktop composition is now50/50, tablet60/40. Phone28% artwork remains unchanged to preserve readable copy. Desktop/tablet minimum height112px; original images no longer contribute their intrinsic aspect ratio to grid-row sizing. Long text can expand normally; no line clamp or hidden content. Studio unsaved previews share these proportions. Visibility/device/scope/schedule/links/storage/settings are unchanged; no production data submission.

Meaningful local QA checks four widths/three themes, equal three-placement fixture heights, actual image/copy boundaries, exact desktop/tablet shares, WCAG, no horizontal overflow, hidden placements/no-image/long copy, original-setting restoration and unsaved Studio preview. Final scoped2/2 passed19.6s. First attempt was stopped after concurrent build/dev dependency-cache interference; two subsequent layout attempts caught intrinsic image height and absolute grid-area sizing; both fixed before final passing run. No pass is claimed for those failed attempts.

Verification checkpoint:282 files/zero diagnostics,244 unit tests and build passed before the final image-position correction (final committed build still required). Full visual comparison running; changed references must be reviewed, not blindly regenerated. Live deploy/current Chrome/source Actions and final documentation remain pending.

Advertisement follow-up final visual: initial comparison72/96 passed;24 expected compact-band geometry differences onhome/search/archive/advertising at768/1440. Reviewed full examples and24top contact tiles, retained old references under ignored test-results and Git history, replaced only those24 actual references. No tolerance/mask changes. Fresh final96/96 passed1.1m; final verify follows before normal clean build/deploy.

Final verification283files/zero diagnostics/244units/build passed. Normal clean source deb79ca pushed to main; clean build10Oct18:42:23 deployed Workerabccfe54-6e86-4345-8246-b2208e18d059. Four static modules/CSS assets on both domains:8/8 expectedMIME/200/exact buildbytes. Native authorized health source deb79cac0606/accessible services/database45ms.

Native public light desktop bands1377px atx24, three heights122.84; tablet705px atx24, three heights119.17. Actual Studio light previews three heights128.53, exact50/50 desktop and60/40 tablet. Phone public and Studio client/scroll305/305; Studio main controls bounded; edit link focusesheader_visible and announces ready. Public/Studio inspected console empty; preferences restored publicdark/Studiolight; temporary viewport reset. Three current native screenshots saved underdocs/advertisement-*-live-deb79ca.jpg.

Production initial10/11 passed1.8m:instantaneousdocument-width assertion failed in advertising. No root cause or permanent overflow established; unmodified advertising1/1 passed10.2s, then final combined11/11 passed2.1m. Current combined includes all sitemap pages in three widths/three palettes, ad split geometry/WCAG, console/security/assets/mobile theme. No test relaxation or violation filter. Source Actions38064685755 visual succeeded; remaining jobs pending at this checkpoint.

Current source Actions38064685755 verify completed successfully:281CIchecked files/zero diagnostics,244units,149/149 functional E2E10.3m. Visual job also successful; production-smoke follows. Local checked-file count283 includes ignored review artifacts, distinct from clean CI count281. Current release's complete functional proof is now recorded; predecessor count is not substituted for it.

## Completed release

Source Actions38064685755 verify, visual and production-smoke all completed successfully:149 functional cases,96 visual cases,244 units and33 live smoke cases. Native GitHub Chrome corroboration saved. Final current report and native proof JPEGs are documentation-only; the final evidence commit uses[skip ci] to avoid repeating the identical already-green runtime suite. Deployed runtime remainsdeb79ca. No force push, account/content/settings/media deletion or data submission. Current visual/advertisement requirement inventory has no remaining known P0/P1 defect or external blocker; separate fourteen-item technical scope remains open.
