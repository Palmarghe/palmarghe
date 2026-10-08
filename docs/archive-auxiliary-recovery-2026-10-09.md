# Archive density and Studio auxiliary recovery — 9 October 2026

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

## Follow-up found during visual review

The shared newsletter consent sentence is split into separate flex items around its legal link. It remains readable but deserves a separate layout repair and meaningful keyboard/consent regression; do not silently replace existing visual references to hide the issue.
