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

Historical revision comparison release: Worker61c892a5-c187-40c0-a87b-0992e707bdb1/source52d4b9e8818a. Final production Aurora/smoke/showcase12/12 passed. Actual admin Chrome QA title-only save created revision8; comparison with original archived revision7 showed exactly one differing field. Confirmed restore created revision9 and title/excerpt/body/status/type-data equal the recorded baseline. No original publication/account/media/settings changed. Fresh QA console warnings/errors none. Health confirms source/build and real45ms database check, but no operation samples appeared after the save/restore: instrumentation persistence needs investigation and is not complete. Full14-item goal remains active. Implementation52d4b9e was normally pushed; new CI results still require inspection. Evidence: revision-production-restored-2026-10-06.png.

Operation persistence follow-up supersedes the missing-sample state above: production SQL identified missing service-role INSERT/sequence privileges; migration202610060041 repairs only those grants. Browser writes remain denied. Chrome confirms real302ms/303,859ms/400 and335ms/303 samples. Duplicate-URL save preserves inputs and retry succeeds; QA remains archived at original title/body/URL. Verify199 files zero diagnostics/182 units/build, PostgreSQL privilege test1/1 and targeted Studio E2E4/4 pass. Implementation52d4b9e CI37491867043 is green; e90854f CI37492288053 full84 verify passed with production smoke still running at inspection. Evidence/limits/rollback: health-observation-2026-10-06.md. Remaining14-item requirements are still active.


Gallery checkpoint supersedes prior inspector limitations: Worker7b1c8db9-0616-4c74-884f-f602d7ce67bc/source8c64b18. Verify199 files/182 units/build, full86/86 and production modal/Aurora/smoke11/11 passed. Trusted touch swipe/native fullscreen plus fallback reset are covered; real Chrome original-image mobile/fallback proof is saved. Actions37494883791 is green (8m20s). See gallery-inspector-2026-10-06.md. The full14-item scope remains active.

7 October local navigation follow-up: reduced-motion CSS cascade defect reproduced and repaired; real footer navigation/back restores reading position within10px. Targeted2/2 and verify200 files/182 units/build pass; clean full88/88 passed in4.1m after repairing a theme-switch button contrast defect. This change is not yet deployed. See navigation-motion-2026-10-07.md.


7 October production release supersedes local-only navigation state: Worker d13d5a3c-2cf6-4fe4-98a0-f3bf24e6b7f6/source40bbe9b, clean verify201 files/182 units/build, full88/88 and production navigation/modal/Aurora/smoke12/12 passed. Actual Chrome Studio dark/light and390px confirm bounds and synchronized button surfaces, no console warnings/errors. Main pushed normally; Actions37533452974 is running at inspection. Fresh sequential mobile lab home96/LCP2.629s and KaanBuilder87/LCP3.833s, both CLS0/TBT0, identifies article request latency and responsive original-image delivery as concrete remaining work. See navigation-motion-2026-10-07.md and performance-lab-2026-10-07.md. Full14 scope remains active.


Historical7 October device-preview checkpoint: Worker982caecf-ea5e-4368-a376-f837474c7378/ee122ed45712. Requirement11 now uses the actual shared public renderer at1440/768/390px beside fields with direct selection. Admin-only/private framing, source/origin checks, no-POST controls and failed/stalled load preservation are tested. Verify208/182/build; earlier full90/90 and final targeted4/4; production13/13 before final CSS polish and2/2 after. Actual admin Chrome confirms final geometry/focus/Undo/mobile-preview/light theme, no console warnings/errors, no production settings writes. See homepage-device-preview-2026-10-07.md. Actions37537106330 succeeded8m35s, with one cover-upload retry. Automated30-screen comparison now passes locally; Windows CI remains pending. Requirement5 baselines and7 hero visual controls, measured renditions/performance/reliability/trends remain outstanding; full objective is active.


