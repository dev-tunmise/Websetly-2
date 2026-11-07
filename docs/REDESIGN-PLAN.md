# Websetly — Repositioning & Redesign Plan

**From:** web design agency
**To:** Website Performance & Growth Agency
**Constraint:** same brand, same domain, no lost search rankings.

This document is the reference for what changed and why. The implementation in
this repository already reflects every decision below.

---

## 1. What the audit found

Before anything was designed, the live site was crawled and every page pulled
down. These are findings against the real site, not assumptions.

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | `og:image` pointed at `/images/og-image.jpg` on every page — **the file did not exist in the repo**. Every social share rendered with no preview image. | High | Fixed — real 1200×630 card generated |
| 2 | The blog hub and all **15 posts were missing from `sitemap.xml`**. The sitemap listed 7 URLs; the site has 24. | High | Fixed — sitemap generated from routes |
| 3 | Unknown paths returned **HTTP 200 with the homepage body** (`/pricing` and `/case-studies` both did). Soft 404s let search engines index unlimited duplicate URLs. | High | Fixed — real `404.html` |
| 4 | Every response served `Cache-Control: max-age=0, must-revalidate` with `cf-cache-status: DYNAMIC` — **nothing cached at the edge**, on an entirely static site. | High | Fixed — `public/_headers` |
| 5 | Section kickers ("WHAT WE DO", "FAQ") were marked up as `<h2>`, so the real section titles sat at `<h3>` under a heading that was decoration. Broken outline on every page. | Medium | Fixed — kickers are `<p class="eyebrow">` |
| 6 | Sitemap listed `.html` URLs that the host 308-redirects to extensionless. Every sitemap entry was a redirect. | Medium | Fixed |
| 7 | Render-blocking third-party CSS on every page: Google Fonts + AOS from unpkg. | Medium | Fixed — self-hosted font, AOS removed |
| 8 | `gtag` injected during head parsing on every page. | Medium | Fixed — deferred to idle |
| 9 | Blog post source files contained **double-encoded UTF-8** (`â€”`, `ðŸ'¡`) visible to readers. | Medium | Fixed in migration |
| 10 | `blog-website-redesign-signs.html` existed in the repo but was linked from nowhere and absent from the sitemap — an orphan. | Low | Now in the blog index and sitemap |
| 11 | WhatsApp float linked `wa.me/2348012345678`; contact and privacy pages published `07044121358`. **Numbers disagree.** | Low | ⚠️ Needs your confirmation |
| 12 | `robots.txt` set `Crawl-delay: 1`, slowing Googlebot for no benefit. | Low | Removed |

---

## 2. URL strategy — the thing that protects your rankings

**Every URL that exists today still exists, at the same path, with no redirect.**
Verified after each build by `scripts/audit-build.mjs`.

### Preserved exactly (24 URLs)

```
/                                              /blog-hidden-costs-no-website
/about                                         /blog-how-to-choose-web-design-agency
/services                                      /blog-ng-domain-benefits-nigeria-whogohost
/portfolio                                     /blog-register-domain-guide-whogohost
/contact                                       /blog-secure-domain-whogohost
/privacy                                       /blog-seo-basics-designers
/terms                                         /blog-startup-web-design-budget
/blog                                          /blog-website-performance-checklist
/thank-you                                     /blog-website-redesign-signs
/blog-best-domain-registrar-nigeria-whogohost  /blog-why-every-business-needs-website
/blog-case-study-double-leads                  /blog-diy-vs-professional-web-design
/blog-domain-name-cost-nigeria-whogohost       /blog-essential-website-features
```

Three decisions made this possible:

1. **`build.format: 'file'`** in `astro.config.mjs`. Astro emits `about.html`,
   not `about/index.html`. Cloudflare Pages serves that at `/about` and
   308-redirects `/about.html` — byte-identical to today's behaviour. The
   default (`'directory'`) would have moved every URL to a trailing-slash
   variant and forced a site-wide redirect.

2. **Legacy blog posts keep their flat root slugs.** Posts carry a `legacySlug`
   in frontmatter and render from `src/pages/[legacySlug].astro` at
   `/blog-seo-basics-designers`. Posts published from now on omit it and render
   at `/blog/<slug>`. `src/lib/blog.ts#postUrl()` is the only place that
   decision lives, so links, canonicals, RSS and the sitemap can never disagree.

3. **`/portfolio` was not renamed.** Navigation says "Case Studies" but the path
   stays. Renaming would have traded a ranking page for a marginally nicer slug.
   `/case-studies` 301s here for anyone who types it.

