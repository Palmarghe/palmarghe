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
