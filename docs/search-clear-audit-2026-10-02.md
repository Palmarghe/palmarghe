# Search clear audit — 2 October 2026

Worker `90ef6f57-c845-4f40-aa5d-25992490019f` is deployed. No production content, accounts or files changed. Migrations036/037 remain active.

The modal and full search page now share a progressive explicit clear button with TR/EN labels, a 44px hit target and theme tokens. It is outside the input label, hidden for empty queries, preserves publication type and restores input focus. Native text/pointer cursors remain active. The original GET form works without JavaScript; the enhancement does not create a nonfunctional no-JS button. A versioned script URL updates cached clients.

Verification: Astro0 errors/warnings/hints, unit125/125, successful build. Local2/2 and production11/11: TR/EN × 320/1440px × dark/light, keyboard clear, focus, type preservation, horizontal overflow, serious/critical modal axe, no-JS GET, existing cursor/search/focus/network regression. The first local test incorrectly clicked the hidden desktop trigger at mobile width; corrected to use the visible mobile navigation and reran successfully.

Actual Chrome shows one real Yamal result, clear control, empty value and restored text-field focus after click. Screenshot: search-clear-2026-10-02.png. One earlier browser call timed out; the replacement tab was inspected rather than repeating a submission. This was read-only search interaction.

Previous durable-media release d376721 Actions37042191255 succeeded. Current release CI is checked after push. Roll back Worker to `0bf6fda5-3fd1-4b00-972d-0edfe01033e4` if necessary, preserving database migrations and media receipts.

This advances requirements13/15/16/36, not the full forty-section completion audit. Physical Safari/Firefox, manual assistive technology, upload safety, full Studio state coverage and performance gates remain open.
