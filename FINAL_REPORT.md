# Palmarghe — current production report

## Current production state — 9 October 2026

- Worker: `db369c83-33e5-488a-b21b-af9833cd5e23`.
- Deployed runtime source: `4b5aeda`, normally pushed to `Palmarghe/palmarghe` main; clean committed build/deploy passed. Archive/auxiliary recovery, header containment and no-JavaScript navigation repair remain included.
- Ordinary logout now explicitly uses local scope; the separate all-device action uses global. Remote failure shows a localized unconfirmed-revocation warning rather than claiming success. Real SDK/controlled-transport tests cover second-device refresh and both failure scopes; no production all-device revocation is claimed.
- Newsletter legal text wraps together with a permanently underlined privacy link. Required unchecked consent and existing subscription semantics are preserved. Public indexes omit three inactive interaction modules; article, account and author controls retain their required scripts.
- Phone archive discovery uses compact aligned filters. JavaScript-disabled navigation remains usable in normal document flow and does not cover the filter action.
- Lazy cards/body media now use actual rendered source size with preserved fallback sizes. Archive/category cards now expose their existing RLS-bound ready derivatives; originals, dimensions, eager LCP loading and inspector URLs are preserved.
- Studio generic management forms preserve input after failed saves, use bounded verified redirects and block duplicate pending submissions. Translation/revision/native content operations now share recovery and page-actor validation, refuse unsaved main-editor changes before sending, and keep the editor read-only during an auxiliary request. Existing content/media handlers retain their own behavior.
- Hidden Aurora remains available through the theme-button hold or keyboard Easter egg; it is absent from ordinary theme choices.
- Responsive original media migration045 remains applied and recorded. Recorded7 October preparation produced29 smaller WebPs from10 originals; all nine original-table fingerprints matched after preparation/privacy proofs. No original media, production account, role, content or settings was changed by the9 October client release.

This is the only current deployment state in this report. Historical snapshots are preserved in [the exact previous report](docs/final-report-history-through-2026-10-09.md), SHA256 `183eba6baba3d3aab0ecd0fca369825478c821b6f15db0f8601102095cd683ca`. Statements labelled current/open/pending inside that archive describe their historical checkpoint and are not current conclusions.

## Verified release gates

| Gate | Actual evidence for deployed 4b5aeda |
|---|---|
| Local verify |260 checked files, zero diagnostics;225 unit tests; build passed |
| Full local E2E |129/129 passed5.9m, including account sign-out and unconfirmed-revocation warning, main-editor actor guard and five-root-category header bounds |
| Visual comparison |42/42 unchanged references passed40.1s; dark/light/Aurora, public/Studio390/1440. Existing reference history is preserved |
| Clean committed build/deploy |Completed; Worker ID above |
| Fresh production E2E |Full86/86 live Chrome suite passed6.3m, including new warning rendering/localization/theme/axe test and all prior public/read/write-boundary flows |
| Source GitHub Actions |Actions37897754596 for4b5aeda: verify, visual and production-smoke all completed successfully, confirmed through the GitHub connector. CI smoke is a selected subset; separate full86 live proof is above |
| Original data protection |Native review used normal current-session logout and existing saved sign-in only. No global logout, original/media/content/account/role/settings mutation; prior Storage/fingerprint proof retained |

Native Edge verified normal Studio-host logout returned to login without a warning, then a standard saved-credential sign-in opened an actual admin Studio dashboard. The dashboard fit client width906 with no overflow. Private health showed committed source4b5aedac9315 with Auth/database/media checks accessible and35ms database control. The earlier nonstaff denial remains historical evidence; it no longer describes the current native session. Current native Chrome/mobile/short-viewport review and wider staff interactions remain required. No credential values are copied into reports or Git.

Native Edge921px exposed a real scrollbar/header defect in the previous c1b307e release: client width906, document scroll width913 and staff-link right913.27 outside header right882. The612ee8f repair, retained in current4b5aeda, corrected that spacing: a fresh native reload proves document scroll/client width906 and staff-link/header right882; no horizontal overflow and no captured warning/error. The stronger local fixture includes five categories/two disclosures and tests901/921/1024/1100 against client width and header bounds. The main editor's page-actor guard is also deployed, with meaningful local refusal/no-insert/retry proof. Current native authorized Studio review remains outstanding. Details: [public shell follow-up](docs/public-shell-followup-2026-10-09.md).

## Historical actor and membership release retained in current production

Generic form submissions capture their authorized Studio page actor. An explicitly different current staff session is rejected409 before writes; fields stay editable and preserved. Legacy/native API requests without this optional actor field still use existing server authorization and are not claimed universally actor-bound.

