# Mod publications — 4 October 2026

## Sources and content
Actual logged-in Chrome review found two Nexus Mods projects and one CurseForge project in the supplied Palmarghe profiles. All three were published through the authenticated production Studio UI, not a privileged data script. Existing publications, archived test records and users were preserved.

- Colony Director: Nexus /70, 0.4.26-alpha. Smart activity priorities, diagnostics and optional cheats. Experimental limits and non-guaranteed compatibility are explicit.
- PalmargheTR: Nexus /68, 0.9.0-rc1. Turkish localization; installation keeps base language English. Source reports 14,254 reviewed strings (13,470 changed +784 legitimately identical), build1.23.250612. Visual coverage limits and AI assistance disclosed.
- KaanBuilder: CurseForge, Minecraft1.20.1/Fabric, kaanbuilder-1.0.0.jar, early beta. Seven structure types, optional interiors/gardens/lighting, Preview/Build/Clear/Undo. No unverified dependency or broader compatibility asserted.

Each publication has source-based Turkish description, installation, limitations, SEO metadata, source date, body source link and a dedicated external project button. Live slugs and record IDs are in publications.json and production-records.json. Publications are Project content under Oyunlar → Stranded: Alien Dawn or Minecraft, not FM-specific mod content.

## Covers
Three original SVG illustrations were rendered to1200×750 WebP (approximately13–17KB), uploaded to Media, selected as covers and centered at50/50 with16:9 detail framing. Charcoal/purple geometric styling follows the existing theme. Covers are labeled promotional illustrations in each body and never represented as gameplay screenshots. Source promotional images are retained only as source reference assets. Reproduction script uses downloaded originals when available and retains included references otherwise; no new image model or download is needed to regenerate covers.

## Related defect and verification
Parent category lists previously queried only direct relationships and hid child-category projects. Category queries now include descendants, terminate malformed cycles, display child navigation and render existing covers. Unit coverage includes nested and cyclic graphs.

npm run verify: Astro0 diagnostics,174/174 unit tests, production build passed. Local cover framing/upload/publish/replacement E2E1/1 passed on rerun; initial Invalid media response was not reproduced on the clean run. Production mod E2E4/4 passed: canonical URLs, source buttons, content, cover loads/focus,390/1440px, dark/light, serious/critical axe, parent Gaming discovery and sitemap. Initial axe failures sampled mid-transition link colors; tests now wait for final theme color. Actual Chrome final colors: privacy rgb(32,29,39), footer rgb(98,93,106) in light theme. No production contrast CSS change was necessary.

Real Chrome confirmed all three Studio rows as Published, all three Gaming cards and cover images loaded1200px, responsive390px without overflow. Screenshots: gaming-chrome-light.png, gaming-chrome-dark.png, gaming-chrome-mobile.png. Worker deployed: d2b14b6d-2a9d-448c-8c15-2c2814fe892d. Normal commit/push and repository Verify workflow are the release gate.

## Rollback and limits
To revert publications, archive these three exact content IDs through Studio; keep media and revision history. Existing users and earlier publications need no change. To revert rendering, revert the category code commit and deploy the previous build/Worker45200c55-3968-4d52-bde7-5c1d8811bf0a. No SQL migration, credential or permission change was required. Game execution itself was not tested; feature descriptions come from official author project pages. No binary mods were redistributed, download statistics fabricated, or external reviews posted. The broader historical webmaster scope remains separate from this completed publication request.
