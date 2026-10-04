# Eight experience improvements — 4 October 2026

Release Worker: `a622e0b3-d44b-4eb6-9087-062ab7084dbc`. Earlier rollout581ff93d is superseded by final light-preview/control polish. Scope: all eight suggestions authorized by the user. Original media, roles, records, stored homepage curation and Git history are preserved.

| Requirement | Implementation and evidence |
| --- | --- |
| Studio previews and recovery | Hero/card/ad/cover image-aware desktop/mobile previews; dirty status, undo/reset and beforeunload warning. AJAX settings failure retains values. Local experience test covers503, original snapshot and theme/mobile layouts. Chrome card Save reached public0%50%/cover125%; reset restored50%50%/contain100%. Header ad Save reached public Partner selection; disabled again. |
| Draft → preview → publish | Local safe modal never writes; field errors identify controls. Tab/user/content scoped session recovery validates body, offers restore/discard, expires24h and clears only after confirmed server save. Local reload/recovery/publish tests. Chrome existing disposable QA record97e2c328-6be3-40bb-b4d4-52f607ea0114 previewed in mobile mode, published, public body verified, re-archived and404 verified. Existing title/body/cover retained. |
| Homepage hierarchy | Editorial choices preserved; original projects/music prioritized for fallbacks; hero/featured/spotlight never duplicate the same visual publication. Latest/reel exclude reserved publications. Local selection units and production distinct-link/source-image regression. Quiet ads retain prior responsive sizing and all three user visibility settings are restored false. |
| Media focus | Drag/touch or keyboard coordinates for cover and card; focus marker; named focus remains compatible; cover/zoom/reset; original source untouched. Local pixel regression verifies left/right difference and persisted scoped Save. Real production crop/reset proved. |
| Mobile Studio | Long editor settings collapse on phone, simple/detailed modes retained, actions and previews bounded.320/390/1440 dark/light local axe/overflow. Chrome390px light editor: collapsed settings, no horizontal overflow, publication preview accessible. Temporary viewport reset. |
| Search | Category/game descendants + type/query, published/due/locale checks, relevant suggestions separated from exact results; no-JS GET filter retained. Local category/draft/keyboard tests, live gaming KaanBuilder and absent-query suggestions; production search/clear six-case gate. Chrome real source result and light screenshot. |
| Account | Progressive tabs for profile/reading/likes/updates/account; own-user likes/bookmarks only; keyboard tabs; accessible10s bounded action progress/success/failure. Local other-user boundary tests. Chrome KaanBuilder saved/liked, both panels persisted, QA additions removed while original music items retained. |
| Automated quality | CI local verify + full76 E2E, then read-only production6 smoke. Typecheck/unit/build passed; Implementation6853698 Actions37199411566 passed both verify/full76 E2E and production-smoke6/6. Final polish push is checked against the same gates. Wider production accessibility/navigation/cursor/source-content gates also run. |

## Test history and limitations

- Final local verify: Astro0 errors/warnings/hints,178/178 units, build passed.
- First full local run:74/75 (notification test needed to open new Notifications tab). Next:75/76 (test navigated before settings Save redirect completed). Final corrected targeted eight-case run:8/8; Actions37199411566 verify job passed the complete76-test suite. Final light preview/control test also passed with both-theme axe.
- First production6 gate:5/6 because image assertion did not scroll to activate lazy loading. Corrected test scrolls into view; final6/6 passed.
- Dev server logged Astro audit fetch failures and expected UNKNOWN from deliberately invalid content relations. These are not claimed as universally clean console output. Fresh actual production search console warning/error list was empty. Chrome Studio retained three historical cross-page ViewTransition opt-in abort messages; no claim of universally clean Studio logs is made.
- Automated axe does not establish manual assistive technology certification. Recovery is tab-local and does not synchronize across devices. Existing provider/webmaster dependencies remain in earlier audits.

## Production cleanup and evidence

Existing QA record is archived; `/qa-production-draft/`404. Original showcase restored center/contain100%,16:9,420px. All three ads hidden. Only temporary KaanBuilder bookmark/like removed; original music selections untouched. Screenshot files: experience-upgrade-2026-10-04/studio-preview.png and search-light.png. No hard delete, Auth account mutation, migration or source-cover replacement.

## Rollback

Revert the normal release commit and run verify/build/deploy. Previous Worker was c2dee5b1-b931-42f7-89f1-d5e95ed022b9. New optional coordinate fields are backward compatible with old focus strings; no database schema rollback is needed. New recovery copies may be discarded through the editor UI and do not write without Save.

Status: all eight improvements implemented and production interaction checks completed. Implementation main push6853698 passed both verify (full76 E2E) and production-smoke (6 cases): https://github.com/Palmarghe/palmarghe/actions/runs/37199411566 . All eight applicable requirements are completed. The final polish commit runs the same mandatory gates and is checked before the completion response.

Final Worker production search/showcase6/6 passed. Broader production accessibility/navigation/source/cursor27-case run26/27; obsolete native-pointer expectation was aligned with the already shipped modal custom cursor and the affected test passed1/1. No runtime cursor weakening occurred. Actual Studio light preview descriptor rgb(78,72,87), checkbox17.6px; drag76%58% followed by Undo restored50%50%. Final screenshot shows image-aware mobile card and light hero preview.
