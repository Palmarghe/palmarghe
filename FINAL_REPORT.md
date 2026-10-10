# Palmarghe — current production report

## Current production state — 10 October 2026

- Worker: `ec9c7ced-622b-4858-86b1-4615f209071b`.
- Deployed runtime source: `3ffa2b3`, normally pushed to `Palmarghe/palmarghe` main; clean committed build/deploy passed. Earlier repairs remain included. Community management actions have themed44px targets; messages retain desktop columns and become labelled cards on phones, keeping status/save inside the viewport.
- All three first-party advertisement bands align to the public content grid, with separated original artwork/theme-aware text, restrained minimum height and no reserved space for hidden placements. Footer discovery groups real archive/collections/RSS links with the existing required-consent newsletter form. Native Chrome desktop proves all three bands1440px at left232.5, matching the header; phone client375 shows bands16..359 with no horizontal overflow. Details: [partner/footer evidence](docs/partner-footer-polish-2026-10-10.md).
- Public footer displays a restrained, localized date and minute clock in Europe/Istanbul (UTC+3), fitting phone/tablet/desktop in dark, light and hidden Aurora. External same-origin modules preserve the strict CSP and share the server/client formatter. Current live clock/update/console checks passed; actual Chrome screenshots show continued localized minute time on10 October, with bounded phone/tablet layouts. Two static module requests are added, without background clock API, database, account or location requests. Initial inline-script defect/failures remain historical evidence. Details: [date/time evidence](docs/site-clock-2026-10-09.md).
- Complete PostgREST GET responses now have a12-second per-attempt deadline, including the body. Primary content query errors return a themed503/manual retry instead of false empty/404 results; filters, private/no-store, noindex and security headers are preserved. Auth and POST RPC transports are unchanged and require separate review.
- Ordinary logout now explicitly uses local scope; the separate all-device action uses global. Remote failure shows a localized unconfirmed-revocation warning rather than claiming success. Real SDK/controlled-transport tests cover second-device refresh and both failure scopes; no production all-device revocation is claimed.
- Newsletter legal text wraps together with a permanently underlined privacy link. Required unchecked consent and existing subscription semantics are preserved. Public indexes omit three inactive interaction modules; article, account and author controls retain their required scripts.
- Phone archive discovery uses compact aligned filters and44px less heading space when the illustrated header advertisement is present. JavaScript-disabled navigation remains usable in normal document flow and does not cover the filter action.
- Lazy cards/body media now use actual rendered source size with preserved fallback sizes. Archive/category cards now expose their existing RLS-bound ready derivatives; originals, dimensions, eager LCP loading and inspector URLs are preserved.
- Studio generic management forms preserve input after failed saves, use bounded verified redirects and block duplicate pending submissions. Translation/revision/native content operations now share recovery and page-actor validation, refuse unsaved main-editor changes before sending, and keep the editor read-only during an auxiliary request. Existing content/media handlers retain their own behavior.
- Hidden Aurora remains available through the theme-button hold or keyboard Easter egg; it is absent from ordinary theme choices.
- Responsive original media migration045 remains applied and recorded. Recorded7 October preparation produced29 smaller WebPs from10 originals; all nine original-table fingerprints matched after preparation/privacy proofs. No original media, production account, role, content or settings was changed by the9 October client release.

This is the only current deployment state in this report. Historical snapshots are preserved in [the exact previous report](docs/final-report-history-through-2026-10-09.md), SHA256 `183eba6baba3d3aab0ecd0fca369825478c821b6f15db0f8601102095cd683ca`. Statements labelled current/open/pending inside that archive describe their historical checkpoint and are not current conclusions.

## Verified release gates

| Gate | Actual evidence for deployed3ffa2b3 |
|---|---|
| Local verify |282checked files,zero diagnostics;244units; final build passed10Oct18:15 |
| Full local E2E |149/149 passed8.3m after final corrections; includes171Studio section/theme/width combinations and populated records |
| Visual comparison |96/96 passed1.1m;48new phone/tablet/desktop references reviewed, six reviewed editor references changed, originals retained. Only volatile media UUID/date values masked, with metadata/value guards |
| Clean committed build/deploy |Normal main commit/push; clean committed build10Oct18:16:15 and Worker above |
| Fresh production E2E |Scoped6/6 passed1.4m including full sitemap responsive matrix; full93/93 passed8.2m |
| GitHub Actions |Runtime source3ffa2b3 Actions38062917682 visual87/96:only native empty date placeholders differed. CI-only31dc3b2 pins Windows runner culture tr-TR; corrected38063503243 verify/visual successful, production-smoke running at this checkpoint |
| Asset readiness |global.DXYy4otQ.css/index.DzU-4lzX.css and both clock modules:all eight apex/Studio reads200,expectedMIME,exact clean-build bytes |
| Native visual review |Post-deploy19Studio sections at320/768/desktop and eight public routes at390/768/1440 bounded; narrow editor ribbon retains intentional local scroll. Category44px actions reachable. Real health source3ffa2b3/services accessible/database38ms; region focus outline2px. Media Aurora validation button themed44px; inspected Studio console empty. Screenshots saved |
| Original data protection |No production account/role/content/media/settings form submission or deliberate mutation. QA query flags exclude telemetry; existing Storage/fingerprint proofs retained |

Current responsive follow-up:Studio original-artwork previews now match theme surfaces; content/category/tag/navigation/redirect/audit/traffic records become labelled phone cards with44px actions. Media validation button contrast and health trend keyboard region repaired; publication strip scrollbar is restrained and themed. Detailed evidence, failed attempts and remaining completion gates:[responsive audit](docs/responsive-visual-audit-2026-10-10.md). The preceding93dbd0b release144/48/92 and successful source CI are historical proof, not the current runtime's gate counts.

