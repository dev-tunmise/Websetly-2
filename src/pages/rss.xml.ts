import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { getPublishedPosts, postUrl } from '../lib/blog';

/**
 * RSS feed. Hand-rolled rather than pulling in @astrojs/rss for one file.
 * Item links go through postUrl(), so legacy posts syndicate at their preserved
 * flat URLs and new posts at /blog/… — the feed can never disagree with the
 * canonical tag.
 */
const escape = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!,
  );

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const items = posts
    .map((p) => {
      const link = new URL(postUrl(p), SITE.url).href;
      return `    <item>
      <title>${escape(p.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escape(p.data.description)}</description>
      <pubDate>${p.data.pubDate.toUTCString()}</pubDate>
      <category>${escape(p.data.category)}</category>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${SITE.name} Blog`)}</title>
    <link>${SITE.url}/blog</link>
    <description>${escape(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
