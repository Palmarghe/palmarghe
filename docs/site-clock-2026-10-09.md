# Public date and time

The public footer now includes a restrained date/time rail between the site description and legal/social navigation. It uses the existing theme tokens in dark, light and hidden Aurora, with tabular clock numerals and a stacked layout on narrow phones. The header and editorial hierarchy are preserved.

Time is explicitly Europe/Istanbul (UTC+3), localized in Turkish or English, displayed to the minute. The client updates at the minute boundary and on returning to a visible tab; hidden tabs stop scheduling updates. Page lifecycle cleanup and back/forward-cache restoration are included. No network, location permission, account or database request is added. No automatic live-region announcement occurs each minute. Browser/device time supplies the instant; this is not an independently synchronized authoritative time service.

The server renders a semantic time element before JavaScript runs. Without JavaScript it remains the page-render time. The browser updates both its ISO datetime and displayed date/time, including midnight rollover.

## Validation in progress

- Initial verify:274 files, zero diagnostics,244 unit cases, build passed. After external script repair:276 files, zero diagnostics,244 unit cases and build passed.
- Dedicated local real Chrome checks:4/4 passed, covering320px dark,768px light,1440px Aurora, Istanbul midnight rollover, English localization, clock geometry/axe and no-JavaScript fallback.
- Visual public-page fixtures use a fixed clock instant so the actual date/time remains visible and deterministic. Other existing time masks remain in place.
- Full local regression:142/142 passed6.6m. The previously recorded navigation-abort warning was not reproduced in this run; this alone does not resolve its historical cause.
- All18 intentionally changed public footer references were inspected in readable phone/desktop contact sheets. The30 other references remain unchanged. Final visual comparison:48/48 passed41.2s without updating snapshots.
- Initial611f5f1/Worker901ad088 deployment displayed the server date/time, but full production checks found that Astro inlined the small bundled client script and the existing strict CSP blocked it. Initial full run:86 passed/5 failed7.3m (four updating-clock checks and the console check). Source Actions37956662094 verify/visual succeeded; production-smoke failed. Those failures are retained as evidence, not called a passing release.
- Repair uses external same-origin module/scripts/site-clock.js and shared/scripts/site-clock-format.js, with the server importing the same formatter. No unsafe-inline or permission expansion is added. Dedicated repaired local checks4/4 passed14.7s; the test now explicitly requires external module loading and no CSP violation. Final unchanged visual comparison48/48 passed45.7s. Deployment/live checks are in progress.
- The initial native Edge screenshot proves geometry/theme/server fallback only. It did not prove minute updates; the full production test found the missing behavior. The actual authorized native health proof confirmed611f5f1040a6/build19:06:19/services accessible/database47ms. No real account/content/settings write was performed.

Rollback uses a normal revert and clean rebuild/deploy; no migration or data rollback is needed.