Historical native Auth/health proof on predecessor4b5aeda: normal Studio-host logout returned to login without a warning, then saved-credential sign-in opened an actual admin dashboard. Private health showed committed source4b5aedac9315 and accessible services with35ms database control. At the earlier878afd8 checkpoint, that actual admin session was retained for the homepage and palette review; no new Auth operation was performed. The earlier nonstaff denial is historical. Current native Chrome/mobile/short-viewport review and wider staff interactions remain required. No credential values are copied into reports or Git.

Native Edge921px exposed a real scrollbar/header defect in the previous c1b307e release: client width906, document scroll width913 and staff-link right913.27 outside header right882. The612ee8f repair, retained in subsequent releases, corrected that spacing: a fresh native reload proves document scroll/client width906 and staff-link/header right882; no horizontal overflow and no captured warning/error. The stronger local fixture includes five categories/two disclosures and tests901/921/1024/1100 against client width and header bounds. The main editor's page-actor guard is also deployed, with meaningful local refusal/no-insert/retry proof. Historical native authorized health confirmed93dbd0bfc75e/build10Oct12:53:39/services accessible/database55ms; broader staff review remains outstanding. Details: [public shell follow-up](docs/public-shell-followup-2026-10-09.md).

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
- Wider native authorized Studio review remains outstanding. Header containment, main-editor page-actor guard, newsletter alignment and inactive public-index module omission are deployed with completed local/live/source CI gates.
- Continue broader native staff review. Ordinary logout scope is repaired and normal live sign-out/sign-in is verified, with completed current-source gates; all-device revocation is covered by controlled SDK transport rather than real-session cancellation.
- Inspect the local aborted-transition warning and native Edge opt-in transition error recorded during navigation; green functional counts do not prove a clean console for those native transitions.
- Investigate production rollout asset readiness: captured first contact CSS404 caused unstyled-header axe failure, despite current200 and3/3 exact follow-up scans. Initial full run remains85/86; no blanket deploy availability guarantee is inferred.
- Homepage intermediate-width overflow is repaired in ea65450. Native Edge921px now has client/scroll906, panel right869.17 and Spotlight right844.17; Escape closes the palette and returns opener focus, and actual device preview is390px. Before/after proof and regression evidence: [containment review](docs/studio-homepage-containment-2026-10-09.md). Wider native staff/phone review remains applicable.

Historical878afd8 native community review: message Save and four member Apply buttons44px and bounded; message controls use correct light/Aurora colors, dark preference restored. Actual member UI has minlength8. No account/profile/message/role/settings form submitted; no private identities/values exported. Populated comment recovery is controlled local proof, not native production empty-list proof. Details: [community controls](docs/studio-community-controls-2026-10-09.md).

## Measured performance, not organic traffic

Sequential Lighthouse13.5.0 mobile samples on the previous measuredb7d0682 release after all local/full production test processes ended: home98/LCP2102ms/678316 bytes, article97/LCP2402ms/286562 bytes; both CLS0/TBT0 and automated accessibility/practices/SEO100. These are single lab samples, not field CWV, medians, causal proof or organic traffic. QA URLs use the measurement exclusion marker. Article transfer is22.1% below the prior single sample, but request inspection attributes most of that comparison to an offscreen related image absent from the new capture; it does not prove that the same downloaded image became smaller. Native keyboard navigation subsequently loaded both related cards correctly. CSS blocking and slow-network observations remain applicable follow-up work.

Last measured settings, transfer breakdown and limitations: [lazy-image evidence](docs/lazy-image-selection-2026-10-09.md), [compact metrics](docs/lazy-image-performance-2026-10-09.json). Previous sample: [historical performance evidence](docs/performance-followup-2026-10-09.md). Original media/Storage/privacy proofs: [responsive media evidence](docs/media-renditions-2026-10-07.md). Mobile editing geometry: [short viewport evidence](docs/editor-short-viewport-2026-10-07.md).

## External/user-dependent items and exclusions

Custom SMTP, optional Cloudflare Access, Search Console field CWV/indexing maturation and manual assistive-technology review remain external/user-dependent where their prior artifacts record them. They do not justify stopping independent technical work. Application MFA is excluded per the user's instruction; it is not a new required gate. Search Console verification, production role/content-type/transaction proofs already recorded in prior artifacts are not relabelled unverified merely because older archive entries predate them.

## Preservation and completion status

Existing architecture, Git history, original content/media/accounts and production permissions are preserved. No force push. Runtime source was committed and deployed cleanly. Responsive-image work is deployed; its release gates are recorded separately. The goal is active, not complete and not blocked. Completion requires the full scope and current gates to be proved, normal main push, QA cleanup, clean Git and one accurate final production state.

Historical508c59d native Edge proof: actual public homepage reload retained Aurora with12 loaded main images and client/scroll906. Normal header archive/filter navigation returned three real project results with retained filters and client/scroll906. Actual admin Studio health confirms committed508c59d611cd, Auth/database/media accessible and34ms database control; empty24h samples remain unmeasured. Those two native tabs recorded no warning/error in the inspected window. This is not native phone or deliberate production outage proof. New recovery implementation/evidence/limits: [server read resilience](docs/server-read-resilience-2026-10-09.md).

Historical611f5f1 native Edge proof (server fallback/geometry only): the public Aurora footer displays9 Ekim2026/19:07, client/scroll width906, clock bounds24..882, with an empty newsletter input. Actual authorized Studio health confirms source611f5f1040a6/build19:06:19, Auth/database/media accessible and47ms database control; absent24h observations remain unmeasured. Both inspected console windows contain no warning/error. This is desktop native proof; responsive clock proof is automated real Chrome at320/768/1440. See docs/site-clock-live-611f5f1-2026-10-09.png.
