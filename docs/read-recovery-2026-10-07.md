# Search / profile read recovery — 7 October 2026

## Scope and boundaries

Search has a twelve-second full fetch/JSON deadline, explicit themed retry, previous results retained after failure/invalid data, unchanged query/type/category, and read-only reconnect only while the surface is visible. Closed dialogs cancel old work and do not reconnect in the background. Invalid response arrays are rejected before rendering. Manual successful retry returns focus to the input. Normal searches, no-JS GET fallback and existing keyboard navigation remain. Result surfaces change with their foreground immediately; interpolating the background during theme switches caused a reproduced serious contrast failure.

Profile reads and saves now have the same complete twelve-second fetch/body bound. Initial failed reads disable saving to protect existing fields; reconnect only retries an initial failed read, never a write or a refresh that overwrites ready edits. Input and avatar choices remain after failed/uncertain writes. A successful save requires ok=true and the original authenticated viewer ID. The Worker rejects a stale form's different viewer ID before touching any profile row. GET identifies only the signed-in user; original Auth/same-origin/RLS/preset-avatar/public-profile opt-in boundaries remain. Legacy clients without viewer_id retain the prior server-authenticated behavior; current client always supplies its loaded identity. No migration/grant/Auth-policy/account change.

Comment deadlines now include JSON body consumption, closing the response-headers-arrived/body-stalled gap while retaining durable request keys and manual verification. No automatic write replay.

## Tests and status

Initial targeted9 executed:7 passed; search caught actual theme-interpolation contrast, and the new profile fixture failed native validation because the local seeded member's display name was null. The contrast defect was fixed; the test now explicitly enters a valid name before submitting. Corrected targeted9/9 passed36.5s. A further real local profile commit with received headers but stalled synthetic response body tests the complete deadline. That response-body shim is local test code, not a production runtime hack.

Final targeted3/3 body-deadline/session cases passed14.5s; verify229 files zero diagnostics/204 units/build passed, full106/106 E2E and36/36 unchanged visual references36.2s passed. Deploy/live/Actions proof pending. Production controlled fixtures intercept every profile request before reaching production and read only anonymous deployed HTML; they create no account or profile change. Search fixtures intercept GET responses and create no content. Local member/editor identity test confirms mismatched account401 and unchanged editor profile, plus retained committed member data after retry.

## Rollback / remaining scope

Normal revert/rebuild/redeploy scripts/API/CSS; no database rollback. Existing comments receipt schema remains. This verifies search/profile portions of resilience/loading scope, not every asynchronous surface: like/bookmark/follow uncertainty and broader full-surface loading/design audit still require work. Original publications/media/profile/settings values are not changed by the planned production fixtures.

## CI maintenance

Actual successful shell Actions37625308388 Chrome summary displayed obsolete Node20 checkout/setup action warnings and an upcoming ubuntu-latest image change. Checkout7.0.1 and setup-node7.0.0 official release/tag commits were verified; both action.yml use node24. Workflow pins their exact commits, keeps Node24/npm lockfile cache, sets contents:read and persist-credentials:false, and uses explicit Ubuntu24.04 instead of the moving label. No deployment token or new access is introduced. Actual CI must verify hosted Windows and Linux execution. Sources: [checkout release](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node release](https://github.com/actions/setup-node/releases/tag/v7.0.0). Upload-artifact was not changed because it did not cause the observed runtime warning.
