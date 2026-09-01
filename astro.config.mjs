import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { themeOverridePlugin } from './vite-plugins/theme-override.mjs';
import { themeStylesOverridePlugin } from './vite-plugins/theme-styles-override.mjs';

const { TURNSTILE_SITE_KEY } = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');

function contactRouteIntegration() {
  return {
    name: 'contact-route',
    hooks: {
      'astro:config:setup': ({ injectRoute, logger }) => {
        if (TURNSTILE_SITE_KEY) {
          injectRoute({
            pattern: '/contact',
            entrypoint: './src/pages/_contact.astro',
            prerender: true,
          });
        } else {
          logger.warn('Contact form disabled: TURNSTILE_SITE_KEY is unset.');
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://sentience.aeon14.com',
  output: 'static',
  adapter: cloudflare({
    imageService: 'passthrough',
    prerenderEnvironment: 'node',
  }),
  integrations: [sitemap(), contactRouteIntegration()],
  vite: {
    plugins: [themeOverridePlugin(), themeStylesOverridePlugin()],
  },
});
