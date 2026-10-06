# Aurora hidden theme — 6 October 2026

Aurora uses petrol #10262A/#19343A, warm text #F5F1E8, apricot #FFBE98 and restrained mint #91D9C2. It is not listed as a third choice in the normal theme controls. Hold the existing theme control for 1.4 seconds (phone or mouse), or press Alt+Shift+A outside editing fields/dialogs. Moving away, scrolling motion and pointer cancellation cancel the hold. A normal click leaves Aurora for light mode; next click returns dark. Preference persists locally across public/Studio page navigation and synchronizes open same-origin tabs.

Original assets, publication values, geometry and security roles are untouched. Existing mobile logo portal remains independent. Theme applies through shared tokens; inline appearance accent is overridden only while Aurora is active. Notification is localized, accessible and nonblocking. No new tracking, dependency or migration.

Local Aurora tests2/2 passed including persistence, discovery, public 320/1440 overflow/axe and Studio dashboard/content axe. Full verify193 files zero diagnostics,178 unit tests and build passed. Full E2E and production rollout remain pending at this checkpoint. Wider premium scope remains open in premium-webmaster-2026-10-06.md.

Rollback: normal theme control exits immediately; to remove the feature restore the theme script and Aurora CSS changes from the previous Git revision through a normal revert/redeploy, preserving site settings.
