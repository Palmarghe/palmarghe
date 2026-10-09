# Palmarghe — current production report

## Current production state — 9 October 2026

- Worker: `0dcec388-5a04-46ec-ad99-2bcbc54273da`.
- Deployed runtime source: `106565f`, normally pushed to `Palmarghe/palmarghe` main; clean committed build/deploy passed. This includes41c0d25 archive/auxiliary recovery and the subsequent no-JavaScript navigation repair.
- Phone archive discovery uses compact aligned filters. JavaScript-disabled navigation remains usable in normal document flow and does not cover the filter action.
- Lazy cards/body media now use actual rendered source size with preserved fallback sizes. Archive/category cards now expose their existing RLS-bound ready derivatives; originals, dimensions, eager LCP loading and inspector URLs are preserved.
- Studio generic management forms preserve input after failed saves, use bounded verified redirects and block duplicate pending submissions. Translation/revision/native content operations now share recovery and page-actor validation, refuse unsaved main-editor changes before sending, and keep the editor read-only during an auxiliary request. Existing content/media handlers retain their own behavior.
- Hidden Aurora remains available through the theme-button hold or keyboard Easter egg; it is absent from ordinary theme choices.
- Responsive original media migration045 remains applied and recorded. Recorded7 October preparation produced29 smaller WebPs from10 originals; all nine original-table fingerprints matched after preparation/privacy proofs. No original media, production account, role, content or settings was changed by the9 October client release.

This is the only current deployment state in this report. Historical snapshots are preserved in [the exact previous report](docs/final-report-history-through-2026-10-09.md), SHA256 `183eba6baba3d3aab0ecd0fca369825478c821b6f15db0f8601102095cd683ca`. Statements labelled current/open/pending inside that archive describe their historical checkpoint and are not current conclusions.

## Verified release gates

| Gate | Actual evidence for deployed106565f |
|---|---|
| Local verify |252 checked files, zero diagnostics;221 unit tests; build passed |
| Full local E2E |124/124 passed5.4m, including actual no-JavaScript filter clicks and auxiliary recovery |
| Visual comparison |42/42 passed37.8s; dark/light/Aurora, public/Studio390/1440. Six archive references added; previous36 preserved |
| Clean committed build/deploy |Completed; Worker ID above |
| Fresh production E2E |Focused archive/media4/4 passed18.0s on current Worker, including no-JavaScript navigation geometry/actual filter click and real smaller rendition/privacy checks. Full84/84 production suite passed6.0m |
| Source GitHub Actions |Current106565f Actions37888766838 Success: verify8m50s (124 E2E7.3m), visual2m5s, production-smoke2m49s; total11m45s, inspected in connected Edge. Historical41c0d25 Actions37859878195 passed verify124 and visual but failed production-smoke; the independent live run identified its actual no-JavaScript menu interception, now repaired and live4/4 verified. Historicalb7d0682 Actions37856721050 and docs9365ccf Actions37857925629 succeeded |
| Original data protection |No production write in this release's QA; prior original/Storage boundary and fingerprint proofs retained in media documents |

The connected browser's Studio-host session is nonstaff and correctly denies Studio. Public-host staff links are not proof of a staff session on the separate Studio host. This is role-boundary evidence, not authenticated administrator verification. Native authorized Studio review is still outstanding; no browser identity or evidence is fabricated.

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
- Archive density and no-JavaScript fallback are repaired and deployed with full production84/84 and source Actions green; accessible controls and original covers are preserved.
- Finish performance/slow-network review and final completion audit against every explicit requirement. Earlier successful feature checkpoints do not close this scope.
- Repair shared newsletter consent sentence alignment; remove demonstrably unused home-page comment/readership/library downloads while preserving article, author and account interactions. Native921px staff header also needs its Studio arrow kept on one line without introducing overflow.

## Measured performance, not organic traffic

Sequential Lighthouse13.5.0 mobile samples on the previous measuredb7d0682 release after all local/full production test processes ended: home98/LCP2102ms/678316 bytes, article97/LCP2402ms/286562 bytes; both CLS0/TBT0 and automated accessibility/practices/SEO100. These are single lab samples, not field CWV, medians, causal proof or organic traffic. QA URLs use the measurement exclusion marker. Article transfer is22.1% below the prior single sample, but request inspection attributes most of that comparison to an offscreen related image absent from the new capture; it does not prove that the same downloaded image became smaller. Native keyboard navigation subsequently loaded both related cards correctly. CSS blocking and slow-network observations remain applicable follow-up work.

Last measured settings, transfer breakdown and limitations: [lazy-image evidence](docs/lazy-image-selection-2026-10-09.md), [compact metrics](docs/lazy-image-performance-2026-10-09.json). Previous sample: [historical performance evidence](docs/performance-followup-2026-10-09.md). Original media/Storage/privacy proofs: [responsive media evidence](docs/media-renditions-2026-10-07.md). Mobile editing geometry: [short viewport evidence](docs/editor-short-viewport-2026-10-07.md).

## External/user-dependent items and exclusions

Custom SMTP, optional Cloudflare Access, Search Console field CWV/indexing maturation and manual assistive-technology review remain external/user-dependent where their prior artifacts record them. They do not justify stopping independent technical work. Application MFA is excluded per the user's instruction; it is not a new required gate. Search Console verification, production role/content-type/transaction proofs already recorded in prior artifacts are not relabelled unverified merely because older archive entries predate them.

## Preservation and completion status

Existing architecture, Git history, original content/media/accounts and production permissions are preserved. No force push. Runtime source was committed and deployed cleanly. Responsive-image work is deployed; its release gates are recorded separately. The goal is active, not complete and not blocked. Completion requires the full scope and current gates to be proved, normal main push, QA cleanup, clean Git and one accurate final production state.
