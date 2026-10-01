import sharp from 'sharp';
import { stat } from 'node:fs/promises';

// Preserve the originals and composition; generate only smaller local candidates.
for (const category of ['ai', 'gaming', 'fm', 'lab']) {
  const base = `public/visuals/editorial-${category}`;
  for (const width of [480, 768, 960]) {
    const target = `${base}-${width}.webp`;
    await sharp(`${base}.webp`).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(target);
    console.log(`${target}: ${(await stat(target)).size} bytes`);
  }
}
