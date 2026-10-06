import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import publicStylesPlugin from './scripts/public-styles.mjs';
import { imageCodecsPlugin } from './scripts/image-codecs.mjs';
import { execFileSync } from 'node:child_process';

let buildRelease = 'unavailable';
try {
  buildRelease = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], { encoding: 'utf8' }).trim();
  if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) buildRelease += '-modified';
} catch { /* A source archive has no verifiable Git revision. */ }
const buildTime = new Date().toISOString();

export default defineConfig({
  site: 'https://palmarghe.com',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  trailingSlash: 'always',
  // Development audits are unrelated to app QA and issue background requests while fixtures change.
  devToolbar: { enabled: process.env.LOCAL_TEST_MODE !== 'true' },
  vite: {
    plugins: [publicStylesPlugin(), imageCodecsPlugin()],
    define: {
      'import.meta.env.BUILD_RELEASE': JSON.stringify(buildRelease),
      'import.meta.env.BUILD_TIME': JSON.stringify(buildTime),
    },
  },
});
