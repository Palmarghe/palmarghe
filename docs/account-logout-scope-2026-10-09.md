# Account sign-out scope and uncertainty — 9 October 2026

Status: deployed4b5aeda / Worker db369c83-33e5-488a-b21b-af9833cd5e23; verify260 files/225 units/build, local129/129, unchanged visual42/42 and full live Chrome86/86 passed. Source Actions37897754596 completed all three jobs successfully. Native normal logout/sign-in and actual admin dashboard/health are verified. Candidate/pending statements below retain historical checkpoint evidence. Current deployment authority is FINAL_REPORT.md; homepage containment, transition console and wider fourteen-item review remain active work.

## Observed defect

Ordinary `logout` used `db.auth.signOut()` without options. Supabase's [official sign-out guide](https://supabase.com/docs/guides/auth/signout) documents global as the default, so ordinary sign-out could revoke refresh sessions on every device. The separate `logout_all` UI was intended for that action. Neither real control was submitted during discovery; original accounts and sessions were preserved.

## Candidate repair

- Ordinary sign-out explicitly requests `local`; all-device sign-out explicitly requests `global`.
- Inspect the SDK error instead of silently treating server failure as success. Redirect to a localized account warning stating remote revocation is unconfirmed, with login available. The warning does not promise that every session has been closed.
- Keep SDK cookie handling; do not reinsert tokens or weaken Auth/permission policy.
- Existing same-origin checks and same-host localized account destinations are preserved.

## Meaningful evidence and limits

Four tests invoke the actual Auth API route with real installed Supabase SDK clients, isolated storage and controlled Auth transport. They prove the actual outbound local/global scope, current storage cleanup, surviving second-device refresh after local sign-out, revoked refresh after explicit global sign-out, both failure scopes, useful uncertainty redirect and foreign-origin refusal before Auth. This is SDK/controlled-service evidence, not a claim that real production accounts were revoked. Access JWTs may remain valid until expiry; refresh revocation does not mean instant invalidation of every access token.

The first fixture signature was not valid base64url and was corrected without relaxing SDK validation. The first failure assertion incorrectly expected the SDK to retain local storage after a503 revocation error. Inspection of the installed SDK showed it clears current storage for this error; tests now verify actual behavior and unconfirmed remote revocation instead of restoring credentials to satisfy the old expectation. Broader SDK session-loading failures are not claimed to have cleared storage; the warning conservatively asks users to check session status.

Two scoped browser tests passed13.0s: actual member UI sign-out/cookie removal/login destination, and the uncertainty message in two locales,320/1440, dark/light/Aurora with no serious/critical axe violations and no client-width overflow. Initial member-cookie fixture used the wrong ID and was corrected to the seeded member ID, without changing app permissions or extending timeouts. The local adapter only clears its current cookie; it is not offered as evidence of global Supabase revocation. A shared read-only production warning test is included in CI smoke and does not touch real Auth sessions.

Verify passed260 checked files with zero diagnostics,225 units and build. Full129/129 local regression passed5.9m; unchanged42/42 visual comparison passed40.1s. Clean normal commit/push/build/deploy, full live regression, matching source Actions and native account review remain required before calling this repair live verified. Full fourteen-item premium scope remains active. The local server also emitted an aborted-transition warning during content-tag navigation; the operation test passed, but no clean-server-console claim is made. This is separate follow-up evidence, not hidden by the green count.

Rollback: normal revert of this release commit and clean rebuild/deploy. No migration, production Auth policy, role, account, content or original media change is required.

## Live checkpoint

Normal main push and clean build/deploy completed as source4b5aeda / Worker db369c83-33e5-488a-b21b-af9833cd5e23. Full86/86 live Chrome regression passed6.3m. Source Actions37897754596 verify, visual and production-smoke all completed successfully, confirmed through the GitHub connector. CI smoke is a selected subset.

Native Edge normal Studio-host logout returned to login with no warning or captured error. Normal saved-credential sign-in then opened an actual admin dashboard. Private health confirmed committed source4b5aedac9315, Auth/database/media accessible and35ms database control. The earlier nonstaff session is no longer the current review blocker. No global logout, production account creation/deletion, role, content, settings or media mutation was performed.

Native warning rendering was checked through a read-only query marker; this is not a real production outage claim. A screenshot was excluded and deleted because browser autofill appeared visually after an initially empty-DOM check. No credential or private contact information is retained in Git artifacts. Native admin navigation also captured `InvalidStateError: ViewTransition opt-in disabled`; together with the local aborted-transition warning this remains separate console follow-up. No clean-native-console or completed full-scope claim is made.
