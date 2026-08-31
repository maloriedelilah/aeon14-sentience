import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { themeOverridePlugin } from './vite-plugins/theme-override.mjs';
import { themeStylesOverridePlugin } from './vite-plugins/theme-styles-override.mjs';

export default defineConfig({
  site: 'https://sentience.aeon14.com',
  output: 'static',
  adapter: cloudflare({
    imageService: 'passthrough',
    prerenderEnvironment: 'node',
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [themeOverridePlugin(), themeStylesOverridePlugin()],
  },
});
