import { defineConfig } from 'vitest/config';
import { imageCodecsPlugin } from './scripts/image-codecs.mjs';
export default defineConfig({ plugins:[imageCodecsPlugin()], test: { include: ['src/**/*.test.ts'] } });
