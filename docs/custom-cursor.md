# Palmarghe editorial pointer

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

The Playwright browser matrix passed on Chrome, Edge and WebKit (the Safari engine) against production. Firefox tests were authored and attempted, but the bundled Windows Firefox process failed before test startup with `spawn UNKNOWN`; Windows SideBySide diagnostics identified its missing `mozglue` activation-context manifest. The Firefox result remains unverified. The current pointer matrix passes 9/9 on Chrome, Edge and WebKit, including native text/checkbox pointer behavior and rapid movement synchronization. The current live production suite passed 31/31 on 1 October 2026. Firefox remains unverified because the local bundled Windows runtime cannot launch its Playwright executable (SideBySide `mozglue` activation-context error).
