# Native Studio homepage containment — 9 October 2026

## Release checkpoint

Candidate verification: 261 checked files, zero diagnostics, 225 units and build; full local E2E 131/131 passed in5.9m. Original visual comparison passed36/42: only the six homepage-editor references changed, each by40px because Spotlight now puts its label above the full-width select. The actual desktop/light and phone/dark renders and difference were inspected; the change starts at Spotlight, preserves controls and shifts subsequent rows. Those six references were updated explicitly (6/6 in23.2s); the full comparison is running again without snapshot updates. Production remains4b5aeda until the clean release and native checks below complete.

## Historical discovery on source4b5aeda

Final local visual comparison passed42/42 in39.5s without updates after the six inspected homepage reference changes. Release and native/live/CI gates are next; the separate transition warning remains unresolved.

After normal sign-out and saved-credential sign-in, actual native Edge admin access is working on source4b5aeda / Worker db369c83-33e5-488a-b21b-af9833cd5e23. The homepage editor nevertheless overflows at921px: document client width906, scroll width999. The change bar and first hero panel span714px with right edge999; their fields extend to974. Dashboard and health had no overflow at this width. Screenshot: studio-homepage-overflow-before-2026-10-09.png. No production setting or original content was changed.

The current homepage form is a grid with an implicit auto-minimum column. Its full-width declaration does not constrain child min-content sizing. Candidate diagnosis is the form's min-content track combined with live selection labels/settings density; this must be verified by a meaningful local live-density fixture before changing CSS. Do not fix by hiding document overflow or clipping controls.

Current visual-polish coverage visits390/1440 and compares scrollWidth to innerWidth; it misses this intermediate-width defect and scrollbar width. Add901/921/1024/1100, use document.clientWidth and assert actual field/panel bounds, usable preview controls, all three themes and keyboard access. Existing42 references should remain unchanged unless an intentional visible difference requires inspection.

Separate transition follow-up: native account-to-Studio navigation logged InvalidStateError with ViewTransition opt-in disabled; the full local129-case run emitted an aborted-transition warning during tag navigation. Functional tests passed, but no clean native/server console claim is made. Investigate opt-in/cancellation behavior using primary browser documentation before choosing a repair; do not merely filter these errors out of tests.

Native command palette opened with input focus and found the real KaanBuilder publication. The connected-tool Escape action did not close it; the visible close control did close it and restored opener focus. Local real Playwright keyboard tests passed, but no current native Escape-success claim is made. Investigate the event/default-action behavior before attributing this solely to either the app or the tool.

Next gate: reproduce, repair, meaningful scoped proof, final local verify/full E2E/unchanged visual, clean normal push/build/deploy, current-source production/Actions and fresh native921px containment. The full fourteen-item scope remains active and this UX defect is not an external blocker.

## Local reproduction and candidate

Native select measurements identified Spotlight as the intrinsic-width trigger: longest label73 characters, rendered width541px; its row imposed a714px minimum on the form. The preview card select already had min-width0 and was not the cause. Initial test used a nonexistent hero_content_id and timed out; correcting to preview_content_id passed without reproducing the defect. The corrected Spotlight option fixture failed against unchanged CSS:901px client width,998px document width. This is the verified regression signal.

Candidate CSS gives the main form a minmax(0,1fr) column, allows panels/fields/selects to shrink and places Spotlight's label above its full-width control. Nothing hides document overflow or clips controls.901/921/1024/1100, all three themes, panel/select bounds, Tab focus and the actual390px device preview now pass. Combined existing device-preview checks passed5/5 in11.9s; the strengthened final containment check passed7.0s.

Palette fallback was also reproduced: a delivered Escape key event without native dialog cancellation left the dialog open in existing code. An explicit dialog Escape handler now closes it, uses the existing focus/abort cleanup and ignores composing/already-handled events. The regression includes IME composition preservation, closure, focus return and overlay-state removal. This does not claim a fix for the separate opt-in transition console error. Final combined scoped/full/visual/release/native gates remain required.

Combined final scoped10/10 passed19.5s. Verify passed261 checked files with zero diagnostics,225 units and build. Full131-case local regression has started; its terminal result, unchanged42-reference comparison and clean release/native/live/source CI gates remain required. Current production is still4b5aeda; neither candidate is claimed deployed.

Transition research: Chrome's [cross-document transition guide](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) requires both same-origin pages to opt in and excludes browser-UI/address-bar navigations and reloads. It also distinguishes skipped ready promises from completion. These rules make a normal menu-click comparison necessary; they do not by themselves prove the earlier connected-browser error is harmless or caused by the tool. No transition errors are filtered or global rejection handlers added.
