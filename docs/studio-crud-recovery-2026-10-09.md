# Generic Studio form recovery — 9 October 2026

## Local checkpoint; not deployed

The previously unwrapped category, tag, navigation, redirect, comment, message, permission-group, membership/group/role and deletion-request forms now use the same bounded Studio POST handler as appearance/homepage/advertising/collection/social forms. The existing content editor, revision, translation and media handlers are not registered twice. Each entity has an explicit expected return section matching the API's actual redirect; a nonredirected error page, login redirect, foreign origin or wrong section cannot be reported as saved.

Pending controls retain their prior disabled states, duplicate submits are ignored, and failures restore editable inputs with a visible polite status. No automatic replay after reconnection is introduced. An uncertain result asks the user to inspect the relevant list before retrying, including consequential operations. No Auth policy, role authorization, database schema, production account or permission is changed by this client handler.

Controlled local 320px tests cover category/tag/navigation/redirect: 503 with delayed response, duplicate submit during pending, enabled retry and exact FormData preservation; network abort preserves the page. Existing appearance/social real successful retry and cleanup tests remain green. Final scoped6/6 passed14.8s. The initial category fixture attempted to fill a closed optional SEO disclosure; this test setup was corrected to fill visible fields. Product assertions were retained.

Typecheck248 files zero diagnostics passed before the new test. Full verify is running. Full local regression, unchanged visual comparison, production deployment, authenticated native proof, live regression and Actions remain outstanding. All fourteen requirements remain active.

Final verify249 checked files zero errors/warnings/hints,43 test files221 units and build passed. Full local120-case suite is live under session63006; previous deployed9d35c33 full82 production is live under session99816. Actual browser Actions shows source run37851697788 and docs run37851886936 in progress; neither is yet claimed green. No runtime edits are made while the local suite server is active.

The prior deployed9d35c33 full production suite is now terminal:82/82 passed6.1m. Local120 remains running, so no source edits or deployment are made during its server lifetime.

Full local regression is terminal and passed120/120 in5.7m. Visual36 baseline comparison is running sequentially after that server ended. Existing deployed source9d35c33 Actions37851697788 is fully green in the actual connected Edge browser: verify6m50s (116 local E2E5.4m), visual2m3s, production-smoke3m24s; total10m21s. Connected browser Studio is currently a nonstaff account and correctly shows Access denied; native authenticated verification remains outstanding, not fabricated.

Final unchanged visual comparison36/36 passed34.4s. All local release gates are terminal and passed.

Production deployment supersedes local-only status: clean source2759c92 normally pushed, clean build passed, Worker dab52194-2cfd-4ed5-a883-d03b10a44034. No new bindings/secrets/migrations. Fresh full82 production is live under53551; native authenticated Studio and source Actions remain outstanding.

Local follow-up after deployment: the authorized Studio page binds its current actor UUID to generic form submissions. Before entity permission checks or writes, an explicitly mismatched actor receives a private409 actor_session JSON response; the shared handler shows a session-change message and retains fields. Legacy/native requests without the optional field retain existing server authorization, rather than being silently claimed actor-bound. No new privilege is granted. The real local admin-to-editor cookie switch proves409, preserved input and no inserted tag. Scoped7/7 passed20.5s. This actor follow-up is not deployed; verify is running under27198, then full regression/visual/normal push/deploy/live verification remain.

Actor follow-up verify passed249 checked files zero diagnostics/221 units/build. Full121-case local regression is now starting after verify ended; no runtime edits will be made during its server lifetime.

Fresh full production release regression is terminal:82/82 passed6.1m on2759c92/Worker dab52194. This proves the deployed generic form recovery release regression; it does not deploy/prove the uncommitted actor follow-up. Local121 remains active under36179.

Actor-only full121/121 passed5.8m. After its server exited, Studio UI and member_account API were aligned with the user's explicitly approved8-character requirement (maximum128, no forced character classes). Supabase Auth policy, roles and email behavior are not changed. Existing local membership workflow now creates/logs into/deletes a disposable8-lowercase account; direct7-character API request is rejected400. Membership/comments/notification and CRUD actor recovery8/8 passed24.5s. No production Auth account was created or deleted. Final combined verify is running; these actor/password edits are still uncommitted and not deployed.

Deployed2759c92 source Actions37852998077 is terminal Success, verified in actual connected Edge: verify7m31s (120 E2E6.2m), visual2m5s, production-smoke2m50s, total10m29s. Combined actor/password final verify249 files zero diagnostics/221 units/build passed. Fresh sequential mobile Lighthouse is running only after local/production tests and verify ended; no overlapping audit load.

After both sequential Lighthouse samples ended, final combined actor/password121-case local suite started under71008. Final verify and scoped8 are passed; this last full combined regression and subsequent visual/commit/clean deployment remain pending. No runtime edits during this active server.

Final combined local121/121 passed5.3m. Unchanged36 baseline comparison is running sequentially under81420 after the full suite server ended. Report history was preserved byte-for-byte in final-report-history-through-2026-10-09.md (SHA256183eba6baba3d3aab0ecd0fca369825478c821b6f15db0f8601102095cd683ca); FINAL_REPORT now has one authoritative deployment, explicit local follow-up and all fourteen requirements, without treating old open/current phrases as current.

Final combined unchanged visual36/36 passed32.7s. All local release gates are terminal and passed; source commit/clean deployment can now proceed.
