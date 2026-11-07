/**
 * Address normalisation for the analyzer.
 *
 * Shared by the form (which normalises before submitting) and the analyzer
 * script (which normalises again on arrival, because a ?url= can be typed,
 * bookmarked or shared without ever passing through the form).
 *
 * The rule: a visitor types what they say out loud — `yourstore.com` — and we
 * turn that into something the PageSpeed API will accept. Nobody should have
 * to type a scheme to use the product.
 */

/** Any `scheme://` prefix, so we can accept http(s) and reject the rest. */
const SCHEME = /^([a-z][a-z0-9+.-]*):\/\//i;

/**
 * A hostname with at least one dot and an alphabetic TLD. Internationalised
 * domains arrive here already punycoded by the URL parser, so `café.fr` is
 * tested as `xn--caf-dma.fr` and passes. Bare IPs fail by design — PageSpeed
 * needs a publicly resolvable host.
 */
const HOSTNAME =
  /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/**
 * Returns a fully-qualified https(s) URL, or null when the input could not be
 * read as a website address.
 *
 * Accepts: `example.com`, `www.example.com`, `http://example.com`,
 * `https://example.com/path?q=1`, and any of those with stray whitespace.
 */
export function normalizeUrl(input: string): string | null {
  let raw = input.trim();
  if (!raw) return null;

  const scheme = raw.match(SCHEME);
  if (scheme) {
    const protocol = scheme[1].toLowerCase();
    if (protocol !== 'http' && protocol !== 'https') return null;
  } else {
    // No scheme we recognise, but a `://` in the middle means something is
    // malformed — prefixing https:// would only bury the real problem.
    if (raw.includes('://')) return null;
    raw = `https://${raw}`;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  // Credentials in the URL are almost always a paste accident, and passing
  // them to a third-party API would leak them.
  if (url.username || url.password) return null;
  if (!HOSTNAME.test(url.hostname)) return null;

  return url.href;
}

/** Shown when the field is empty. */
export const EMPTY_MESSAGE =
  'Enter your website address — for example, yourstore.com.';

/** Shown when there is text but it is not an address we can analyze. */
export const INVALID_MESSAGE =
  'That does not look like a website address. Try something like yourstore.com.';
