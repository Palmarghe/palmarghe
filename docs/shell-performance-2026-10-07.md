# Public shell request concurrency — 7 October 2026

## Change and boundary

The public layout previously awaited optional Auth/profile lookup, then scheduled-publication notification dispatch, then five shell reads. These independent groups now start concurrently and all finish before HTML renders. Profile role is still read only after server-authenticated identity; staff links remain restricted. Notification dispatch remains service-role in production and idempotent; no public RPC grants changed, no detached/background promise. Categories/navigation/appearance/social/ads still use the original request-authenticated client and RLS. No cross-request/global cache or data fallback changes. Existing dependency ordering within Auth/profile is retained.

## Comparable baseline

Clean source13d2474b5cd9/Worker7597043d-cc88-4722-b007-2af7913be794, three sequential Lighthouse mobile homepage runs, QA verify=lighthouse marker, no competing local tests. Server response455ms median (331–484); LCP2.530s median (2.099–2.759); performance97 median (95–98), CLS0/TBT0 in all three. Version/settings/exact samples in shell-performance-2026-10-07.json. Earlier single October7 sample is historical and is not used as a three-run comparison. These are lab samples, not organic traffic/field CWV or guaranteed latency.

## Gates / rollback

Local verify227 files zero diagnostics,204 units/build passed; full103/103 E2E5.0m and36/36 unchanged visual references35.6s passed. Staff-only entry, publication notifications, public taxonomy/appearance and scheduled privacy scenarios passed. One historical ViewTransition AbortError remains logged while its tags scenario passed. Deploy/post-change measurements/live staff-public checks pending. Responsive original-media delivery and broader performance scope remain open. Rollback is a normal revert/rebuild/redeploy of Site.astro; no schema/storage/account/settings undo is needed. All original editorial values and assets remain unchanged.
