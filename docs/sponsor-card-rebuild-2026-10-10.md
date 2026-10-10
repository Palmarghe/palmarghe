# Sponsor card rebuild — 10 October 2026

## Requested replacement
The user rejected the previous wide advertisement bands and requested a fresh, aligned design with independent visibility and clearer management. The old split-band presentation was removed, preserving existing production advertisement records, original artwork, placement keys, authorization, analytics hooks, scheduling and device/page filters.

## Implemented design
- Shared neutral editorial card: small framed original artwork on the left, title/description in the middle, restrained action arrow on the right. No billboard artwork, overlaid text or fixed half-empty image panels.
- Public header/article/footer placements follow the same content gutters at desktop, tablet and both narrow-phone breakpoints. Missing artwork does not leave an empty image column. Hidden placements render no reserved space.
- Dark, light and hidden Aurora use existing theme variables. Text contrast is audited; the theme background changes immediately, without a low-contrast interpolation.
- New Studio manager: compact placement shortcuts, native accordion panels, explicit show/hide state, simple copy/link/image controls and per-panel unsaved live preview. Device/page/schedule/AdSense controls are disclosed as advanced settings.
- Dashboard edit links open the requested panel on initial hash navigation. In-page shortcuts open it, focus the visibility control and announce the destination. Native panels also work independently of JavaScript.
- Existing pending, duplicate-submit prevention, input recovery, saved time and undo behavior remains integrated. Hidden/closed panel fields are still saved together. Invalid native fields open their containing panels before validation focus.
- AdSense preview explicitly describes runtime-delivered advertising rather than pretending a first-party sample is the Google result.

## Review and test record
- First focused attempt found contrast interpolation; removed background interpolation. Another attempt found breakpoint gutters and small CTA contrast; corrected the implementation without relaxing tests.
- Full initial visual comparison: 60 unchanged, 36 intentional differences (home/search/archive/advertising × 3 widths × 3 themes). Review exposed an injected preview-device toolbar occupying a grid column; wrapped the toolbar/preview in one column and added a physical alignment assertion.
- Reviewed all 36 replacement references using contact sheets and full-size Studio/public examples. Updated only these references, preserving all original comparison thresholds/masks. Final full visual comparison: 96/96 passed in 1.2 minutes.
- Focused local advertisement/navigation run: 18/18 passed in 39.3 seconds, including persisted edits and unchanged closed-panel fields; local test configuration restored in finally blocks. No production setting was written by these tests.

## Release evidence
Final local verify: 284 checked files, zero diagnostics, 244/244 unit tests and build passed at19:59:48 Istanbul. Final focused advertisement run including the AdSense preview assertion:3/3 passed in29.9s. Deployment, production Chrome checks and source GitHub Actions evidence will be recorded here after they finish. The previous deployed runtime remains historical evidence in advertisement-balance-2026-10-10.md.
