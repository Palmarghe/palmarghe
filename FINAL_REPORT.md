# Palmarghe — current production report

## Current production state — 9 October 2026

- Worker: `d95acfc3-7932-4d2b-afa9-ec0632c14207`.
- Deployed runtime source: `612ee8f`, normally pushed to `Palmarghe/palmarghe` main; clean committed build/deploy passed. Archive/auxiliary recovery and no-JavaScript navigation repair remain included.
- Newsletter legal text wraps together with a permanently underlined privacy link. Required unchecked consent and existing subscription semantics are preserved. Public indexes omit three inactive interaction modules; article, account and author controls retain their required scripts.
- Phone archive discovery uses compact aligned filters. JavaScript-disabled navigation remains usable in normal document flow and does not cover the filter action.
- Lazy cards/body media now use actual rendered source size with preserved fallback sizes. Archive/category cards now expose their existing RLS-bound ready derivatives; originals, dimensions, eager LCP loading and inspector URLs are preserved.
- Studio generic management forms preserve input after failed saves, use bounded verified redirects and block duplicate pending submissions. Translation/revision/native content operations now share recovery and page-actor validation, refuse unsaved main-editor changes before sending, and keep the editor read-only during an auxiliary request. Existing content/media handlers retain their own behavior.
- Hidden Aurora remains available through the theme-button hold or keyboard Easter egg; it is absent from ordinary theme choices.
- Responsive original media migration045 remains applied and recorded. Recorded7 October preparation produced29 smaller WebPs from10 originals; all nine original-table fingerprints matched after preparation/privacy proofs. No original media, production account, role, content or settings was changed by the9 October client release.

This is the only current deployment state in this report. Historical snapshots are preserved in [the exact previous report](docs/final-report-history-through-2026-10-09.md), SHA256 `183eba6baba3d3aab0ecd0fca369825478c821b6f15db0f8601102095cd683ca`. Statements labelled current/open/pending inside that archive describe their historical checkpoint and are not current conclusions.

## Verified release gates

| Gate | Actual evidence for deployed 612ee8f |
|---|---|
| Local verify |255 checked files, zero diagnostics;221 unit tests; build passed |
| Full local E2E |127/127 passed5.8m, including changed-actor refusal before insertion, preserved draft/retry/cleanup and five-root-category header bounds |
| Visual comparison |42/42 unchanged references passed37.7s; dark/light/Aurora, public/Studio390/1440. Eighteen public references were previously updated only for consent text/link layout;24 Studio references unchanged; older references preserved in Git history |
| Clean committed build/deploy |Completed; Worker ID above |
| Fresh production E2E |Full85/85 production suite passed6.2m on this Worker using real Chrome; includes hidden Aurora persistence/search/accessibility,390/1440 layout and existing public/write-boundary flows |
| Source GitHub Actions |Actions37894831390 for612ee8f: verify, visual and production-smoke all completed successfully, confirmed through the GitHub connector. CI smoke is a selected subset; separate full85/85 live Chrome proof is above |
| Original data protection |No production write in this release's QA; prior original/Storage boundary and fingerprint proofs retained in media documents |

The connected browser's Studio-host session is nonstaff and correctly denies Studio. Public-host staff links are not proof of a staff session on the separate Studio host. This is role-boundary evidence, not authenticated administrator verification. Native authorized Studio review is still outstanding; no browser identity or evidence is fabricated.

Native Edge921px exposed a real scrollbar/header defect in the previous c1b307e release: client width906, document scroll width913 and staff-link right913.27 outside header right882. Current612ee8f repairs that spacing: a fresh native reload proves document scroll/client width906 and staff-link/header right882; no horizontal overflow and no captured warning/error. The stronger local fixture includes five categories/two disclosures and tests901/921/1024/1100 against client width and header bounds. The main editor's page-actor guard is also deployed, with meaningful local refusal/no-insert/retry proof. Current native authorized Studio review remains outstanding. Details: [public shell follow-up](docs/public-shell-followup-2026-10-09.md).

## Historical actor and membership release retained in current production

Generic form submissions capture their authorized Studio page actor. An explicitly different current staff session is rejected409 before writes; fields stay editable and preserved. Legacy/native API requests without this optional actor field still use existing server authorization and are not claimed universally actor-bound.

