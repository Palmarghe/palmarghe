import sharp from 'sharp';
import { readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

// Build tooling only: inspect the original local assets, never rewrite their pixels.
const root = 'public';
const dimensions = {};
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else if (/\.(webp|png|jpe?g|avif)$/i.test(entry.name)) {
      const image = await sharp(path).metadata();
      if (!image.width || !image.height) throw new Error(`Missing dimensions: ${path}`);
      dimensions[`/${relative(root, path).replaceAll('\\', '/')}`] = { width: image.width, height: image.height };
    }
  }
}
await inspect(root);
const sorted = Object.fromEntries(Object.entries(dimensions).sort(([a], [b]) => a.localeCompare(b)));
await writeFile('src/lib/public-image-dimensions.json', `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Recorded ${Object.keys(sorted).length} local image dimensions; originals preserved.`);
