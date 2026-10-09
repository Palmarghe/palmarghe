# Public date and time

The public footer now includes a restrained date/time rail between the site description and legal/social navigation. It uses the existing theme tokens in dark, light and hidden Aurora, with tabular clock numerals and a stacked layout on narrow phones. The header and editorial hierarchy are preserved.

Time is explicitly Europe/Istanbul (UTC+3), localized in Turkish or English, displayed to the minute. The client updates at the minute boundary and on returning to a visible tab; hidden tabs stop scheduling updates. Page lifecycle cleanup and back/forward-cache restoration are included. No background clock API, location permission, account or database request is added. The repaired client loads two same-origin static modules. No automatic live-region announcement occurs each minute. Browser/device time supplies the instant; this is not an independently synchronized authoritative time service.

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

## CSP repair deployed and subsequent evidence

Runtime9521511 / Worker25df877a-4289-4ab5-a143-83ccf16b4d42 deployed from a clean normally pushed commit. Both external clock modules uploaded. Initial repaired scoped run passed3/5: the first phone read still failed and the console probe captured one old inline-clock hash. The preserved first phone network trace shows site-clock.js200 but its formatter dependency404/text-html. A later unmodified scoped run passed5/5 in15.1s. Five inspected current public HTML responses contain the external module and no executable inline script. All four clock-script reads on apex/Studio now200/text-javascript and byte-identical to the clean build. This establishes current readiness, not an all-edge or future deployment guarantee; provider root cause for the initial404 is not proven.

Actual native Chrome now available after the previous Edge connection disappeared. Fresh public reload in dark theme: date9 Ekim2026, clock22:52 then22:53 without reloading, datetime advanced to19:53:00.037Z. Desktop client/scroll1905. Native responsive viewport390×844: client/scroll375, clock bounds16..359 and70.58px height; date wraps below the timezone. Tablet768×1024: client/scroll753, clock bounds24..729 and46.19px height; date/time align with timezone on one row. Temporary viewport reset afterwards. Screenshot inputs checked empty; no private values exported or production form submitted.

Full repaired live run:90 passed/1 failed7.3m. All four clock-update cases and the browser-error check passed. The remaining failure was independent archive density with the now-visible illustrated header advertisement: first content heading top874.16px at320×844. An ad-aware archive heading spacing repair is staged, preserving ad settings and44px filter targets. Controlled local media/content/ad fixture restores the original ad form values and deletes its test content/media; combined archive/clock checks6/6 passed29.2s. Final combined release gates are in progress.

Final ad-aware local regression143/143 passed7.6m. Three phone archive references were reviewed and reduced44px; final visual48/48 passed43.9s, other45 unchanged relative9521511. Actual authorized native Chrome Studio health confirms9521511a811d/build22:48:15, accessible Auth/database/media and67ms database control.
Final combined verify:278 checked files, zero diagnostics,244 unit tests and build passed. Production follow-up pending.