### New URLs (16)

`/analyze`, `/pricing`, `/404`, nine `/services/<slug>`, four `/portfolio/<slug>`.

### Deliberately *not* done

Consolidating the flat `blog-*` slugs under `/blog/`. It is the tidier
architecture and 301s pass ~full equity — but "preserve existing URLs" was the
explicit constraint, and the upside is cosmetic. If you ever want it, do it as
its own change with its own before/after measurement, not bundled into a
relaunch.

---

## 3. Information architecture

```
/                          Homepage — one job: get a URL into the analyzer
├── /analyze               ★ The product. Free report. Primary lead source.
├── /services              Hub
│   ├── /website-performance-optimization
│   ├── /core-web-vitals
│   ├── /website-speed-optimization
│   ├── /technical-seo
│   ├── /conversion-optimization
│   ├── /accessibility-audits
│   ├── /website-monitoring
│   ├── /website-maintenance
│   └── /website-development          ← secondary, deliberately last
├── /portfolio             Case studies hub (URL preserved)
│   └── /portfolio/<slug>
├── /pricing
├── /blog                  Hub
│   ├── /blog-<slug>       15 legacy posts, URLs preserved
│   └── /blog/<slug>       all future posts
├── /about
├── /contact
├── /privacy  /terms  /thank-you  /404
└── /rss.xml  /sitemap-index.xml
```

**Navigation:** Services · Case Studies · Pricing · Blog · About, plus
`Talk to us` (ghost) and `Analyze your site` (primary). Five items, one action.
Anything longer dilutes the single conversion goal.

**Internal linking:** the footer links all nine service pages from every page,
so new service URLs accumulate internal PageRank immediately. Every blog post
links to three related posts (scored by category then shared tags) and to
`/analyze`. Every service page links three sibling services. No page is a crawl
dead end.

---

## 4. Homepage wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ [Websetly]   Services  Case Studies  Pricing  Blog  About    │
│                                  Talk to us [Analyze site]   │  sticky
├──────────────────────────────────────────────────────────────┤
│  WEBSITE PERFORMANCE & GROWTH                    ← eyebrow   │
│                                                              │
│  Faster websites. Better rankings.                           │
│  More revenue.                          ← h1, green accent   │
│                                                              │
│  We find what is slowing your website down — then fix it     │
│  and prove the difference with real user data.               │
│                                                              │
│  ┌────────────────────────────────┬──────────────────┐       │
│  │ 🔍  yourstore.com              │ Analyze your site│   ★   │
│  └────────────────────────────────┴──────────────────┘       │
│  Free, no signup. ~30 seconds.                               │
├──────────────────────────────────────────────────────────────┤
│  150+            2023            7–14           4            │  trust
│  Projects        Since           Days to win    Industries   │  strip
├──────────────────────────────────────────────────────────────┤
│  WHAT WE FIX                                                 │
│  The problems costing you customers                          │
│  ┌────────┐ ┌────────┐ ┌────────┐                            │
│  │ Slow   │ │ CWV    │ │ Not    │   6 cards, 3×2             │
│  │ pages  │ │ failing│ │ indexed│                            │
│  └────────┘ └────────┘ └────────┘                            │
├──────────────────────────────────────────────────────────────┤
│  SERVICES · What we do          8 cards, 4×2                 │
│  [View all services]   Still build new sites? Yes — secondary│
├──────────────────────────────────────────────────────────────┤
│  HOW IT WORKS · Measure → Diagnose → Fix → Monitor           │
├──────────────────────────────────────────────────────────────┤
│  WHAT YOU RECEIVE          │  ┌─────────────────────────┐    │
│  An example of the report  │  │ example-store.com  Sample│   │
│  ✓ Real-user Core Web Vitals│ │  41   78   92   90      │    │
│  ✓ Lighthouse, 4 categories│  │  LCP 4.8s  ● Poor       │    │
│  ✓ Every fix in seconds    │  │  INP 310ms ● Needs work │    │
│  [Run it on your site]     │  │  CLS 0.02  ● Good       │    │
│                            │  └─────────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│  PROOF · Results we have delivered      3 case study cards   │
├──────────────────────────────────────────────────────────────┤
│  IN THEIR WORDS · Testimonials    ← auto-hidden while empty  │
├──────────────────────────────────────────────────────────────┤
│  WRITING · 3 latest posts                                    │
├──────────────────────────────────────────────────────────────┤
│  ╔══════════════════════════════════════════════════════╗    │
│  ║  See what is slowing your site down                  ║    │
│  ║        [ your URL ]  [Analyze your site]             ║ ★  │
│  ╚══════════════════════════════════════════════════════╝    │
├──────────────────────────────────────────────────────────────┤
│  Common questions   (visible + FAQPage schema)               │
├──────────────────────────────────────────────────────────────┤
│  Footer — all 9 services, company, resources                 │
└──────────────────────────────────────────────────────────────┘
```

The analyzer appears twice and nowhere in between. Every other section either
builds the case for it or answers an objection to it.

---

## 5. Colour system

White is the canvas. **Green is the single primary accent** (actions, success,
performance). **Blue is a quieter secondary** for information and surfaces —
it never competes with green for attention.

The discipline that makes "light blue and light green" work at AA: the light end
of each ramp is **surface-only and must never hold text**. Anything carrying
text or acting as a solid button comes from the dark end. Every such token was
contrast-checked against white.

| Token | Hex | Contrast on white | Use |
|---|---|---|---|
| `brand-50` | `#f1f9f5` | — | Surfaces, icon wells |
| `brand-300` | `#93cfae` | — | Borders, list markers |
| `brand-600` | `#2e7d59` | **5.01:1** ✅ | Primary buttons, links |
| `brand-700` | `#246347` | **7.03:1** ✅ | Hover, emphasis text |
| `sky-50` | `#f2f7fb` | — | Informational surfaces |
| `sky-600` | `#356c96` | **5.62:1** ✅ | Secondary accent text |
| `ink-500` | `#5f7383` | **4.94:1** ✅ | Meta, captions |
| `ink-600` | `#47596a` | **7.15:1** ✅ | Body copy |
| `ink-900` | `#161e25` | **16.1:1** ✅ | Headings |
| `warn` | `#9a6b1f` | **4.63:1** ✅ | "Needs work" ratings |
| `bad` | `#b3402f` | **4.83:1** ✅ | "Poor" ratings |

