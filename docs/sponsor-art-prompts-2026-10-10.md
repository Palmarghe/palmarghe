# Advertisement artwork — built-in imagegen — 10 October 2026

All three images were generated with the built-in imagegen tool, reviewed visually, and optimized to 512px WebP without cropping. Original generated PNGs remain in Codex's generated_images directory. They are editorial illustrations, not official game screenshots or official platform brand assets.

## FM27
Final asset: `public/ads/fm27-stadium-v1.webp` — 45,948 bytes.
Destination verified against the [official Football Manager site](https://www.footballmanager.com/).

Prompt:
> Use case: ads-marketing. Create a premium photorealistic editorial advertising thumbnail for Football Manager 27 linking to the official website, for Palmarghe independent digital publication. Landscape 4:3 composition. A beautiful floodlit football stadium viewed from the manager's touchline, a discreet tactical board in the foreground, realistic materials and pitch, no people close up. Restrained obsidian, graphite, violet highlights and warm stadium lights, balanced luminous midtones so readable on dark and light website surfaces. One clear centered subject, simple coherent silhouette readable at 88px thumbnail size, polished but believable, no text, no logos, no fake game screenshots, no watermarks. Fill the frame with football atmosphere without busy detail.

## YouTube
Final asset: `public/ads/palmarghe-youtube-v1.webp` — 17,858 bytes.
Destination: `https://www.youtube.com/@palmarghe`, read from the site's existing public footer configuration.

Prompt:
> Use case: ads-marketing. Create a premium photorealistic 3D editorial thumbnail for Palmarghe's YouTube channel. Landscape 4:3 composition. A sculptural red play triangle enclosed in a softly rounded dark glass rectangle, photographed on a refined graphite creative studio desk, subtle violet rim light, warm soft highlights, balanced midtones. Centered simple composition readable at 88px size, tactile realistic materials, cinematic but restrained, tasteful joyful premium energy. Harmonize with obsidian dark and warm ivory light website themes. No text, no letters, no watermarks, no fake screenshots, no secondary symbols.

## GitHub
Final asset: `public/ads/palmarghe-github-v1.webp` — 19,166 bytes.
Destination: `https://github.com/Palmarghe`, the profile belonging to the existing repository owner.

Prompt:
> Use case: ads-marketing. Create a premium photorealistic 3D editorial thumbnail for Palmarghe's GitHub projects page. Landscape 4:3 composition. A single sculptural code-branch shape with three luminous rounded nodes, satin metallic graphite and subtle violet luminous connecting paths, sitting on a quiet polished dark studio desk, soft ivory reflected light. Centered crisp simple shape readable at 88px size, real tactile materials, programming and open-source creativity suggested without literal screen code. Balanced luminous midtones to fit both dark obsidian and warm ivory website themes. No text, letters, logos, watermarks, fake screenshots or dense detail.

## Data operation
Before changing the live record, the exact existing advertising row was backed up in `advertising-before-fm27-youtube-github-2026-10-10.json`. The accompanying SQL changes only that row and uses an exact-value compare-and-swap inside a transaction; it refuses a concurrent Studio edit. Visibility, device, scope, schedule, publisher and slot settings are preserved. To undo, restore the backed-up value only after comparing the then-current row; never blindly replay it over a later user edit.
