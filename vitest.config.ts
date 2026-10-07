import { defineConfig } from 'vitest/config';
import { imageCodecsPlugin } from './scripts/image-codecs.mjs';
// PostgreSQL WASM and image decoders are memory-heavy: keep the full test scope
// while avoiding dozens of concurrent native/WASM isolates on high-core hosts.
export default defineConfig({ plugins:[imageCodecsPlugin()], test: { include: ['src/**/*.test.ts'],maxWorkers:2 } });
