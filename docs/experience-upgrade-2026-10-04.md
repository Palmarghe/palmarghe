# Eight experience improvements — 4 October 2026

Release Worker: `581ff93d-2eda-4b08-9469-f0458a3f74c3`. Scope: all eight suggestions authorized by the user. Original media, roles, records, stored homepage curation and Git history are preserved.

| Requirement | Implementation and evidence |
| --- | --- |
| Studio previews and recovery | Hero/card/ad/cover image-aware desktop/mobile previews; dirty status, undo/reset and beforeunload warning. AJAX settings failure retains values. Local experience test covers503, original snapshot and theme/mobile layouts. Chrome card Save reached public0%50%/cover125%; reset restored50%50%/contain100%. Header ad Save reached public Partner selection; disabled again. |
| Draft → preview → publish | Local safe modal never writes; field errors identify controls. Tab/user/content scoped session recovery validates body, offers restore/discard, expires24h and clears only after confirmed server save. Local reload/recovery/publish tests. Chrome existing disposable QA record97e2c328-6be3-40bb-b4d4-52f607ea0114 previewed in mobile mode, published, public body verified, re-archived and404 verified. Existing title/body/cover retained. |
| Homepage hierarchy | Editorial choices preserved; original projects/music prioritized for fallbacks; hero/featured/spotlight never duplicate the same visual publication. Latest/reel exclude reserved publications. Local selection units and production distinct-link/source-image regression. Quiet ads retain prior responsive sizing and all three user visibility settings are restored false. |
| Media focus | Drag/touch or keyboard coordinates for cover and card; focus marker; named focus remains compatible; cover/zoom/reset; original source untouched. Local pixel regression verifies left/right difference and persisted scoped Save. Real production crop/reset proved. |
| Mobile Studio | Long editor settings collapse on phone, simple/detailed modes retained, actions and previews bounded.320/390/1440 dark/light local axe/overflow. Chrome390px light editor: collapsed settings, no horizontal overflow, publication preview accessible. Temporary viewport reset. |
| Search | Category/game descendants + type/query, published/due/locale checks, relevant suggestions separated from exact results; no-JS GET filter retained. Local category/draft/keyboard tests, live gaming KaanBuilder and absent-query suggestions; production search/clear six-case gate. Chrome real source result and light screenshot. |
| Account | Progressive tabs for profile/reading/likes/updates/account; own-user likes/bookmarks only; keyboard tabs; accessible10s bounded action progress/success/failure. Local other-user boundary tests. Chrome KaanBuilder saved/liked, both panels persisted, QA additions removed while original music items retained. |
| Automated quality | CI local verify + full76 E2E, then read-only production6 smoke. Typecheck/unit/build passed; final Actions status must be verified before scope closure. Wider production accessibility/navigation/cursor/source-content gates also run. |

## Test history and limitations

- Final local verify: Astro0 errors/warnings/hints,178/178 units, build passed.
- First full local run:74/75 (notification test needed to open new Notifications tab). Next:75/76 (test navigated before settings Save redirect completed). Final corrected targeted eight-case run:8/8; full-suite result is taken from Actions rather than combining runs.
- First production6 gate:5/6 because image assertion did not scroll to activate lazy loading. Corrected test scrolls into view; final6/6 passed.
- Dev server logged Astro audit fetch failures and expected UNKNOWN from deliberately invalid content relations. These are not claimed as universally clean console output. Fresh actual production search console warning/error list was empty.
- Automated axe does not establish manual assistive technology certification. Recovery is tab-local and does not synchronize across devices. Existing provider/webmaster dependencies remain in earlier audits.

## Production cleanup and evidence

Existing QA record is archived; `/qa-production-draft/`404. Original showcase restored center/contain100%,16:9,420px. All three ads hidden. Only temporary KaanBuilder bookmark/like removed; original music selections untouched. Screenshot files: experience-upgrade-2026-10-04/studio-preview.png and search-light.png. No hard delete, Auth account mutation, migration or source-cover replacement.

## Rollback

Revert the normal release commit and run verify/build/deploy. Previous Worker was c2dee5b1-b931-42f7-89f1-d5e95ed022b9. New optional coordinate fields are backward compatible with old focus strings; no database schema rollback is needed. New recovery copies may be discarded through the editor UI and do not write without Save.

Status: implementation and production interaction checks completed; final regression and Actions verification pending at documentation checkpoint.
