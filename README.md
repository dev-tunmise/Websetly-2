# Websetly

**Website Performance & Growth Agency** — websetly.com

Astro 5 · Tailwind 4 · TypeScript · static output on Cloudflare Pages.

> Repositioned from a web design agency in 2026. All 24 previously-indexed URLs
> are preserved at their exact paths. See [`docs/REDESIGN-PLAN.md`](docs/REDESIGN-PLAN.md)
> for the full rationale — **read the URL strategy section before renaming any
> route.**

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Static build → `dist/` |
| `npm run preview` | Serve the built output |
| `npm run check` | TypeScript + Astro diagnostics |
| `node scripts/audit-build.mjs` | **Post-build gate — run before every deploy** |
| `node scripts/generate-og-image.mjs` | Regenerate the OG card + touch icon |
| `node scripts/migrate-blog.mjs` | One-shot legacy HTML → Markdown (already run) |

## Project layout

```
src/
├── consts.ts           Site config + the service catalogue. Single source of
│                       truth — nav, footer, schema and sitemap all read it.
├── content.config.ts   Zod schemas for the blog and case-study collections
├── content/
│   ├── blog/           15 posts migrated from the legacy site
│   └── case-studies/   4 case studies
├── data/               homepage.ts · pricing.ts · testimonials.ts
├── lib/blog.ts         postUrl() — where the blog URL decision lives
├── scripts/analyzer.ts PageSpeed Insights client (only loaded on /analyze)
├── components/ layouts/ pages/ styles/ assets/
public/                 _headers · _redirects · robots.txt · fonts · og image
docs/REDESIGN-PLAN.md   Audit findings, IA, design system, roadmap
```

## Things that will bite you

**Do not change `build.format` in `astro.config.mjs`.** `'file'` emits
`about.html`, which Cloudflare Pages serves at `/about` — matching every
currently-indexed URL. Switching to `'directory'` moves the entire site to
trailing-slash URLs and forces a site-wide redirect.

**Do not rename the flat `blog-*` slugs.** Those 15 URLs are indexed and carry
link equity. Posts with a `legacySlug` in frontmatter render at `/<legacySlug>`;
new posts omit it and render at `/blog/<slug>`.

**Do not rename `/portfolio`.** The nav label says "Case Studies"; the path is
preserved because it ranks.

**Colour tokens are contrast-locked.** The 50–300 tints are surface-only and
must never hold text. Text and solid buttons use 600/700, which are checked
against white in the plan document. The build audit fails if the retired orange
(`#FF6B35`) reappears.

## Writing a blog post

Create `src/content/blog/my-post.md`:

```yaml
---
title: 'Under 120 characters'
description: 'Between 70 and 165 characters — the schema enforces this.'
pubDate: 2026-08-06
category: 'Performance'   # or Core Web Vitals | Technical SEO | Accessibility |
                          #    Conversion | Case Study | Guides
tags: ['core web vitals', 'lcp']
readingTime: 6
draft: false
---
```

It publishes at `/blog/my-post`, and appears in the hub, the sitemap and the RSS
feed automatically. **Omit `legacySlug`** — that field exists only for the
migrated posts.

## Before launch

- [ ] Set `PSI_API_KEY` in the Cloudflare Pages environment (Settings →
      Environment variables). It is read by `functions/api/pagespeed.js` at the
      edge and is never sent to the browser. Without it the proxy falls back to
      Google's keyless quota and will fail under load.
- [ ] Restrict the key in the Google Cloud console: HTTP referrers limited to
      `websetly.com/*`, and API access limited to PageSpeed Insights.
- [ ] Confirm the WhatsApp number in `consts.ts` — the legacy site published two
      different ones.
- [ ] Check the `@websetly` Twitter handle and LinkedIn URL in `consts.ts`.

## Deployment

Cloudflare Pages · build command `npm run build` · output directory `dist`.
`public/_headers` and `public/_redirects` are applied automatically.
