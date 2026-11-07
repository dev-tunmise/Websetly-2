// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = 'https://websetly.com';

/**
 * URL-PRESERVATION NOTE (do not change without a redirect plan)
 * -------------------------------------------------------------
 * The legacy site was hand-written .html files on Cloudflare Pages, which
 * serves `about.html` at `/about` and 308-redirects `/about.html` -> `/about`.
 * `build.format: 'file'` reproduces that byte-for-byte: Astro emits
 * `about.html`, not `about/index.html`. Switching to 'directory' would move
 * every indexed URL to a trailing-slash variant and force a site-wide redirect
 * chain. Every currently-ranking URL stays exactly where it is.
 */
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  /**
   * The dev toolbar overlays the bottom of every page in `astro dev` and is a
   * nuisance when reviewing layout. Nothing it offers is load-bearing here, and
   * it never ships to production either way.
   */
  devToolbar: {
    enabled: false,
  },
  integrations: [
    mdx(),
    sitemap({
      lastmod: new Date(),
      filter: (page) =>
        // Utility pages carry no search value and dilute the index.
        !page.includes('/thank-you') && !page.includes('/404'),
      /**
       * Only `priority` is set. Google has stated publicly that it ignores both
       * `changefreq` and `priority`, but priority still guides other crawlers
       * and costs nothing; changefreq is omitted rather than carried as noise.
       */
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (path === '/' || path === '') {
          item.priority = 1.0;
        } else if (path === '/analyze') {
          item.priority = 0.95;
        } else if (path.startsWith('/services')) {
          item.priority = 0.9;
        } else if (path.startsWith('/portfolio')) {
          item.priority = 0.8;
        } else if (path.startsWith('/blog')) {
          item.priority = 0.7;
        } else if (path === '/privacy' || path === '/terms') {
          item.priority = 0.2;
        } else {
          item.priority = 0.6;
        }
        return item;
      },
    }),
  ],
  vite: {
    /**
     * Cast is type-only. @tailwindcss/vite resolves its own copy of Vite while
     * Astro nests another, so the two `Plugin` types are structurally identical
     * but nominally distinct. Runtime behaviour is unaffected; without the cast
     * `astro check` reports a spurious error.
     */
    plugins: [/** @type {any} */ (tailwindcss())],
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