**Retired:** `#FF6B35` (orange) and `#0A192F` (navy). The build audit fails if
either reappears anywhere in the output.

Metric ratings never rely on colour alone — every score badge pairs its colour
with a text label ("Good", "Needs work", "Poor"), which is required for AA and
for the ~8% of men with colour vision deficiency who are looking at a
performance report full of red and green.

---

## 6. Typography

**Inter**, self-hosted as a 47 KB variable woff2, Latin subset, preloaded from
the same origin. This removes the two `preconnect`s and the render-blocking
stylesheet the old site loaded from `fonts.googleapis.com` on every page.

Fluid scale — each step clamps between a mobile and a desktop size, so headings
stay confident on large screens without a JS resize listener:

| Step | Range | Use |
|---|---|---|
| `text-5xl` | 2.5 → 4rem | Homepage h1 |
| `text-4xl` | 2 → 3rem | Page h1 |
| `text-3xl` | 1.625 → 2.25rem | Section h2 |
| `text-2xl` | 1.375 → 1.75rem | Card group h2 |
| `text-lg` | 1.0625rem | Body, article copy |
| `text-base` | 1rem | UI |
| `text-sm` | 0.875rem | Meta |

Headings: 600 weight, `-0.021em` tracking (`-0.032em` at h1), `text-wrap: balance`
so they never leave one orphaned word. Body: `text-wrap: pretty`, 1.65–1.75
line-height. Measure capped at `44rem` for articles.

---

## 7. Component library

`src/components/`

| Component | Responsibility |
|---|---|
| `SEO.astro` | Every meta tag. Canonical derived from pathname — a page cannot ship without one. |
| `Schema.astro` | One JSON-LD `@graph` per page; entities cross-referenced by `@id`. |
| `Header.astro` | Sticky nav. Mobile menu is a native `<details>` — **zero JS**, keyboard and screen-reader operable for free. |
| `Footer.astro` | Internal-linking backbone; renders all services from `consts.ts`. |
| `Section.astro` | Vertical rhythm + the eyebrow-is-not-a-heading rule. |
| `AnalyzerForm.astro` | Primary CTA. Plain GET form → works with JS disabled. |
| `ServiceCard.astro` | Compact and full variants. |
| `PostCard.astro` | Configurable heading level so listings never skip a level. |
| `CTASection.astro` | Closing conversion block, form or button variant. |
| `Breadcrumbs.astro` | Visible trail; same array feeds `BreadcrumbList` schema. |
| `Icon.astro` | 18 inline SVGs on one 24×24 / 2px grid. No icon font. |
| `Logo.astro` | Wordmark + speed mark, light and inverted. |

