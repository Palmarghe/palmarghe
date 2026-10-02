import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import publicStylesPlugin from './scripts/public-styles.mjs';

export default defineConfig({
  site: 'https://palmarghe.com',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  trailingSlash: 'always',
  vite: { plugins: [publicStylesPlugin()] },
});