Visual gate release7 October: Workerf873c119-8777-47d9-b761-ae46784e2ccd/source12ac328. Verify210/182/build, clean full92/92, updated cover-upload response1/1 and final visual30/30 comparison31.2s passed. Actual Chrome390px confirms loaded real preview, single-line controls and no overflow/console warnings/errors; original saved title verified after reload. Latest production13-case regression and new Windows Actions37538970760 are running. This improves requirement5 but does not claim all14 requirements completed. Next outstanding product work includes hero appearance/intensity/motion controls and measured responsive media/performance/resilience trends.


Adapter repair gate: verify211 files/184 units/build passed; full functional91/92 exposed a newsletter consent link color-transition contrast issue during theme change. The text now switches immediately with its background; targeted visual-polish2/2 passed38.7s. Visual30/30 after the adapter repair passed43.5s. No production data changed; new CI still requires inspection.


Historical checkpoint: sourcea6aa1d4/Worker53590fcd-5918-416d-ac92-5c070909e8e3; verify211 files/184 units/build, clean full local92/92 passed4.4m and production12/12 passed1.1m. CI281 functional92 E2E passed, visual29/30 caught native closed-select painting. The shared select repair is undergoing final visual/CI checks. This completes no wider14-item audit by itself. Hero visual controls, responsive original media delivery, broader comment recovery and health trend work remain applicable.


## 7 October — configurable hero production checkpoint

Requirement7: Studio ratio/depth/light/intensity/ambient-motion controls now deployed on Worker fce50526-2b39-40b6-ad69-ec4265a6da1f/source7d936a8; actual Chrome save/reload/public output and exact value restoration verified. Local215/187/build,94/94 E2E and30/30 visual passed; production13/13 passed. Requirement5 previous release and documentation Actions282/283 all three jobs passed. New source Actions284 visual passed, verify/production pending. Remaining partial requirements retain their original full scope; no overall completion claim. Details: hero-appearance-2026-10-07.md.

## Current requirement matrix — 7 October 2026

| Requirement | Evidence / remaining work |
| --- | --- |
| 1 Shared design system | Public/Studio/theme matrix, Aurora control contrast and single-select rendering verified. Editor modes now use theme tokens/44px targets; remaining action accents need audit. Partial. |
| 2 Studio simplification | Collapsed hero controls, grouped mobile editor, persistent save feedback and private device preview verified. Long settings/virtual keyboard usability still needs final audit. Partial. |
| 3 Performance | Actual sequential lab samples in performance-lab-2026-10-07.md. Responsive original-media delivery and comparable post-change measurements remain. Partial. |
| 4 Resilience | Settings failed-save input retention and preview retry verified. Comments, library desired-state recovery, search/profile deadlines and collection atomic save are production verified. Appearance/social helpers are deployed with actual appearance save/cleanup proof; remaining async surfaces still need audit. Partial. |
| 5 Visual automation | Thirty-six reproducible references and Windows gate, public/Studio390/1440 and three themes verified. Corrected comment source Actions37623995954 all three jobs green; shell-concurrency Actions37625308388 all three jobs green. |
| 6 Navigation motion | Reduced-motion/back-scroll and production navigation tests verified; navigation-motion-2026-10-07.md. |
| 7 Configurable hero | Ratio/depth/light/intensity/ambient motion, validation/permissions, local save/restore and actual production99→100 persistence verified; hero-appearance-2026-10-07.md. |
| 8 Micro interactions | Existing feedback/card/menu/save motion verified in scoped tests. Complete error/loading/reduced-motion consistency audit remains. Partial. |
| 9 Image inspector | Original-media zoom/fullscreen/swipe/keyboard/retry verified; gallery-inspector-2026-10-06.md. |
| 10 Staff palette | Role-filtered Ctrl/Cmd+K search, keyboard and editor shortcut coexistence verified. |
| 11 Real device preview | Shared public hero/stylesheet at1440/768/390, pending values/direct selection, private framing, source/origin checks and retry verified; homepage-device-preview-2026-10-07.md. |
| 12 Save/revisions | Actual revision diff/restore, changed-field summary and persisted saved time verified. Wrong-clock/failure/reload proof, independent production SQL/Chrome match; see saved-record-time-2026-10-07.md. Implemented and production verified. |
| 13 Operational trends | Real authorized release/service measurements and last50 sampled operation records persist. Rolling24h/7-day summaries, median/p95, failure counts, bounded capacity and limited sample comparison are implemented and production-verified; health-trends-2026-10-07.md. Not organic traffic or field CWV. |
| 14 Loading/reconnect | Private preview bounded loading/retry verified. Comments/search/profile/library bounded loading and explicit reconnect/retry are production verified; collection bounded save is live. Appearance/social are deployed, with actual appearance save/cleanup proof. Remaining async surfaces require audit. Partial. |

