import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * Resolves a post's URL. Legacy posts keep the exact flat path they are indexed
 * at; posts written from now on live under /blog/. This function is the only
 * place that decision is encoded — every link, the sitemap, the RSS feed and
 * the canonical tag all call it, so a post can never be linked at one URL and
 * canonicalised at another.
 */
export function postUrl(post: Post): string {
  return post.data.legacySlug ? `/${post.data.legacySlug}` : `/blog/${post.id}`;
}

/** Posts per page on the blog index. */
export const POSTS_PER_PAGE = 6;

/**
 * Page 1 stays at /blog rather than /blog/page/1, because /blog is the URL that
 * is linked, indexed and in the sitemap. Later pages sit a level deeper so they
 * can never collide with /blog/:slug.
 */
export function blogPageUrl(page: number): string {
  return page <= 1 ? '/blog' : `/blog/page/${page}`;
}

/** Drafts never ship to production; they stay visible in `astro dev`. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true,
  );
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Related posts, preferring the same category and then shared tags. This is the
 * internal-linking engine for the blog — every post links onward to three
 * others, so no post is a crawl dead end.
 */
export function getRelated(post: Post, all: Post[], limit = 3): Post[] {
  const tags = new Set(post.data.tags.map((t) => t.toLowerCase()));

  return all
    .filter((p) => p.id !== post.id)
    .map((p) => {
      let score = 0;
      if (p.data.category === post.data.category) score += 3;
      for (const t of p.data.tags) if (tags.has(t.toLowerCase())) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
    .slice(0, limit)
    .map((x) => x.p);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
