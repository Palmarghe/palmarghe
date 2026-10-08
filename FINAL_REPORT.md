# Palmarghe — current production report

## Current production state — 9 October 2026

- Worker: `485bb85d-8ddd-4fbf-804a-86852d1663f4`.
- Deployed runtime source: `b7d0682`, normally pushed to `Palmarghe/palmarghe` main; clean committed build/deploy passed.
- Lazy cards/body media now use actual rendered source size with preserved fallback sizes. Archive/category cards now expose their existing RLS-bound ready derivatives; originals, dimensions, eager LCP loading and inspector URLs are preserved.
- Studio generic management forms preserve input after failed saves, use bounded verified redirects and block duplicate pending submissions. Existing content/media handlers retain their own behavior.
- Hidden Aurora remains available through the theme-button hold or keyboard Easter egg; it is absent from ordinary theme choices.
- Responsive original media migration045 remains applied and recorded. Recorded7 October preparation produced29 smaller WebPs from10 originals; all nine original-table fingerprints matched after preparation/privacy proofs. No original media, production account, role, content or settings was changed by the9 October client release.

This is the only current deployment state in this report. Historical snapshots are preserved in [the exact previous report](docs/final-report-history-through-2026-10-09.md), SHA256 `183eba6baba3d3aab0ecd0fca369825478c821b6f15db0f8601102095cd683ca`. Statements labelled current/open/pending inside that archive describe their historical checkpoint and are not current conclusions.

## Verified release gates

| Gate | Actual evidence for deployedb7d0682 |
|---|---|
| Local verify |249 checked files, zero diagnostics;221 unit tests; build passed |
| Full local E2E |121/121 passed5.3m |
| Unchanged visual comparison |36/36 passed35.0s; dark/light/Aurora, public/Studio390/1440 |
| Clean committed build/deploy |Completed; Worker ID above |
| Fresh full production E2E |83/83 passed5.9m. Focused live media3/3 passed11.3s, including actual640px phone selection/decoded bytes/original comparison and private generation boundaries |
| Source GitHub Actions |b7d0682 Actions37856721050 Success: verify7m41s (121 E2E6.4m), visual2m1s, production-smoke3m3s; total10m52s, inspected in connected Edge |
| Original data protection |No production write in this release's QA; prior original/Storage boundary and fingerprint proofs retained in media documents |

The connected browser's Studio-host session is nonstaff and correctly denies Studio. Public-host staff links are not proof of a staff session on the separate Studio host. This is role-boundary evidence, not authenticated administrator verification. Native authorized Studio review is still outstanding; no browser identity or evidence is fabricated.

## Actor and membership follow-up — deployed and regression verified

Generic form submissions capture their authorized Studio page actor. An explicitly different current staff session is rejected409 before writes; fields stay editable and preserved. Legacy/native API requests without this optional actor field still use existing server authorization and are not claimed universally actor-bound.

Studio member creation UI/API now match the user's approved8..128 character rule without forced character types. Production Supabase Auth policy is unchanged. Local7-character API rejection,8-lowercase account create/login/permission checks/cleanup passed; no production account was created/deleted. Actor-only full121/121 passed5.8m. Combined membership/comments/CRUD checks8/8 passed24.5s; final verify249 files/221 units/build passed. Final combined121-case local suite71008 passed121/121 in5.3m. Unchanged36-screen visual comparison passed36/36 in32.7s, run sequentially after that server ended. Normal commit/push and clean deployment completed as1fb9eb1/Worker eabe551c. Final live regression82/82 and source Actions37854993962 passed. Native authorized staff checks remain outstanding.

See [Studio form recovery evidence](docs/studio-crud-recovery-2026-10-09.md).

## Full fourteen-item objective remains active

The scope is preserved in [the binding scope document](docs/premium-webmaster-2026-10-06.md). [The current requirement-by-requirement audit](docs/premium-completion-audit-2026-10-09.md) identifies proofs and gaps for all fourteen items: shared design system, Studio simplification, performance, resilience, visual automation, transitions, configurable hero, micro interactions, original image inspection, staff palette, device preview, save/revision history, private health/trends and loading/retry.

Remaining applicable work includes:

- Native staff verification of the actor/password management changes; full local/live/visual/source CI gates passed for that previous release.
- Native authorized Studio desktop/phone/short-viewport review and wider management error/pending/keyboard states.
- Review unwrapped translation/revision/native-only flows without duplicating existing handlers or automatically replaying writes.
- Broader performance/slow-network review; current responsive-image local/live/visual/source CI gates passed, with actual candidate selection, byte reduction and original preservation proof.
- Reduce mobile archive filter/section density identified in native dark/light review, preserving accessible controls and original covers.
- Finish performance/slow-network review and final completion audit against every explicit requirement. Earlier successful feature checkpoints do not close this scope.

## Measured performance, not organic traffic

Sequential Lighthouse13.5.0 mobile samples on deployedb7d0682 after all local/full production test processes ended: home98/LCP2102ms/678316 bytes, article97/LCP2402ms/286562 bytes; both CLS0/TBT0 and automated accessibility/practices/SEO100. These are single lab samples, not field CWV, medians, causal proof or organic traffic. QA URLs use the measurement exclusion marker. Article transfer is22.1% below the prior single sample, but request inspection attributes most of that comparison to an offscreen related image absent from the new capture; it does not prove that the same downloaded image became smaller. Native keyboard navigation subsequently loaded both related cards correctly. CSS blocking and slow-network observations remain applicable follow-up work.

Current settings, transfer breakdown and limitations: [lazy-image evidence](docs/lazy-image-selection-2026-10-09.md), [compact metrics](docs/lazy-image-performance-2026-10-09.json). Previous sample: [historical performance evidence](docs/performance-followup-2026-10-09.md). Original media/Storage/privacy proofs: [responsive media evidence](docs/media-renditions-2026-10-07.md). Mobile editing geometry: [short viewport evidence](docs/editor-short-viewport-2026-10-07.md).

## External/user-dependent items and exclusions

Custom SMTP, optional Cloudflare Access, Search Console field CWV/indexing maturation and manual assistive-technology review remain external/user-dependent where their prior artifacts record them. They do not justify stopping independent technical work. Application MFA is excluded per the user's instruction; it is not a new required gate. Search Console verification, production role/content-type/transaction proofs already recorded in prior artifacts are not relabelled unverified merely because older archive entries predate them.

## Preservation and completion status

Existing architecture, Git history, original content/media/accounts and production permissions are preserved. No force push. Runtime source was committed and deployed cleanly. Responsive-image work is deployed; its release gates are recorded separately. The goal is active, not complete and not blocked. Completion requires the full scope and current gates to be proved, normal main push, QA cleanup, clean Git and one accurate final production state.