This matrix preserves the full scope. Passing one release or the hidden-theme request does not close the wider goal. Production appearance QA restored original visual values; original publications, accounts and media were retained.


## Historical health trends production checkpoint

Requirement13 actual service/release checks, persisted failure samples and bounded duration trends verified on Worker baa0bd21-6d41-4bf1-817f-e7c00f586ff9/source7c464df. Verify219/192/build, full95 local before final capacity refinement and final health/Studio5 after,36 visual references and11 production cases passed. Real admin Chrome desktop/mobile/light/Aurora and manual refresh confirmed four genuine records, correct summaries/empty buckets, clean console and bounded layout. Source Actions286 passed all three jobs, with actual Chrome confirmation; preceding284/285 are also fully green. No new DB/production-data writes. Full scope and remaining partial requirements are retained.


7 October persisted-time release: Worker83e57406-304c-4174-a4e7-96c882f0f183/source5e27e69 adds real server metadata to six Studio forms, wrong-client-clock/failure/reload proof and bounded hit-tested mobile More menu.224-file/202-unit/build, full98/98 local4.0m,36/36 visual43.0s,production11/11 52.4s passed. Actual Chrome five metadata comparisons match Supabase read-only SQL; no production data mutation. Requirement12 persisted time is now verified; broader2/8 and remaining fourteen-item matrix remain active. Details: saved-record-time-2026-10-07.md. Source CI37586550384 and documentation37587267429 all three jobs passed.

7 October durable-comment checkpoint: migration042 production applied; Worker54246ba6/source134714b; local227/204/build,103/103 E2E5.1m,36 visual passed. Actual Chrome commit/reload and actual receipt replay proven; unique QA cleaned, all originals matched. Initial production12/13 had only stricter-cache header expectation failure; corrected2/2 passed9.1s. Corrected source13d2474 Actions37623995954 all three jobs green. Requirements4/14 comment portions verified; full matrix remains active.

7 October public-shell concurrency checkpoint: source2b0624968fe7/Worker4e9499b0. Local227/204/build,103 E2E5.0m,36 unchanged visual35.6s and13 production54.0s passed. Three comparable mobile lab samples per group: LCP median2.530→2.121s/performance97→98, response455→668ms. No general speed claim; response observation and responsive originals remain open. Source CI37625308388 all three jobs green. Full matrix preserved.

Search/profile production follow-up: twelve-second complete response deadlines, retained search results/inputs, visible retry/read-only reconnect, private profile identity and validated save acknowledgement. Corrected theme-interpolation contrast. Local229/204/build,106 E2E and36 unchanged visual36.2s passed. Sourcee402eaa79b0f/Worker54c88d36 production19/19 and actual Chrome profile/search/mobile Aurora/health verified without profile writes. CI37628770008 functional106 E2E passed, visual35/36 failed deferred navigation initialization; readiness repair remains under final verification. Broader library uncertainty/loading/design work remains. See read-recovery-2026-10-07.md.

Library production checkpoint: source7d9557c/Worker80cecf11, own-record043 grants plus explicit desired-state retry and complete deadlines. Local232/210/build,108 E2E5.4m and36 unchanged visual35.3s; final production21/21 1.5m. Actual Chrome add/reload/account lists/remove and production rolled-back SQL boundaries verified; nine current row fingerprints unchanged. Wider resilience/loading/permission-aware collections still require work. Source GitHub push blocked by HTTP500; no new green CI is claimed. Full14 scope remains active.
