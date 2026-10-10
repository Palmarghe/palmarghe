# Advertisement balance follow-up — 10 October 2026

User follow-up: advertisement bands still look disproportionate. Native current runtime3ffa2b3 showed three equally aligned1377px bands but a70% copy area with sparse text and a30% artwork area: alignment alone did not solve visual balance.

Desktop composition is now50/50, tablet60/40. Phone28% artwork remains unchanged to preserve readable copy. Desktop/tablet minimum height112px; original images no longer contribute their intrinsic aspect ratio to grid-row sizing. Long text can expand normally; no line clamp or hidden content. Studio unsaved previews share these proportions. Visibility/device/scope/schedule/links/storage/settings are unchanged; no production data submission.

Meaningful local QA checks four widths/three themes, equal three-placement fixture heights, actual image/copy boundaries, exact desktop/tablet shares, WCAG, no horizontal overflow, hidden placements/no-image/long copy, original-setting restoration and unsaved Studio preview. Final scoped2/2 passed19.6s. First attempt was stopped after concurrent build/dev dependency-cache interference; two subsequent layout attempts caught intrinsic image height and absolute grid-area sizing; both fixed before final passing run. No pass is claimed for those failed attempts.

Verification checkpoint:282 files/zero diagnostics,244 unit tests and build passed before the final image-position correction (final committed build still required). Full visual comparison running; changed references must be reviewed, not blindly regenerated. Live deploy/current Chrome/source Actions and final documentation remain pending.

Advertisement follow-up final visual: initial comparison72/96 passed;24 expected compact-band geometry differences onhome/search/archive/advertising at768/1440. Reviewed full examples and24top contact tiles, retained old references under ignored test-results and Git history, replaced only those24 actual references. No tolerance/mask changes. Fresh final96/96 passed1.1m; final verify follows before normal clean build/deploy.
