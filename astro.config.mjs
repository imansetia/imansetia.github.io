// @ts-check
import { defineConfig } from 'astro/config';

// Situs statis untuk GitHub Pages dengan domain sendiri, jadi tidak perlu `base`.
export default defineConfig({
  site: 'https://imansetia.page',
  output: 'static',
});
