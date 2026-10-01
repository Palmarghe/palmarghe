# Palmarghe editorial pointer

## Current modal regression — 1 October 2026

Worker `c6b42a8f-8a2a-42e7-882b-3a9e0b5a5fda`. Gallery, mobile secret and Studio editor dialogs now lock background scrolling, contain Tab/Shift+Tab, restore focus for all close paths and dismiss only on a genuine backdrop press/release. Clicking gallery content does not dismiss it. Editor close is a non-submitting button: empty required fields no longer prevent cancellation or accidentally insert content. Native Escape and theme behavior are preserved.

Verify: Astro 0 diagnostics, Vitest 23/23, build success; complete local E2E 46/46. Relevant production modal/navigation/cursor tests passed 10/10. The real local gallery publication flow passed; the deployed gallery asset and CSS were tested at 390/1440 px in both themes with a controlled DOM fixture, because no gallery item is currently published. Fixture does not write production content. Mobile portal live tests cover wheel scroll, keyboard loop, backdrop/Escape, focus restore and serious/critical axe in both themes. Authenticated live Chrome Studio verified empty-link cancellation, focus loop and restore, scroll lock, desktop dark and 390 px mobile light (dialog bounds 19–371 px). No content was saved.

Previous commit 82b730a Actions succeeded: https://github.com/Palmarghe/palmarghe/actions/runs/36916288533. The current commit Actions result is checked after push. The full webmaster objective is still active; this closes concrete modal defects, not every form/dropdown/SEO/performance requirement.


## Design choice

Three directions were weighed before changing the cursor:

1. A miniature Palmarghe P logo is immediately recognizable, but reads like a branded pointer sticker and becomes noisy at normal cursor size.
2. Four offset crop marks around a small P-shaped index suggest registration and editorial precision. It stays legible at 22 px, uses the existing brand mark as a cue, and changes through geometry instead of a large glow.
3. A scanning ring or orbital reticle feels technical, but is visually generic and conflicts with the brief's request to avoid a circle-with-ring cursor.

The segmented crop-mark index is the chosen direction. It has no trail, blend mode, pointer magnetism, glow, or persistent rotation.

## States and fallback

`public/scripts/cursor-glow.js` keeps state selection in one function and supports default, internal link, external link, button, image, text, native control, loading, and explicitly marked drag states. The small P index remains the same mark; hover only parts its corners slightly, buttons strengthen one accent tick, and external links reveal a small arrow. Prose and editable controls use the native text cursor. While the search dialog is open, the branded pointer is moved into its top-layer subtree so it remains visible over buttons and results; text inputs retain the native text cursor with an accent-colored caret. Closing search moves the branded pointer back to the page. Keyboard navigation hides the custom cursor and keeps the normal focus outline.

The script does not initialize without both a fine pointer and hover, or when reduced motion is requested. The CSS `cursor:none` rule only applies after the cursor element has been installed; a script failure before installation leaves the browser cursor unchanged. Pointer coordinates update once per animation frame through a transform. The search dialog spans the viewport while open, with the scrollable search card nested inside it; this prevents the top-layer dialog from clipping the pointer when search first opens. Closed dialog state is explicitly hidden because the open-state layout uses flex. The editor and other dialogs keep their own sizing and stacking behavior.

## Verification matrix

`e2e-production/cursor.spec.ts` covers the live Chrome homepage/article, internal and external links, button press, reading text, image, search modal, dark/light color tokens, 2x device scale, 125%-equivalent desktop layout width, reduced motion, and touch-device exclusion. `e2e-production/mobile-navigation.spec.ts` additionally checks that the mobile menu locks background scrolling, traps Tab/Shift+Tab, restores focus on Escape, preserves the mobile portal, and works with JavaScript disabled.

The Playwright browser matrix passed on Chrome, Edge and WebKit (the Safari engine) against production. Firefox tests were authored and attempted, but the bundled Windows Firefox process failed before test startup with `spawn UNKNOWN`; Windows SideBySide diagnostics identified its missing `mozglue` activation-context manifest. The Firefox result remains unverified. The previously verified pointer matrix passed 9/9 on Chrome, Edge and WebKit, including native text/checkbox pointer behavior and rapid movement synchronization. The earlier live production suite passed 31/31 on 1 October 2026. Firefox remains unverified because the local bundled Windows runtime cannot launch its Playwright executable (SideBySide `mozglue` activation-context error).


## Latest follow-up — 1 October 2026

Current Worker: `32e04843-2abd-43d1-9ba3-710e1d6afe9d`. Search pointer top-layer synchronization is explicit on opening. Cursor position transition lag and privacy UI conflation are fixed: rendered geometry is checked, mandatory legal notice reading acknowledgements are distinct from newsletter opt-in, and localized contact notice links are present. Legal text and production content are unchanged. Verify: Astro 0 diagnostics, unit 23/23, build passed; full local E2E 46/46 and final local cursor regression passed. Preceding Worker production 36/36. Current pointer matrix: Chrome/Edge 10/10 and WebKit 5/5 passed against production. WebKit was installed after its initial executable-missing result; its successful rerun used a separate output directory. This does not close the full webmaster scope or physical Safari/zoom/assistive-technology/SMTP gates.

Final live pointer matrix: Chrome 5/5, Edge 5/5, WebKit 5/5. Both themes retain visible search controls and native text cursor/caret. Screenshot inspection confirmed the pointer on the search close control. Full production run passed 36 cases; one layout case hit a test-artifact directory collision during parallel runs and passed 1/1 when rerun alone. All 37 production cases therefore passed across the full run and isolated rerun. No product assertion failed in that run.
