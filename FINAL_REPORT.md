# Palmarghe — current production report

## Current production state — 9 October 2026

- Worker: `f11acc5d-c4b8-40ee-91b2-87a4bf2a62a6`.
- Deployed runtime source: `878afd8`, normally pushed to `Palmarghe/palmarghe` main; clean committed build/deploy passed. Earlier repairs remain included. Community management actions now have themed44px targets; messages retain desktop columns and become labelled cards on phones, keeping status/save inside the viewport.
- Ordinary logout now explicitly uses local scope; the separate all-device action uses global. Remote failure shows a localized unconfirmed-revocation warning rather than claiming success. Real SDK/controlled-transport tests cover second-device refresh and both failure scopes; no production all-device revocation is claimed.
- Newsletter legal text wraps together with a permanently underlined privacy link. Required unchecked consent and existing subscription semantics are preserved. Public indexes omit three inactive interaction modules; article, account and author controls retain their required scripts.
- Phone archive discovery uses compact aligned filters. JavaScript-disabled navigation remains usable in normal document flow and does not cover the filter action.
- Lazy cards/body media now use actual rendered source size with preserved fallback sizes. Archive/category cards now expose their existing RLS-bound ready derivatives; originals, dimensions, eager LCP loading and inspector URLs are preserved.
- Studio generic management forms preserve input after failed saves, use bounded verified redirects and block duplicate pending submissions. Translation/revision/native content operations now share recovery and page-actor validation, refuse unsaved main-editor changes before sending, and keep the editor read-only during an auxiliary request. Existing content/media handlers retain their own behavior.
- Hidden Aurora remains available through the theme-button hold or keyboard Easter egg; it is absent from ordinary theme choices.
- Responsive original media migration045 remains applied and recorded. Recorded7 October preparation produced29 smaller WebPs from10 originals; all nine original-table fingerprints matched after preparation/privacy proofs. No original media, production account, role, content or settings was changed by the9 October client release.

This is the only current deployment state in this report. Historical snapshots are preserved in [the exact previous report](docs/final-report-history-through-2026-10-09.md), SHA256 `183eba6baba3d3aab0ecd0fca369825478c821b6f15db0f8601102095cd683ca`. Statements labelled current/open/pending inside that archive describe their historical checkpoint and are not current conclusions.

## Verified release gates

| Gate | Actual evidence for deployed 878afd8 |
|---|---|
| Local verify |262 checked files, zero diagnostics;225 unit tests; build passed |
| Full local E2E |136/136 passed6.4m, including five community recovery cases across320/390/921 and three themes/main axe, actual30-second timeout, duplicate/pending/input retention and comment-delete submitter semantics |
| Visual comparison |42/42 unchanged references passed40.3s; dark/light/Aurora, public/Studio390/1440; prior reference history preserved in Git |
| Clean committed build/deploy |Completed; Worker ID above |
| Fresh production E2E |Initial85 passed/1 failed7.8m: JS-disabled archive filter navigation waited without completed response and hit60s. Exact unmodified test3/3 passed19.4s; final full86/86 passed6.8m. Earlier ea65450 CSS404/contact3/3 remains historical evidence |
| Source GitHub Actions |Actions37947826724 for878afd8: verify, visual and production-smoke all completed successfully, confirmed through the GitHub connector. CI smoke is a selected subset and does not replace full-run evidence |
| Asset readiness |New global.DDlsu8kr.css/index.DZ3ze1po.css on both apex/Studio200 text/css, all four SHA-256 hashes match clean committed build bytes. Measured requests only, not all-edge/future guarantee |
| Original data protection |Native review used normal current-session logout and existing saved sign-in only. No global logout, original/media/content/account/role/settings mutation; prior Storage/fingerprint proof retained |

Historical native Auth/health proof on predecessor4b5aeda: normal Studio-host logout returned to login without a warning, then saved-credential sign-in opened an actual admin dashboard. Private health showed committed source4b5aedac9315 and accessible services with35ms database control. Current878afd8 retained that actual admin session for the homepage and palette review; no new Auth operation was performed. The earlier nonstaff denial is historical. Current native Chrome/mobile/short-viewport review and wider staff interactions remain required. No credential values are copied into reports or Git.

Native Edge921px exposed a real scrollbar/header defect in the previous c1b307e release: client width906, document scroll width913 and staff-link right913.27 outside header right882. The612ee8f repair, retained in current878afd8, corrected that spacing: a fresh native reload proves document scroll/client width906 and staff-link/header right882; no horizontal overflow and no captured warning/error. The stronger local fixture includes five categories/two disclosures and tests901/921/1024/1100 against client width and header bounds. The main editor's page-actor guard is also deployed, with meaningful local refusal/no-insert/retry proof. Current native authorized Studio review remains outstanding. Details: [public shell follow-up](docs/public-shell-followup-2026-10-09.md).

## Historical actor and membership release retained in current production

Generic form submissions capture their authorized Studio page actor. An explicitly different current staff session is rejected409 before writes; fields stay editable and preserved. Legacy/native API requests without this optional actor field still use existing server authorization and are not claimed universally actor-bound.