Studio member creation UI/API now match the user's approved8..128 character rule without forced character types. Production Supabase Auth policy is unchanged. Local7-character API rejection,8-lowercase account create/login/permission checks/cleanup passed; no production account was created/deleted. Actor-only full121/121 passed5.8m. Combined membership/comments/CRUD checks8/8 passed24.5s; final verify249 files/221 units/build passed. Final combined121-case local suite71008 passed121/121 in5.3m. Unchanged36-screen visual comparison passed36/36 in32.7s, run sequentially after that server ended. Normal commit/push and clean deployment completed as1fb9eb1/Worker eabe551c. Final live regression82/82 and source Actions37854993962 passed. Native authorized staff checks remain outstanding.

See [Studio form recovery evidence](docs/studio-crud-recovery-2026-10-09.md).

## Full fourteen-item objective remains active

The scope is preserved in [the binding scope document](docs/premium-webmaster-2026-10-06.md). [The current requirement-by-requirement audit](docs/premium-completion-audit-2026-10-09.md) identifies proofs and gaps for all fourteen items: shared design system, Studio simplification, performance, resilience, visual automation, transitions, configurable hero, micro interactions, original image inspection, staff palette, device preview, save/revision history, private health/trends and loading/retry.

Remaining applicable work includes:

- Native staff verification of the actor/password management changes; full local/live/visual/source CI gates passed for that previous release.
- Native authorized Studio desktop/phone/short-viewport review and wider management error/pending/keyboard states.
- Native staff review of the newly wrapped translation/revision/native-only flows; broader member/access/message/comment management error/pending states.
- Broader performance/slow-network review; current responsive-image local/live/visual/source CI gates passed, with actual candidate selection, byte reduction and original preservation proof.
- Finish performance/slow-network review and final completion audit against every explicit requirement. Earlier successful feature checkpoints do not close this scope.
- Native authorized Studio review remains outstanding. Header containment, main-editor page-actor guard, newsletter alignment and inactive public-index module omission are deployed with completed local/live/source CI gates.
- Ordinary account logout currently relies on the SDK's default global scope; repair it to local scope with meaningful session/failure coverage before using the account-switch path. Neither logout control was submitted during native review; no real sessions were revoked.

## Measured performance, not organic traffic

Sequential Lighthouse13.5.0 mobile samples on the previous measuredb7d0682 release after all local/full production test processes ended: home98/LCP2102ms/678316 bytes, article97/LCP2402ms/286562 bytes; both CLS0/TBT0 and automated accessibility/practices/SEO100. These are single lab samples, not field CWV, medians, causal proof or organic traffic. QA URLs use the measurement exclusion marker. Article transfer is22.1% below the prior single sample, but request inspection attributes most of that comparison to an offscreen related image absent from the new capture; it does not prove that the same downloaded image became smaller. Native keyboard navigation subsequently loaded both related cards correctly. CSS blocking and slow-network observations remain applicable follow-up work.

Last measured settings, transfer breakdown and limitations: [lazy-image evidence](docs/lazy-image-selection-2026-10-09.md), [compact metrics](docs/lazy-image-performance-2026-10-09.json). Previous sample: [historical performance evidence](docs/performance-followup-2026-10-09.md). Original media/Storage/privacy proofs: [responsive media evidence](docs/media-renditions-2026-10-07.md). Mobile editing geometry: [short viewport evidence](docs/editor-short-viewport-2026-10-07.md).

## External/user-dependent items and exclusions

Custom SMTP, optional Cloudflare Access, Search Console field CWV/indexing maturation and manual assistive-technology review remain external/user-dependent where their prior artifacts record them. They do not justify stopping independent technical work. Application MFA is excluded per the user's instruction; it is not a new required gate. Search Console verification, production role/content-type/transaction proofs already recorded in prior artifacts are not relabelled unverified merely because older archive entries predate them.

## Preservation and completion status

Existing architecture, Git history, original content/media/accounts and production permissions are preserved. No force push. Runtime source was committed and deployed cleanly. Responsive-image work is deployed; its release gates are recorded separately. The goal is active, not complete and not blocked. Completion requires the full scope and current gates to be proved, normal main push, QA cleanup, clean Git and one accurate final production state.
