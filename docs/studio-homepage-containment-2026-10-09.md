# Native Studio homepage containment — 9 October 2026

## Unresolved observed defect

After normal sign-out and saved-credential sign-in, actual native Edge admin access is working on source4b5aeda / Worker db369c83-33e5-488a-b21b-af9833cd5e23. The homepage editor nevertheless overflows at921px: document client width906, scroll width999. The change bar and first hero panel span714px with right edge999; their fields extend to974. Dashboard and health had no overflow at this width. Screenshot: studio-homepage-overflow-before-2026-10-09.png. No production setting or original content was changed.

The current homepage form is a grid with an implicit auto-minimum column. Its full-width declaration does not constrain child min-content sizing. Candidate diagnosis is the form's min-content track combined with live selection labels/settings density; this must be verified by a meaningful local live-density fixture before changing CSS. Do not fix by hiding document overflow or clipping controls.

Current visual-polish coverage visits390/1440 and compares scrollWidth to innerWidth; it misses this intermediate-width defect and scrollbar width. Add901/921/1024/1100, use document.clientWidth and assert actual field/panel bounds, usable preview controls, all three themes and keyboard access. Existing42 references should remain unchanged unless an intentional visible difference requires inspection.

Separate transition follow-up: native account-to-Studio navigation logged InvalidStateError with ViewTransition opt-in disabled; the full local129-case run emitted an aborted-transition warning during tag navigation. Functional tests passed, but no clean native/server console claim is made. Investigate opt-in/cancellation behavior using primary browser documentation before choosing a repair; do not merely filter these errors out of tests.

Native command palette opened with input focus and found the real KaanBuilder publication. The connected-tool Escape action did not close it; the visible close control did close it and restored opener focus. Local real Playwright keyboard tests passed, but no current native Escape-success claim is made. Investigate the event/default-action behavior before attributing this solely to either the app or the tool.

Next gate: reproduce, repair, meaningful scoped proof, final local verify/full E2E/unchanged visual, clean normal push/build/deploy, current-source production/Actions and fresh native921px containment. The full fourteen-item scope remains active and this UX defect is not an external blocker.
