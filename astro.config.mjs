import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://palmarghe.com',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  trailingSlash: 'always',
});
