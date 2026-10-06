# Premium webmaster upgrade — active scope

User requested both the five technical/visual recommendations and all nine premium recommendations. This scope must not be reduced to the initial suggested four-feature package. Existing architecture, original media/content, accounts, security and Git history are preserved. No content production.

## Required evidence before completion

1. Shared design system: typography/spacing/buttons/cards/forms, both themes, all interaction/error/empty states; public and Studio desktop/mobile visual proof.
2. Studio simplification: grouped long settings, persistent save state, unified media/focus/preview, phone touch targets and virtual-keyboard layout.
3. Performance: responsive images and priority, reserved layout, measured CSS/JS and slow-network usability; record comparable lab samples without claiming field CWV.
4. Resilience: offline/timeout/double-submit, preserved input, safe retry, useful error tracking and rollback.
5. Visual automation: reproducible screenshot baselines for site/Studio/themes/devices, overflow/keyboard/essential transactions and post-deploy live checks.
6. Page transitions: restrained navigation, back scroll restoration and reduced-motion.
7. Refined configurable hero: ratio/depth/light, Studio appearance/intensity/motion controls.
8. Consistent micro interactions: cards/menu/buttons/save, reduced-motion and feedback.
9. Image inspection: zoom/fullscreen/keyboard/swipe and progressive image reveal using originals.
10. Staff command palette: Ctrl/Cmd+K, permitted sections/content/media and safe quick actions; role boundary and keyboard proof.
11. Live device preview: desktop/tablet/phone, beside fields, direct field selection from preview.
12. Trustworthy save history: time, changed-field summary, revision comparison and reversible restore after server confirmation.
13. Live health: actual release/service checks, failure records and performance trends; missing data explicitly marked unmeasured, private details never public.
14. Loading states: stable skeletons, pending indicator, controlled retry after reconnection.

Completion gate: local verify/full E2E, production deploy, actual Chrome/public/authenticated Studio, relevant production tests, QA cleanup, normal main push, green Actions, updated FINAL_REPORT.md with one current production state and evidence per requirement.

Baseline: main0c8e03d, Worker a622e0b3-d44b-4eb6-9087-062ab7084dbc. Chrome6 October confirms existing authenticated admin dashboard and live homepage. Status: in progress.

## Historical local implementation evidence — before the Aurora checkpoint

- Role-filtered Ctrl/Cmd+K palette with authenticated content/media discovery: local admin/editor/member/visitor boundary and keyboard/theme/overflow/axe tests passed.
- Original-image inspector: zoom, next/previous, focus return, load error/retry tested. Fullscreen and swipe are implemented but still need dedicated verification. Cover link now renders on the server to avoid delayed insertion shifting article layout.
- Admin-only health endpoint and panel: local permission and actual database measurement tests passed. Build metadata distinguishes modified working trees from committed releases. Server operation samples exclude form bodies and personal details; production instrumentation is not yet verified.
- Homepage preview adds tablet mode and keyboard/click selection of title/eyebrow/description fields. Changed-field summary and reversible unsaved changes passed local E2E. Revision comparison/restoration and full side-by-side device fidelity remain outstanding.
- Latest targeted tests: premium-studio 4/4, premium-gallery 1/1. Local verify previously passed 192 checked files and 178 unit tests; re-run after latest changes is underway.
- No deployment or new Git commit in this upgrade yet. All14 completion gates remain active; this is not a production-complete report.

Regression run: 81 local E2E scenarios executed, 78 passed initially. Three failures exposed two real regressions: low contrast of the palette shortcut badge and Ctrl+K competing with the editor link dialog. Badge now uses explicit theme foreground/surface; palette ignores handled events, editing fields and other open dialogs. All three affected scenarios passed after repair (16.4s). A clean full rerun and production gates are still required; no claim of 81/81 in one final run.

6 October checkpoint deployed: Worker28a50a81-dbd7-4ea5-a2c3-1368059977f9, source5d1d7c37ecaa. Clean full local83/83 and scoped production7/7 passed. Hidden Aurora added per user request; no normal third-theme option. Chrome confirms public desktop/390px and Studio, plus real health release/service measurement. Scope items11/12 and broader performance/visual/reliability gates remain incomplete; no goal-completion claim.

Next checkpoint, local only: revision comparison shows actual title/excerpt/document/status/type-data differences in bounded responsive columns; JSON text extraction counts real document words and treats markup as escaped text. Formatting-only changes and object-key ordering have dedicated unit tests. Restore requires a confirmed returned row, keeps editor panel navigation, and local adapter now mirrors revision capture for direct content updates. Current verify198 files zero diagnostics,181/181 units/build passed. End-to-end local compare/restore/third revision/320+1440 overflow/axe scenario passed1/1. Production deployment, staff boundaries and actual disposable-record restore verification remain outstanding. Changes are intentionally still in the worktree; this entry is not a release/completion claim.

Revision comparison local gate: full E2E84/84 passed in4.9m. Controlled restore scenario also confirms member403, editor303 returning to panel=editor, and a fourth revision preserving reverse restoration. Production proof remains pending; no production-complete claim.