CSS primitives in `global.css`: `.btn` (primary/secondary/ghost/lg), `.card`
(+interactive, +muted), `.field`, `.label`, `.pill`, `.eyebrow`, `.section`,
`.container-page`, `.container-prose`, `.skip-link`, `.reveal`.

**Radius:** one family, 0.375 → 1.5rem. **Shadow:** four steps, low-contrast,
used only on interactive hover and the two "floating report" cards.
**Motion:** a single 12px fade-up on scroll, CSS-only via `animation-timeline: view()`,
with a `@supports` fallback to the finished state so nothing is ever invisible.
This replaced the 14 KB AOS library.

---

## 8. Technical architecture

**Astro 5 + Tailwind 4 + TypeScript, static output, Cloudflare Pages.**

```
src/
├── consts.ts             Site config + service catalogue (single source of truth)
├── content.config.ts     Zod schemas for blog + case studies
├── content/              15 migrated posts, 4 case studies (Markdown)
├── data/                 homepage.ts, pricing.ts, testimonials.ts
├── lib/blog.ts           postUrl() — the URL decision lives here alone
├── scripts/analyzer.ts   PageSpeed Insights client (loaded on /analyze only)
├── components/  layouts/  pages/  styles/  assets/
public/
├── _headers _redirects robots.txt   Cloudflare Pages config
├── fonts/  images/og-default.jpg  favicon.svg  apple-touch-icon.png
scripts/
├── migrate-blog.mjs      One-shot HTML → Markdown migration (kept for provenance)
├── generate-og-image.mjs Brand card + touch icon
└── audit-build.mjs       Post-build gate: run it before every deploy
```

### Measured output

| | Legacy | New |
|---|---|---|
| Third-party requests in initial HTML | 4 (Google Fonts ×2, unpkg AOS ×2) | **0** |
| Render-blocking CSS | Google Fonts + AOS + 50 KB Tailwind | **1 file, 35 KB total** |
| JS shipped | AOS 14 KB + inline gtag | **12.5 KB total, 2 files** |
| Homepage images | 62 KB JPEG hero | WebP, responsive `srcset` |
| Case study images | 106–132 KB JPEG | **13–50 KB WebP** |
| Edge caching | none (`max-age=0`, DYNAMIC) | 1-year immutable on hashed assets |

Zero JavaScript ships on the homepage for the analyzer form — it is a GET form.
The only JS on most pages is Astro's ~1 KB prefetch. The analyzer client loads
on `/analyze` alone.

### The analyzer

`/analyze` calls the **Google PageSpeed Insights API** directly from the
browser — the same service behind PageSpeed Insights and the Core Web Vitals
report in Search Console. It returns real lab (Lighthouse) *and* field (CrUX)
data. This is a working measurement, not a mock.

> ⚠️ **Before this becomes your main lead source:** keyless PSI requests are
> rate-limited by Google. Get a key from the Google Cloud console and set
> `PUBLIC_PSI_API_KEY` in the Cloudflare Pages environment. The code already
> reads it. Without a key you will start seeing quota errors under load.

---

## 9. SEO implementation

- **Canonicals** — absolute, self-referencing, derived from pathname; no
  trailing slashes. Enforced by the build audit.
- **Structured data** — `ProfessionalService` (with a full `hasOfferCatalog` of
  all nine services), `WebSite`, `BreadcrumbList` on every interior page,
  `BlogPosting` per post, `Service` per service page, `Article` per case study,
  `FAQPage` on `/` and `/pricing`, `WebApplication` on `/analyze`. Every entity
  cross-references `@id`.
- **FAQ schema is always mirrored visibly on-page** — Google devalues structured
  data with no on-page equivalent.
- **Sitemap** — generated from actual routes, so it can never drift again.
  Priority tiers: `/` 1.0, `/analyze` 0.95, services 0.9, portfolio 0.8, blog
  0.7, legal 0.2. `changefreq` deliberately omitted (Google ignores it).
- **Open Graph / Twitter** — complete on every page, with a real 1200×630 image.
- **Headings** — exactly one `h1` per page, no skipped levels, verified in the
  build audit across all 40 pages.
