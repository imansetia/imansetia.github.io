// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Situs statis untuk GitHub Pages dengan domain sendiri, jadi tidak perlu `base`.
// Bahasa Inggris di root, bahasa Indonesia di /id/ (DESIGN.md bagian 5).
// Tidak ada pengalihan otomatis berdasarkan bahasa browser.
export default defineConfig({
  site: 'https://imansetia.page',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'id'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // Alamat lama tetap hidup: versi Indonesia dulu di root, versi Inggris dulu di /en/.
  redirects: {
    '/tontonan': '/id/tontonan/',
    '/bacaan': '/id/bacaan/',
    '/catatan': '/id/catatan/',
    '/catatan/[slug]': '/id/catatan/[slug]',
    '/tentang': '/id/tentang/',
    '/en': '/',
    '/en/films': '/films/',
    '/en/books': '/books/',
    '/en/notes': '/notes/',
    '/en/notes/[slug]': '/notes/[slug]',
    '/en/about': '/about/',
  },
  // sitemap-index.xml, dengan tautan antarbahasa (hreflang) untuk tiap halaman.
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-US', id: 'id-ID' },
      },
    }),
  ],
});
