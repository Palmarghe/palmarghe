# Profile recovery audit — 2 October 2026

## Defects and correction

- Empty author_slug was passed as an empty string despite SQL requiring NULL or a valid slug. A broad fallback then saved only display_name and reported success. The canonical profiles table now receives one atomic update scoped to the current user. No Auth metadata write occurs. A returned row is required before success.
- GET previously fell back to incomplete profile data on an extended read failure. It now returns 503, leaving saving disabled with an explicit retry. Null display names from existing accounts remain valid to load and must be filled before save.
- Network failures previously lacked useful recovery and duplicate-submit protection. Loading/saving disable controls, typed values remain after failure, address errors identify the field, and session expiry is explained. FormData is captured before disabling fields.
- Profile hover axe found white on decorative violet #8b5cf6 at 4.23:1. Shared button hover now uses #6d28d9; brand/caret accent is preserved.

## Evidence and limits

Worker 5ae7c25a-3438-44e1-a79d-c5d97a63c96e. Verify: Astro zero errors/warnings/hints, 65 unit tests and build success. Eight new API tests cover atomic/null-slug writes, duplicate/permission/service failures without fallback, missing public address, invalid avatar/origin/session, no returned row and failed GET. These mock the database boundary; they do not prove production constraints. Existing local adapter E2E persists actual profile values and renders them in comments; member/group/follow plus recovery tests 4/4.

Deployed profile script is tested in anonymous HTML augmented with a local login marker and intercepted profile transport. Service workers are blocked in fixtures so their forwarded requests cannot bypass interception. This avoids production Auth/profile writes. Four TR desktop/EN mobile × dark/light cases prove load failure/retry, network error, duplicate-address display, retained bio, successful recovery and duplicate-submit guarding. Each checks overflow and serious/critical axe findings. Final combined production suite 7/7 including two protected invalid-session clearing responses and search cursor regression.

Real Chrome existing admin account was read only: aria-busy=false, save enabled, existing display name loaded, 20 preset avatars, empty error status. No real profile/content/account changed. Actual production profile write and conflict cases remain unclaimed; no production-complete statement is inferred from transport fixtures. Keyboard and all-form accessibility breadth remain open under the webmaster ledger.

## Rollback

Revert this commit and rebuild/deploy. No migration or data cleanup required. Preserved Auth metadata can still provide legacy bio/avatar fallback when canonical fields are NULL.