- **`robots.txt`** — blocks analyzer/contact query-string variants from crawl
  budget; `Crawl-delay` removed. Note Cloudflare prepends its own managed AI
  block at the edge; do not duplicate those rules.

---

## 10. Copy changes

| Before | After |
|---|---|
| "We Build Websites That Get More Leads, Clients & Sales" | "Faster websites. Better rankings. More revenue." |
| "Need a website that sells? We build fast, modern, SEO-optimized websites." | "We find what is slowing your website down — then fix it and prove the difference with real user data." |
| Primary CTA: "Get Started" (→ contact form) | Primary CTA: "Analyze your site" (→ instant free report) |
| Services led by "Website Design & Development" | Services led by Performance Optimization; development is last and labelled secondary |
| "Why Choose Us?" → Fast Delivery, Mobile-First… | "The problems costing you customers" — six named, measurable failures |

Voice rules applied throughout: lead with the customer's problem, not our
capability; quantify wherever a number exists; never use jargon without
immediately defining it (every Core Web Vital gets a plain-English gloss); prefer
the concrete verb.

---

## 11. UX recommendations

**Implemented**

1. One primary action site-wide. The analyzer is the only green button in the
   header; everything else is secondary or ghost.
2. The analyzer works without JavaScript (GET form) and without a signup.
   Asking for an email before showing value is the most common way this pattern
   fails.
3. Report → lead handoff carries context: `/contact?ref=analyzer&site=…`
   pre-fills the form and tags the submission, so you know which leads arrived
   holding a report.
4. 44px minimum touch targets on every button and field.
5. Visible focus ring everywhere, one consistent style.
6. Skip-to-content link on every page.
7. `prefers-reduced-motion` honoured — all animation collapses to 0.01ms.
8. No carousels anywhere. The case studies and testimonials are grids.
9. FAQ uses native `<details>` — accessible, zero JS, and indexable.
10. Empty states are honest: the testimonials section hides itself rather than
    showing placeholders.

**Recommended next**

- Add a desktop/mobile toggle to the analyzer results (the API already accepts
  `strategy`; the client reads `?strategy=desktop` but there is no UI for it).
- Instrument the funnel: `analyzer_report_generated` already fires to GA4. Add a
  goal on `/thank-you` and measure analyzer → contact conversion.
- A/B the hero headline once there is enough traffic to resolve it.

---

## 12. Roadmap

**Phase 1 — before launch (yours, not code)**
- [ ] Set `PSI_API_KEY` in Cloudflare Pages (server-side; see functions/api/pagespeed.js)
- [ ] Confirm the correct WhatsApp number (finding #11)
- [ ] Replace `@websetly` / LinkedIn URL in `consts.ts` if those handles differ
- [ ] Consider a business email instead of the Gmail address on the contact page

**Phase 2 — first month**
- [ ] Collect and publish 3 real testimonials (`src/data/testimonials.ts` — the
      section appears automatically)
- [ ] Backfill before/after metrics on the three case studies that currently
      have none
- [ ] Set your rates in `src/data/pricing.ts`, or leave "priced after your audit"
- [ ] Submit the new sitemap in Search Console and watch Core Web Vitals for
      four to six weeks (field data is a rolling 28-day window)

**Phase 3 — the product**
- [x] Move the analyzer behind a Cloudflare Pages Function so the API key is
      server-side and results can be cached and stored
- [ ] Persist reports → shareable `/reports/<id>` URLs (strong link-building asset)
- [ ] Email capture for scheduled re-scans → the monitoring service's funnel
- [ ] Client dashboard (auth + D1/KV) — the point at which the Astro static
      build should gain a server adapter rather than being replaced
- [ ] AI-powered recommendations layered on the stored report data
- [ ] Resource centre and documentation sections (content collections are
      already set up for this pattern)

---

## 13. Running it

```bash
npm install
npm run dev              # http://localhost:4321
npm run build            # static output to dist/
npm run check            # TypeScript + Astro diagnostics

node scripts/audit-build.mjs   # run after every build, before deploy
```

`audit-build.mjs` exits non-zero on: a missing or duplicate `h1`, a missing or
malformed canonical, a missing meta description / `og:image` / `twitter:card`,
invalid JSON-LD, an `<img>` without `alt`, a link with no accessible name, a
broken internal link, any surviving reference to the retired orange brand, or
any legacy third-party asset. Wire it into CI.

**Deployment:** Cloudflare Pages — build command `npm run build`, output
directory `dist`. `public/_headers` and `public/_redirects` are picked up
automatically.
