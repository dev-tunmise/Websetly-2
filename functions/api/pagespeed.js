/**
 * PageSpeed Insights proxy — Cloudflare Pages Function.
 *
 * The analyzer used to call Google directly from the browser, which meant the
 * API key was compiled into public JavaScript for anyone to lift. This runs at
 * the edge instead: the key lives in the Pages environment as PSI_API_KEY and
 * is never served to a client.
 *
 * Deployed automatically by Cloudflare Pages from the /functions directory —
 * it is not part of the Astro build, and `astro dev` does not run it. The
 * client falls back to a keyless direct call in dev only; see analyzer.ts.
 */

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATEGORIES = ['performance', 'seo', 'accessibility', 'best-practices'];

/**
 * A hostname with at least one dot and an alphabetic TLD, mirroring
 * src/lib/url.ts. Without this the endpoint is an open proxy: anything could be
 * passed through it, spending our quota on someone else's scans.
 */
const HOSTNAME =
  /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function bad(message, status = 400) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet({ request, env }) {
  const params = new URL(request.url).searchParams;
  const target = params.get('url');
  const strategy = params.get('strategy') === 'desktop' ? 'desktop' : 'mobile';

  if (!target) return bad('No address was supplied.');

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return bad('That does not look like a website address.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return bad('Only http and https addresses can be analyzed.');
  }
  if (!HOSTNAME.test(parsed.hostname)) {
    return bad('That does not look like a website address.');
  }

  const psi = new URL(PSI_ENDPOINT);
  psi.searchParams.set('url', parsed.href);
  psi.searchParams.set('strategy', strategy);
  for (const category of CATEGORIES) psi.searchParams.append('category', category);
  if (env.PSI_API_KEY) psi.searchParams.set('key', env.PSI_API_KEY);

  /* Ten minutes of edge cache. Repeat scans of the same URL are common — people
     re-run after a fix — and each one is a full quota unit. */
  const upstream = await fetch(psi.href, { cf: { cacheTtl: 600, cacheEverything: true } });
  const body = await upstream.text();

  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