Studio member creation UI/API now match the user's approved8..128 character rule without forced character types. Production Supabase Auth policy is unchanged. Local7-character API rejection,8-lowercase account create/login/permission checks/cleanup passed; no production account was created/deleted. Actor-only full121/121 passed5.8m. Combined membership/comments/CRUD checks8/8 passed24.5s; final verify249 files/221 units/build passed. Final combined121-case local suite71008 passed121/121 in5.3m. Unchanged36-screen visual comparison passed36/36 in32.7s, run sequentially after that server ended. Normal commit/push and clean deployment completed as1fb9eb1/Worker eabe551c. Final live regression82/82 and source Actions37854993962 passed. Native authorized staff checks remain outstanding.

See [Studio form recovery evidence](docs/studio-crud-recovery-2026-10-09.md).

## Full fourteen-item objective remains active

The scope is preserved in [the binding scope document](docs/premium-webmaster-2026-10-06.md). [The current requirement-by-requirement audit](docs/premium-completion-audit-2026-10-09.md) identifies proofs and gaps for all fourteen items: shared design system, Studio simplification, performance, resilience, visual automation, transitions, configurable hero, micro interactions, original image inspection, staff palette, device preview, save/revision history, private health/trends and loading/retry.

Remaining applicable work includes:

- Native staff verification of the actor/password management changes; full local/live/visual/source CI gates passed for that previous release.
- Native Edge administrator dashboard and health review now passed. Current native Chrome/phone/short-viewport review and wider management error/pending/keyboard states remain.
- Native staff review of translation/revision/native-only flows. Member/access/message/comment retained-input/pending/error/timeout/delete-submit semantics are now covered by controlled local cases and live basic management geometry; native phone/wider empty states remain.
- Broader performance/slow-network review; current responsive-image local/live/visual/source CI gates passed, with actual candidate selection, byte reduction and original preservation proof.
- Finish performance/slow-network review and final completion audit against every explicit requirement. Earlier successful feature checkpoints do not close this scope.
- Native authorized Studio review remains outstanding. Header containment, main-editor page-actor guard, newsletter alignment and inactive public-index module omission are deployed with completed local/live/source CI gates.
- Continue broader native staff review. Ordinary logout scope is repaired and normal live sign-out/sign-in is verified, with completed current-source gates; all-device revocation is covered by controlled SDK transport rather than real-session cancellation.
- Inspect the local aborted-transition warning and native Edge opt-in transition error recorded during navigation; green functional counts do not prove a clean console for those native transitions.
- Investigate production rollout asset readiness: captured first contact CSS404 caused unstyled-header axe failure, despite current200 and3/3 exact follow-up scans. Initial full run remains85/86; no blanket deploy availability guarantee is inferred.
- Homepage intermediate-width overflow is repaired in ea65450. Native Edge921px now has client/scroll906, panel right869.17 and Spotlight right844.17; Escape closes the palette and returns opener focus, and actual device preview is390px. Before/after proof and regression evidence: [containment review](docs/studio-homepage-containment-2026-10-09.md). Wider native staff/phone review remains applicable.

Current878afd8 native community review: message Save and four member Apply buttons44px and bounded; message controls use correct light/Aurora colors, dark preference restored. Actual member UI has minlength8. No account/profile/message/role/settings form submitted; no private identities/values exported. Populated comment recovery is controlled local proof, not native production empty-list proof. Details: [community controls](docs/studio-community-controls-2026-10-09.md).

## Measured performance, not organic traffic

Sequential Lighthouse13.5.0 mobile samples on the previous measuredb7d0682 release after all local/full production test processes ended: home98/LCP2102ms/678316 bytes, article97/LCP2402ms/286562 bytes; both CLS0/TBT0 and automated accessibility/practices/SEO100. These are single lab samples, not field CWV, medians, causal proof or organic traffic. QA URLs use the measurement exclusion marker. Article transfer is22.1% below the prior single sample, but request inspection attributes most of that comparison to an offscreen related image absent from the new capture; it does not prove that the same downloaded image became smaller. Native keyboard navigation subsequently loaded both related cards correctly. CSS blocking and slow-network observations remain applicable follow-up work.

Last measured settings, transfer breakdown and limitations: [lazy-image evidence](docs/lazy-image-selection-2026-10-09.md), [compact metrics](docs/lazy-image-performance-2026-10-09.json). Previous sample: [historical performance evidence](docs/performance-followup-2026-10-09.md). Original media/Storage/privacy proofs: [responsive media evidence](docs/media-renditions-2026-10-07.md). Mobile editing geometry: [short viewport evidence](docs/editor-short-viewport-2026-10-07.md).

## External/user-dependent items and exclusions

Custom SMTP, optional Cloudflare Access, Search Console field CWV/indexing maturation and manual assistive-technology review remain external/user-dependent where their prior artifacts record them. They do not justify stopping independent technical work. Application MFA is excluded per the user's instruction; it is not a new required gate. Search Console verification, production role/content-type/transaction proofs already recorded in prior artifacts are not relabelled unverified merely because older archive entries predate them.

## Preservation and completion status

Existing architecture, Git history, original content/media/accounts and production permissions are preserved. No force push. Runtime source was committed and deployed cleanly. Responsive-image work is deployed; its release gates are recorded separately. The goal is active, not complete and not blocked. Completion requires the full scope and current gates to be proved, normal main push, QA cleanup, clean Git and one accurate final production state.
