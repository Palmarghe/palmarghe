# Public shell request concurrency — 7 October 2026

## Change and boundary

The public layout previously awaited optional Auth/profile lookup, then scheduled-publication notification dispatch, then five shell reads. These independent groups now start concurrently and all finish before HTML renders. Profile role is still read only after server-authenticated identity; staff links remain restricted. Notification dispatch remains service-role in production and idempotent; no public RPC grants changed, no detached/background promise. Categories/navigation/appearance/social/ads still use the original request-authenticated client and RLS. No cross-request/global cache or data fallback changes. Existing dependency ordering within Auth/profile is retained.

## Comparable baseline

Clean source13d2474b5cd9/Worker7597043d-cc88-4722-b007-2af7913be794, three sequential Lighthouse mobile homepage runs, QA verify=lighthouse marker, no competing local tests. Server response455ms median (331–484); LCP2.530s median (2.099–2.759); performance97 median (95–98), CLS0/TBT0 in all three. Version/settings/exact samples in shell-performance-2026-10-07.json. Earlier single October7 sample is historical and is not used as a three-run comparison. These are lab samples, not organic traffic/field CWV or guaranteed latency.

## Gates / rollback

Local verify227 files zero diagnostics,204 units/build passed; full103/103 E2E5.0m and36/36 unchanged visual references35.6s passed. Staff-only entry, publication notifications, public taxonomy/appearance and scheduled privacy scenarios passed. One historical ViewTransition AbortError remains logged while its tags scenario passed. Deployed clean source2b0624968fe7/Worker4e9499b0-e1c2-478d-bb1f-f8b32b8cec31; final production13/13 passed54.0s. Actual admin Chrome confirms source2b0624968fe7, Auth/database/media access,57ms database check and empty fresh health console. Public signed-in header retains two permitted Studio links. Source Actions37625308388 all three jobs green. Responsive original-media delivery and broader performance scope remain open. Rollback is a normal revert/rebuild/redeploy of Site.astro; no schema/storage/account/settings undo is needed. All original editorial values and assets remain unchanged.

## Post-change measurements

Three sequential identical mobile homepage samples on the clean deployed source: performance98 median (95–98), LCP2.121s median (2.115–2.653), server response668ms median (527–721), CLS0/TBT0 throughout. Accessibility/practices/SEO100 throughout both groups. Median LCP fell2.530→2.121s, but server response increased455→668ms. Three live samples do not establish causality or a general speed improvement; the higher server-response result is retained as an unresolved performance observation. No bytes/composition change was intended, and original responsive-media work remains open. Do not describe this as a field-CWV improvement.
