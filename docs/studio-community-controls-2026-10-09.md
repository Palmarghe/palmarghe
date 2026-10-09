# Studio community controls — 9 October 2026

## Observed production baseline

Current runtime ea65450/Worker f72fc7e9-07c1-479e-a421-a9c18e8fa60b was reviewed through the existing actual native Edge admin session. Member and permission-group panels fit the921px window (client/scroll906); membership group Apply buttons were30px high. Messages likewise had a30px Save button. No account identifiers, emails, message bodies or credential values were exported; measurements contain only geometry/headings. Comments were empty, so this native view does not prove populated moderation layout. No production form was submitted or permission/account/content changed.

## Reproduction and local candidate

Five controlled local cases cover member creation, member-group assignment, permission groups, message status and comment moderation. Against old styles, member-group/message targets failed44px bounds; the initial comment fixture incorrectly parsed an HTML redirect as JSON, corrected by reading the article's public comments contentId. After minimum44px theme-token controls, the message case still failed actual control right bounds at320px: table scroll containment kept the document bounded while hiding the action offscreen. The test retains actual control bounds rather than treating document width alone as proof.

Candidate message table retains desktop columns and semantic column headers; on phones, each row becomes a labelled vertical card with visible status/save controls and wrapping sender/message values. Status labels are Turkish, underlying stored enum values unchanged. Membership selects can shrink; permission checkboxes retain fixed width. Destructive button semantics, permissions, accounts, database and Auth policies are unchanged.

Initial five scoped cases passed5/5 in12.0s. Strengthened combined checks are running:320/390/921, dark/light/Aurora, all-theme main axe, pending duplicate refusal, delayed503, network abort and exact retained FormData. Member creation additionally checks the actual30-second timeout via browser clock; comment delete checks submitter operation preservation under an intercepted failure. All uncertain submissions are intercepted; only disposable local comment/article setup and article cleanup reach the local adapter. The contact fixture belongs to the temporary local server, never production.

The candidate is not yet deployed. Local verify/full regression/visual, normal committed push/clean build/deploy, actual native current controls, production regression and source Actions remain required. The full fourteen-item objective remains active; this is progress on design, Studio usability, resilience, visual automation and loading/retry.

Strengthened combined recovery10/10 passed32.7s, including all-theme axe, actual30-second deadline recovery and comment-delete submitter preservation. Final verify262 checked files zero diagnostics/225 units/build passed. Full136-case local regression is now running; no runtime edits or parallel builds/visual servers are made during it. Current deployed source remains ea65450.

Predecessor documentation cefe2f1 Actions37945568105 now completed all3jobs successfully. This is not candidate release CI. Cloudflare's [static assets documentation](https://developers.cloudflare.com/workers/static-assets/) describes Worker/assets as one deployment operation; the previous one-off CSS404 is not attributed to a presumed separate upload architecture. Current new-release asset readiness must be measured explicitly; no routing/security changes are justified by that observation alone.

Final full local136/136 passed6.4m after verify ended. Intentional invalid-category test emitted its expected transaction failure; the separate content-tag navigation still emitted an aborted-transition warning, so this release does not claim to resolve that issue. Unchanged42-reference visual comparison is now running sequentially, with no snapshot updates.

Final unchanged visual comparison42/42 passed40.3s. All local gates are terminal. Candidate release is ready for normal commit/push and a clean committed build/deploy; production/native/asset/source CI gates are next.
