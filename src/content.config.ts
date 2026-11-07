import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * URL STRATEGY FOR THE BLOG — read before renaming anything.
 *
 * The legacy site published posts as flat root URLs, e.g.
 *   https://websetly.com/blog-seo-basics-designers
 * Those 15 URLs are indexed and carry link equity, so they keep their exact
 * paths: a post with `legacySlug` set renders at `/{legacySlug}` and
 * self-canonicalises there. Nothing redirects, nothing decays.
 *
 * Posts published from now on omit `legacySlug` and render at `/blog/{id}`,
 * which is the architecture the section should have had from the start.
 * The two live side by side in the hub and the sitemap.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      // Google truncates around 60–70 chars, but several migrated posts have
      // longer titles that are already indexed and ranking. Rewriting them to
      // fit would change the thing search engines match on, so the cap is set
      // where it catches genuine mistakes without forcing a rewrite of history.
      title: z.string().max(120),
      description: z
        .string()
        .min(70)
        .max(165, 'Meta descriptions over ~165 chars get truncated'),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** Preserved flat root URL for pre-2026 posts. Omit for new posts. */
      legacySlug: z.string().optional(),
      category: z.enum([
        'Performance',
        'Core Web Vitals',
        'Technical SEO',
        'Accessibility',
        'Conversion',
        'Case Study',
        'Guides',
      ]),
      tags: z.array(z.string()).default([]),
      author: z.string().default('Websetly'),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      /** Minutes; computed at migration time, overridable. */
      readingTime: z.number().optional(),
      draft: z.boolean().default(false),
      /** Set when a post has been superseded — emits a canonical elsewhere. */
      canonicalOverride: z.string().url().optional(),
    }),
});

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().min(70).max(165),
      client: z.string(),
      industry: z.string(),
      pubDate: z.coerce.date(),
      /** Headline outcomes rendered as the metric row. Keep to three. */
      metrics: z
        .array(
          z.object({
            label: z.string(),
            before: z.string(),
            after: z.string(),
            /** Which direction is good — drives the colour of the delta. */
            improvement: z.enum(['up', 'down']),
          }),
        )
        .max(3),
      services: z.array(z.string()),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, caseStudies };
