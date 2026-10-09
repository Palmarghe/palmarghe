# Public date and time

The public footer now includes a restrained date/time rail between the site description and legal/social navigation. It uses the existing theme tokens in dark, light and hidden Aurora, with tabular clock numerals and a stacked layout on narrow phones. The header and editorial hierarchy are preserved.

Time is explicitly Europe/Istanbul (UTC+3), localized in Turkish or English, displayed to the minute. The client updates at the minute boundary and on returning to a visible tab; hidden tabs stop scheduling updates. Page lifecycle cleanup and back/forward-cache restoration are included. No network, location permission, account or database request is added. No automatic live-region announcement occurs each minute. Browser/device time supplies the instant; this is not an independently synchronized authoritative time service.

The server renders a semantic time element before JavaScript runs. Without JavaScript it remains the page-render time. The browser updates both its ISO datetime and displayed date/time, including midnight rollover.

## Validation in progress

- Final verify:274 files, zero diagnostics,244 unit cases, build passed.
- Dedicated local real Chrome checks:4/4 passed, covering320px dark,768px light,1440px Aurora, Istanbul midnight rollover, English localization, clock geometry/axe and no-JavaScript fallback.
- Visual public-page fixtures use a fixed clock instant so the actual date/time remains visible and deterministic. Other existing time masks remain in place.
- Full local regression:142/142 passed6.6m. The previously recorded navigation-abort warning was not reproduced in this run; this alone does not resolve its historical cause.
- All18 intentionally changed public footer references were inspected in readable phone/desktop contact sheets. The30 other references remain unchanged. Final visual comparison:48/48 passed41.2s without updating snapshots.
- Production deployment and live checks are being completed. No production change is claimed by this checkpoint.

Rollback uses a normal revert and clean rebuild/deploy; no migration or data rollback is needed.
