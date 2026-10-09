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

## First live checkpoint and native scrollbar defect

Sourcec1b307e was normally pushed and deployed from a clean build as Worker7f2413f6-47a0-4d31-9518-7485d2bb136b. Focused live archive/media/payload5/5 passed22.7s. Source Actions37892221289 and the85-case full production run were live at this checkpoint.

Connected Edge921px exposed an additional defect despite those headless assertions: `innerWidth=921`, client width906, document scroll width913, header right882 and staff-link right913.27. The link's text was one line but escaped the header and was clipped by the native scrollbar. The earlier `scrollWidth<=innerWidth` assertion was insufficient. The follow-up reduces intermediate-width gaps, matches staff link typography to the compact navigation and asserts both client width and the header's own bounds. This repair still requires final local/live/native proof. Studio-host nonstaff denial remains intact; a public-host editor link does not establish an authorized Studio-host session.

Full production85/85 on that first Worker passed6.1m. Sourcec1b307e Actions37892221289 completed all three jobs successfully, confirmed through the GitHub connector. These broad passes do not override the contradictory native scrollbar evidence above.

The strengthened local header fixture now includes the live fifth root category and a second category disclosure; it removes both disposable categories afterwards. Its first fixture lookup incorrectly looked for an edit input on a list page and timed out; the corrected lookup uses the actual saved table row and its ID, without a timeout increase. The corrected header/payload2/2 passed13.1s.

The specialized main editor now also submits its original page actor to the existing server guard. A different staff session returns409 before content insertion; title/body remain editable, and restoring the original actor permits a real save. The saved local draft is removed afterwards. Main-editor actor/header/payload3/3 passed14.6s. Legacy requests omitting the optional actor still use server authorization; no universal actor binding is claimed. Final combined release gates remain required.

## Combined candidate gates

Verify passed255 checked files with zero diagnostics,221 units and build after making the root fixture's empty parent explicit for type safety. Full127/127 local E2E passed5.8m, including the main-editor actor guard and live-density header fixture with cleanup. The unchanged42/42-reference comparison passed37.7s. Clean release, native scrollbar proof, production and matching source Actions are required before calling this repair deployed and verified.

## Current release — 612ee8f

Normal main commit/push and clean build/deploy completed as Worker d95acfc3-7932-4d2b-afa9-ec0632c14207. Fresh native Edge921px reload now proves client/document width906 and header/staff-link right882, with no captured warning/error. Screenshot: public-shell-header-live-2026-10-09.png. A requested second viewport override did not alter the actual921px page width; no native901px result is claimed. The local strengthened fixture covers901/921/1024/1100. Temporary viewport override was reset.

Full85/85 live Chrome regression passed6.2m. Matching source Actions37894831390 verify, visual and production-smoke all completed successfully, confirmed through the GitHub connector. CI production smoke is a selected subset; the separate live Chrome run covers all85. Earlier sections are historical checkpoints, superseded by this current release and FINAL_REPORT.md. Native Studio-host session still correctly denies nonstaff access; no authorized native staff proof is fabricated.

## Independent follow-up found during native account review

The native Studio-host account page exposes separate ordinary sign-out and all-session sign-out controls. Source inspection found ordinary `logout` calls `db.auth.signOut()` without a scope, while `logout_all` explicitly uses global. The official Supabase [sign-out guide](https://supabase.com/docs/guides/auth/signout) documents global as the default. Ordinary logout therefore needs an explicit local scope, meaningful SDK/transport coverage and safe failure handling before using that account-switch path. Neither button was submitted during this review; no real sessions were revoked. This is an actionable application follow-up, not an external blocker or a completed repair.
