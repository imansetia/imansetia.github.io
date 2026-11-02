// @ts-check
import { defineConfig } from 'astro/config';

// Situs statis untuk GitHub Pages dengan domain sendiri, jadi tidak perlu `base`.
// Bahasa Indonesia di root, bahasa Inggris di /en/.
export default defineConfig({
  site: 'https://imansetia.page',
  output: 'static',
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
