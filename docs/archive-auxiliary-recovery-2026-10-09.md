# Archive density and Studio auxiliary recovery — 9 October 2026

## Current release checkpoint

Runtime106565f/Worker0dcec388-5a04-46ec-ad99-2bcbc54273da is deployed from a clean committed build after normal main push. Final local verify252 files/221 units/build,124/124 E2E5.4m and unchanged42/42 visual37.8s passed. Current live archive/media4/4 passed18.0s, including the formerly failing native no-JavaScript filter click. Full84/84 production passed6.0m; source Actions37888766838 is Success: verify8m50s (124 E2E7.3m), visual2m5s, production-smoke2m49s; total11m45s, inspected in connected Edge. Native connected Edge after this deployment confirms390px Aurora first title at687.59px, no overflow and preserved original cover; screenshot archive-compact-followup-live-2026-10-09.png. Viewport override reset. Studio-host nonstaff denial remains correctly enforced; no authorized native staff proof is inferred from the public-host staff link.

Later sections retain chronological local/first-release checkpoints, including the concrete failed live assertion. Their pending/deployment labels describe those earlier checkpoints, superseded by this opening state.

## Implementation

Phone archive filters use two columns for type/category, a full-width filter action and reduced section spacing. Optional year and reset controls retain their native GET behavior. Desktop category layouts and original covers are unchanged.

Studio translation, revision restore and native content management forms use the existing bounded save helper. They preserve their values on failure, prevent duplicate requests, and carry the page actor guard. Main editor publishing retains its own handler. Auxiliary operations are refused before sending when that editor has unsaved changes or another operation is pending. During an auxiliary request the editor is temporarily read-only; a failed request restores its previous controls and editability without claiming a successful save. Retry is explicit.

No production content/account/settings/SQL/Storage writes are part of this release. Local disposable fixtures are deleted by the tests.

## Local evidence

- Scoped archive/editor navigation/revision/translation recovery: 5/5 passed in24.8s. Recovery tests include320/1440px and dark/light/Aurora, serious/critical axe checks, exact preserved form payload, duplicate suppression, actual changed-session409 and verified successful retry.
- Verify:252 checked files, zero errors/warnings/hints;221 unit tests; build passed.
- Full local E2E:124/124 passed in5.5m, including real local publishing, translation pairing and revision capture/recovery. The negative unknown-category transaction fixture deliberately emits a rejected-save server log; the transaction test passed without inserting its row.
- Six archive visual references were added for390/1440px and three palettes. Existing36 references were preserved. All six new images were visually inspected. Baseline generation passed6/6; full comparison remains a separate gate.
- Final42-image comparison passed42/42 in37.8s without updating references, sequentially after the functional server exited.
- Hidden Aurora separately passed2/2 local and1/1 live tests, including persistence and public accessibility/overflow checks.
- Previous documentation commit9365ccf Actions37857925629 was observed completed successfully in the connected Edge browser (10m40s). This does not prove CI for the new worktree.

## Gates still required at this checkpoint

Clean normal commit/push/build/deploy, current production archive/full regression, connected live browser proof, current source Actions and final report update. This document records local progress, not a production completion claim. The full fourteen-item objective remains active.

## First live release and concrete follow-up

Source41c0d25 was normally pushed and deployed cleanly as Worker1a2d2a3d-0a55-4408-8a6c-19e429f96130. Native connected Edge390px confirms137.67px filter height, first real cover title at687.59px, no overflow, dark/light/Aurora and clean warning/error console. Original real covers remain present. Temporary viewport override was reset.

Focused live media checks passed3/3, but the added archive case failed at its JavaScript-disabled pointer click: existing noscript navigation was an always-open overlay over the filter action. This is an actual defect, not a reason to force-click or increase the timeout. Follow-up makes the mobile noscript menu normal-flow navigation and hides script-dependent toggle/theme controls. A stronger local and live assertion requires the menu to remain visible above main, the inert toggle absent, and the actual native filter click successful. Final local archive/category checks passed3/3 in12.0s after correcting the CSS specificity so the header grows with its navigation. This follow-up is not yet deployed at this checkpoint.

Source41c0d25 Actions37859878195 is terminal Failure: verify8m7s (124 E2E6.8m) and visual2m7s succeeded; production-smoke3m42s failed. This was inspected in connected Edge; its private job logs were not available in that browser session, so its exact failed assertion is not inferred from the summary. The independent local production run gives the concrete noscript pointer-interception evidence above. The follow-up requires fresh deployment and terminal production/CI checks.

Final follow-up local gates: verify252 files zero diagnostics/221 units/build; full124/124 E2E5.4m; unchanged42/42 visual37.8s, sequentially after that server exited. The strengthened no-JavaScript geometry/click check is included in the124-case full run. No screenshot references were changed by the fallback repair.

## Follow-up found during visual review

The shared newsletter consent sentence is split into separate flex items around its legal link. It remains readable but deserves a separate layout repair and meaningful keyboard/consent regression; do not silently replace existing visual references to hide the issue.

Fresh native current-source921px Aurora homepage also renders without overflow or console warnings/errors (aurora-home-followup-live-2026-10-09.png); its staff Studio entry wraps its arrow, a concrete intermediate-width visual follow-up. Historical clean mobile Lighthouse request inventory onb7d0682 shows comments.js (3612 transfer/7966 decoded), engagement.js (1360/2182) and library.js (2065/4212) downloaded on the homepage even though their relevant content/account/author controls are absent. These modules currently self-guard after download. Conditional loading is applicable next performance work; those historical bytes are not claimed current wire measurements or a measured future speedup.
