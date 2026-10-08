# Palmarghe — current production report

## Current production state — 9 October 2026

- Worker: `eabe551c-698d-4417-840f-63e7ae230681`.
- Deployed runtime source: `1fb9eb1`, normally pushed to `Palmarghe/palmarghe` main; clean committed build/deploy passed.
- Studio generic management forms preserve input after failed saves, use bounded verified redirects and block duplicate pending submissions. Existing content/media handlers retain their own behavior.
- Hidden Aurora remains available through the theme-button hold or keyboard Easter egg; it is absent from ordinary theme choices.
- Responsive original media migration045 remains applied and recorded. Recorded7 October preparation produced29 smaller WebPs from10 originals; all nine original-table fingerprints matched after preparation/privacy proofs. No original media, production account, role, content or settings was changed by the9 October client release.

This is the only current deployment state in this report. Historical snapshots are preserved in [the exact previous report](docs/final-report-history-through-2026-10-09.md), SHA256 `183eba6baba3d3aab0ecd0fca369825478c821b6f15db0f8601102095cd683ca`. Statements labelled current/open/pending inside that archive describe their historical checkpoint and are not current conclusions.

## Verified release gates

| Gate | Actual evidence for deployed1fb9eb1 |
|---|---|
| Local verify |249 checked files, zero diagnostics;221 unit tests; build passed |
| Full local E2E |121/121 passed5.3m |
| Unchanged visual comparison |36/36 passed32.7s; dark/light/Aurora, public/Studio390/1440 |
| Clean committed build/deploy |Completed; Worker ID above |
| Fresh full production E2E |82/82 passed5.8m on the deployed Worker; a subsequent focused hidden-Aurora production check passed1/1 in4.7s, including390/1440 layouts, accessibility, search navigation and return to light theme |
| Source GitHub Actions |New1fb9eb1 run still requires inspection. Previous2759c92 Actions37852998077 Success; verify7m31s, visual2m5s, production-smoke2m50s; total10m29s, inspected in connected Edge |
| Original data protection |No production write in this release's QA; prior original/Storage boundary and fingerprint proofs retained in media documents |

Connected browser currently has a nonstaff account and correctly denies Studio. This is role-boundary evidence, not authenticated administrator verification. Native authorized Studio review is still outstanding; no browser identity or evidence is fabricated.

## Actor and membership follow-up — deployed, final live gates pending

Generic form submissions capture their authorized Studio page actor. An explicitly different current staff session is rejected409 before writes; fields stay editable and preserved. Legacy/native API requests without this optional actor field still use existing server authorization and are not claimed universally actor-bound.

Studio member creation UI/API now match the user's approved8..128 character rule without forced character types. Production Supabase Auth policy is unchanged. Local7-character API rejection,8-lowercase account create/login/permission checks/cleanup passed; no production account was created/deleted. Actor-only full121/121 passed5.8m. Combined membership/comments/CRUD checks8/8 passed24.5s; final verify249 files/221 units/build passed. Final combined121-case local suite71008 passed121/121 in5.3m. Unchanged36-screen visual comparison passed36/36 in32.7s, run sequentially after that server ended. Normal commit/push and clean deployment completed as1fb9eb1/Worker eabe551c. Final live regression/native staff checks and new source CI remain outstanding.

See [Studio form recovery evidence](docs/studio-crud-recovery-2026-10-09.md).

## Full fourteen-item objective remains active

The scope is preserved in [the binding scope document](docs/premium-webmaster-2026-10-06.md). [The current requirement-by-requirement audit](docs/premium-completion-audit-2026-10-09.md) identifies proofs and gaps for all fourteen items: shared design system, Studio simplification, performance, resilience, visual automation, transitions, configurable hero, micro interactions, original image inspection, staff palette, device preview, save/revision history, private health/trends and loading/retry.

Remaining applicable work includes:

- Finish the actor/password release live/native/CI gates; local/visual/clean deployment gates passed.
- Native authorized Studio desktop/phone/short-viewport review and wider management error/pending/keyboard states.
- Review unwrapped translation/revision/native-only flows without duplicating existing handlers or automatically replaying writes.
- Correct measured lazy-card source-size mismatch, then prove real candidate selection, bytes, reserved geometry and original inspector links.
- Finish performance/slow-network review and final completion audit against every explicit requirement. Earlier successful feature checkpoints do not close this scope.

## Measured performance, not organic traffic

Sequential Lighthouse13.5.0 mobile samples after all test/verify processes ended: home97/LCP2458ms, article94/LCP3062ms; both CLS0/TBT0 and automated accessibility/practices/SEO100. These are single lab samples, not field CWV, medians, causal proof or organic traffic. QA URLs use the measurement exclusion marker. Article source-size and CSS blocking observations remain concrete follow-up work.

Settings, transfer breakdown and limitations: [performance evidence](docs/performance-followup-2026-10-09.md), [compact metrics](docs/performance-followup-2026-10-09.json). Original media/Storage/privacy proofs: [responsive media evidence](docs/media-renditions-2026-10-07.md). Mobile editing geometry: [short viewport evidence](docs/editor-short-viewport-2026-10-07.md).

## External/user-dependent items and exclusions

Custom SMTP, optional Cloudflare Access, Search Console field CWV/indexing maturation and manual assistive-technology review remain external/user-dependent where their prior artifacts record them. They do not justify stopping independent technical work. Application MFA is excluded per the user's instruction; it is not a new required gate. Search Console verification, production role/content-type/transaction proofs already recorded in prior artifacts are not relabelled unverified merely because older archive entries predate them.

## Preservation and completion status

Existing architecture, Git history, original content/media/accounts and production permissions are preserved. No force push. Runtime source was committed and deployed cleanly. This report update is a documentation-only follow-up awaiting normal commit/push. The goal is active, not complete and not blocked. Completion requires the full scope and current gates to be proved, normal main push, QA cleanup, clean Git and one accurate final production state.
