# Public shell follow-up — 9 October 2026

This follow-up addresses three observed defects within the full fourteen-item premium scope. It does not declare that scope complete.

## Changes and preserved boundaries

- Newsletter consent now wraps its privacy link and sentence together. The checkbox is still required and unchecked; legal text, links and subscription semantics are unchanged. A permanent link underline makes it distinguishable without relying on colour.
- Public indexes no longer request comment, readership or reading-list modules that have no controls on those pages. Articles retain all three; account and author pages retain the library module. Auth, RLS and module implementations are unchanged.
- The staff-only public Studio link remains on one line at 901–1100px. Local checks cover admin/editor, Turkish/English, three themes, keyboard access and the absence of the link for members. No permissions or production accounts changed.

## Evidence checkpoints

- Before these changes, source106565f/Worker0dcec388-5a04-46ec-ad99-2bcbc54273da passed124 local,42 visual and84 production tests. Documentationfaef593 Actions37889845294 also succeeded: verify8m4s (124 E2E6.9m), visual2m7s, production-smoke2m28s; total10m38s, inspected in connected Edge.
- Initial header assertion incorrectly treated the padded link's height as its text height. It was replaced with a text-range line count; final scoped payload/header2/2 passed11.9s. No speculative CSS pruning change was made.
- The first broad run exposed the now-inline legal link's insufficient differentiation from surrounding text. It was stopped to add the permanent underline. Final accessibility/Aurora/payload/header10/10 passed23.6s.
- Verify before the underline adjustment passed254 files with zero diagnostics,221 units and a build. Final broad, visual, production and CI release gates are pending at this checkpoint.
- The first full run ended125 passed/1 failed in5.7m. The legacy translation test navigated away before the asynchronous Studio redirect finished (`ERR_ABORTED`); its network trace confirms all three Studio POSTs returned303. The test now waits for the server-rendered paired-translation message before opening the public article. That focused test passed1/1 in11.4s and still verifies the real reciprocal language URL.
- Dark/light390px home comparisons changed only the corrected consent sentence and link underline in the footer. These differences were inspected before updating the18 public home/search/archive references; the24 Studio references are retained. Final comparison without reference updates remains required.

Original images, publications, settings, roles and accounts remain intact. All mutation tests use the isolated local adapter and remove their disposable records. Production checks for this follow-up are read-only.

## Final local release gates

Final verify passed254 checked files with zero diagnostics,221 unit tests and a build. The complete local suite passed126/126 in6.0m, including the repaired translation confirmation and actual article/account/author actions. Public reference generation passed18/18 in33.2s after visual inspection. The final42/42 comparison without reference updates passed39.8s; the24 Studio references remain unchanged and prior public references are preserved in Git history. Clean commit/build/deploy, live tests and source CI remain required at this checkpoint.
