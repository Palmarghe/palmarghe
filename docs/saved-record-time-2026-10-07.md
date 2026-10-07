# Persisted Studio save time — 7 October 2026

## Scope and current gate

Production Worker83e57406-304c-4174-a4e7-96c882f0f183, clean source5e27e69 deployed and verified. This is progress on requirements 2/8/12, not closure of the full fourteen-item objective.

Content, homepage, advertising, appearance, social and editorial collection forms render the existing database updated_at value. Dates use explicit Europe/Istanbul and include seconds. Missing metadata is labelled unavailable or not yet saved; no current client clock is substituted. Confirmed form transport announces server confirmation while navigating; the subsequent server-rendered document supplies the persisted time. No migration, authentication, permissions or production data mutation.

Mobile editor preview spans two columns instead of being squeezed into a narrow cell. More actions use a bounded menu with touch targets, saved-content preview, Escape/focus return and outside-pointer dismissal. A hit-test reproduced clipping by the action bar overflow; scoped visible overflow repairs it.

## Verification

Final local verify: 224 files, zero diagnostics; 202 units and build passed. Full local E2E 98/98 passed in 4.0m. Full unchanged-reference visual comparison 36/36 passed in 43.0s after intentional editor/homepage timestamp and action layout reference updates; editor six-reference regeneration passed in 17.4s. Mobile test creates its own disposable local draft and checks new/saved states at 320/390/768 in all three themes, actual pointer hit target, bounds, keyboard and serious/critical axe. Timestamp tests fix browser clock to 2040 and verify success advancement, failure retention and reload persistence. Earlier full97 run had one stale-navigation harness failure; repaired main-frame wait was confirmed in the final98 run. Standalone mobile runs exposed missing fixture and invalid outside targets, now corrected. Typecheck caught the Tiptap Node name collision; composedPath avoids the cast.

Read-only production SQL before deployment: homepage 2026-10-07 06:16:14.351+00; advertising 2026-10-04 11:33:13.73+00; appearance 2026-10-02 10:07:43.376+00; social 2026-10-01 11:28:18.503+00. Archived QA97e2c328-6be3-40bb-b4d4-52f607ea0114 remains archived, updated_at 2026-10-06 16:06:23.919303+00. These provide an independent stored metadata reference for live UI comparison; no writes performed.

## Limits and rollback

Last save is persisted row metadata, not a claim of exact commit completion instant. Display precision is seconds, ISO precision milliseconds. Revert this source commit and normally rebuild/deploy to remove the display/menu refinements; database state and history are unchanged. Broader performance/comment/loading/design scope remains active.

## Live proof

Production smoke/Aurora/private health11/11 passed52.4s. Actual admin Chrome matches all four settings timestamps and QA19:06:23 to SQL. QA remains archived at revision9.390px Aurora More menu command receives actual elementFromPoint hit, stays bounded, and Escape closes with focus returned. Desktop dark/light bounded; inspected warnings/errors empty. An initial chained theme action unexpectedly navigated to public home; fresh Studio navigation and separate light/dark actions confirmed correct theme/state with no overflow. Earlier intermediate overflow reading during navigation is not reported as a stable layout defect. Preferences restored to dark and viewport reset. Screenshots saved-record-time-live-desktop-2026-10-07.png and saved-record-time-live-mobile-aurora-2026-10-07.png. Source Actions37586550384 and documentation37587267429 completed with verify, visual and production-smoke successful.