Studio member creation UI/API now match the user's approved8..128 character rule without forced character types. Production Supabase Auth policy is unchanged. Local7-character API rejection,8-lowercase account create/login/permission checks/cleanup passed; no production account was created/deleted. Actor-only full121/121 passed5.8m. Combined membership/comments/CRUD checks8/8 passed24.5s; final verify249 files/221 units/build passed. Final combined121-case local suite71008 passed121/121 in5.3m. Unchanged36-screen visual comparison passed36/36 in32.7s, run sequentially after that server ended. Normal commit/push and clean deployment completed as1fb9eb1/Worker eabe551c. Final live regression82/82 and source Actions37854993962 passed. Native authorized staff checks remain outstanding.

See [Studio form recovery evidence](docs/studio-crud-recovery-2026-10-09.md).

## Full fourteen-item objective remains active

The scope is preserved in [the binding scope document](docs/premium-webmaster-2026-10-06.md). [The current requirement-by-requirement audit](docs/premium-completion-audit-2026-10-09.md) identifies proofs and gaps for all fourteen items: shared design system, Studio simplification, performance, resilience, visual automation, transitions, configurable hero, micro interactions, original image inspection, staff palette, device preview, save/revision history, private health/trends and loading/retry.

Remaining applicable work includes:

- Native staff verification of the actor/password management changes; full local/live/visual/source CI gates passed for that previous release.
- Native Edge administrator dashboard and health review now passed. Current native Chrome/phone/short-viewport review and wider management error/pending/keyboard states remain.
- Native staff review of the newly wrapped translation/revision/native-only flows; broader member/access/message/comment management error/pending states.
- Broader performance/slow-network review; current responsive-image local/live/visual/source CI gates passed, with actual candidate selection, byte reduction and original preservation proof.
- Finish performance/slow-network review and final completion audit against every explicit requirement. Earlier successful feature checkpoints do not close this scope.
- Native authorized Studio review remains outstanding. Header containment, main-editor page-actor guard, newsletter alignment and inactive public-index module omission are deployed with completed local/live/source CI gates.
- Continue broader native staff review. Ordinary logout scope is repaired and normal live sign-out/sign-in is verified, with completed current-source gates; all-device revocation is covered by controlled SDK transport rather than real-session cancellation.
- Inspect the local aborted-transition warning and native Edge opt-in transition error recorded during navigation; green functional counts do not prove a clean console for those native transitions.
- Repair the actual native Studio homepage editor overflow: at921px, client width906 but document scroll width999; the form's first panel and change bar extend to999. Existing390/1440 visual checks do not cover this intermediate width and live settings density. Native before proof: studio-homepage-overflow-before-2026-10-09.png. This remains an applicable UX defect, not an external blocker.

## Measured performance, not organic traffic

Sequential Lighthouse13.5.0 mobile samples on the previous measuredb7d0682 release after all local/full production test processes ended: home98/LCP2102ms/678316 bytes, article97/LCP2402ms/286562 bytes; both CLS0/TBT0 and automated accessibility/practices/SEO100. These are single lab samples, not field CWV, medians, causal proof or organic traffic. QA URLs use the measurement exclusion marker. Article transfer is22.1% below the prior single sample, but request inspection attributes most of that comparison to an offscreen related image absent from the new capture; it does not prove that the same downloaded image became smaller. Native keyboard navigation subsequently loaded both related cards correctly. CSS blocking and slow-network observations remain applicable follow-up work.

Last measured settings, transfer breakdown and limitations: [lazy-image evidence](docs/lazy-image-selection-2026-10-09.md), [compact metrics](docs/lazy-image-performance-2026-10-09.json). Previous sample: [historical performance evidence](docs/performance-followup-2026-10-09.md). Original media/Storage/privacy proofs: [responsive media evidence](docs/media-renditions-2026-10-07.md). Mobile editing geometry: [short viewport evidence](docs/editor-short-viewport-2026-10-07.md).

## External/user-dependent items and exclusions

Custom SMTP, optional Cloudflare Access, Search Console field CWV/indexing maturation and manual assistive-technology review remain external/user-dependent where their prior artifacts record them. They do not justify stopping independent technical work. Application MFA is excluded per the user's instruction; it is not a new required gate. Search Console verification, production role/content-type/transaction proofs already recorded in prior artifacts are not relabelled unverified merely because older archive entries predate them.

## Preservation and completion status

Existing architecture, Git history, original content/media/accounts and production permissions are preserved. No force push. Runtime source was committed and deployed cleanly. Responsive-image work is deployed; its release gates are recorded separately. The goal is active, not complete and not blocked. Completion requires the full scope and current gates to be proved, normal main push, QA cleanup, clean Git and one accurate final production state.
