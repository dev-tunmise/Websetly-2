/**
 * PageSpeed Insights proxy — Vercel Serverless Function.
 * The API key lives in the PSI_API_KEY environment variable on Vercel and is
 * never sent to the browser.
 */

export const config = { maxDuration: 60 };

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATEGORIES = ['performance', 'seo', 'accessibility', 'best-practices'];

// Stops this endpoint being used as an open proxy.
const HOSTNAME =
  /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

function bad(res, message, status = 400) {
  return res.status(status).json({ error: { message } });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return bad(res, 'Method not allowed.', 405);

  const target = req.query.url;
  const strategy = req.query.strategy === 'desktop' ? 'desktop' : 'mobile';

  if (!target || typeof target !== 'string') return bad(res, 'No address was supplied.');

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return bad(res, 'That does not look like a website address.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return bad(res, 'Only http and https addresses can be analyzed.');
  }
  if (!HOSTNAME.test(parsed.hostname)) {
    return bad(res, 'That does not look like a website address.');
  }

  const psi = new URL(PSI_ENDPOINT);
  psi.searchParams.set('url', parsed.href);
  psi.searchParams.set('strategy', strategy);
  for (const c of CATEGORIES) psi.searchParams.append('category', c);
  if (process.env.PSI_API_KEY) psi.searchParams.set('key', process.env.PSI_API_KEY);

  try {
    const upstream = await fetch(psi.href);
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    // Cache successful scans on Vercel's CDN for 10 minutes to save quota.
    res.setHeader(
      'Cache-Control',
      upstream.ok ? 'public, s-maxage=600, stale-while-revalidate=60' : 'no-store',
    );
    return res.status(upstream.status).send(body);
  } catch {
    return bad(res, 'Could not reach Google PageSpeed. Please try again.', 502);
  }
}