/**
 * Post-build audit. Checks the things that silently break SEO and accessibility
 * and that a type-checker cannot see.
 *
 *   node scripts/audit-build.mjs
 *
 * Exits non-zero on any error-level finding, so it can gate a deploy.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const all = walk(DIST);
const pages = all.filter((f) => f.endsWith('.html'));

const routeOf = (file) => {
  const rel = relative(DIST, file).replace(/\\/g, '/');
  return rel === 'index.html' ? '/' : `/${rel.replace(/\.html$/, '')}`;
};

const routes = new Set(pages.map(routeOf));
const assets = new Set(
  all.filter((f) => !f.endsWith('.html')).map((f) => `/${relative(DIST, f).replace(/\\/g, '/')}`),
);

let totalHtml = 0;

for (const file of pages) {
  const page = routeOf(file);
  const html = readFileSync(file, 'utf8');
  totalHtml += Buffer.byteLength(html);

  /* ---------------------------------------------------- heading hierarchy */
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length === 0) err(page, 'no <h1>');
  if (h1s.length > 1) err(page, `${h1s.length} <h1> elements (must be exactly 1)`);

  // Heading levels must not skip (h2 -> h4).
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      warn(page, `heading jumps h${levels[i - 1]} -> h${levels[i]}`);
      break;
    }
  }

  /* ------------------------------------------------------------- metadata */
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i);
  if (!canonical) err(page, 'no canonical');
  else if (!canonical[1].startsWith('https://websetly.com'))
    err(page, `canonical not absolute: ${canonical[1]}`);
  else if (canonical[1].endsWith('/') && canonical[1] !== 'https://websetly.com/')
    err(page, `canonical has trailing slash: ${canonical[1]}`);

  const title = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!title || !title[1].trim()) err(page, 'no <title>');
  else if (title[1].length > 65 && !page.startsWith('/blog-')) {
    // Legacy posts (flat /blog-… URLs) keep the exact <title> they are indexed
    // and ranking under. Several exceed the SERP truncation point, but that is
    // already true on the live site and rewriting them would change the string
    // search engines match against. Deliberately exempt.
    warn(page, `title ${title[1].length} chars: ${title[1]}`);
  }

  const desc = html.match(/<meta name="description" content="([^"]*)"/i);
  if (!desc || !desc[1].trim()) err(page, 'no meta description');
  else if (desc[1].length > 165)
    warn(page, `meta description ${desc[1].length} chars`);

  if (!/<meta property="og:image" content="/.test(html)) err(page, 'no og:image');
  if (!/<meta name="twitter:card"/.test(html)) err(page, 'no twitter:card');

  /* -------------------------------------------------------- structured data */
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (ld.length === 0) err(page, 'no JSON-LD');
  for (const m of ld) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      err(page, `invalid JSON-LD: ${e.message}`);
    }
  }

  /* ------------------------------------------------------------ accessibility */
  if (!/<html[^>]+lang="/i.test(html)) err(page, 'no lang on <html>');

  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=/.test(img[0])) err(page, `<img> without alt: ${img[0].slice(0, 90)}`);
  }

  // A link whose only content is an icon needs an accessible name.
  for (const a of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const text = a[2].replace(/<[^>]+>/g, '').trim();
    const hasLabel = /aria-label=|aria-labelledby=/.test(a[1]);
    if (!text && !hasLabel) warn(page, `link with no accessible name: ${a[0].slice(0, 80)}`);
  }

  /* -------------------------------------------------------- internal links */
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const target = m[1];
    if (target.startsWith('//')) continue;
    const clean = target.replace(/\/$/, '') || '/';
    if (routes.has(clean) || assets.has(target) || assets.has(clean)) continue;
    // Redirect targets configured in _redirects are resolved at the edge.
    if (['/case-studies', '/audit', '/free-audit', '/speed-test', '/pagespeed'].includes(clean))
      continue;
    err(page, `broken internal link: ${target}`);
  }

  /* --------------------------------------------------------------- legacy */
  if (/unpkg\.com|aos@|fonts\.googleapis\.com|cdn\.tailwindcss/.test(html))
    err(page, 'references a legacy third-party asset');
  if (/#FF6B35|bg-secondary|text-secondary/.test(html))
    err(page, 'still references the retired orange brand colour');
}

/* ------------------------------------------------------------- payloads */
const js = all.filter((f) => f.endsWith('.js'));
const css = all.filter((f) => f.endsWith('.css'));
const jsBytes = js.reduce((n, f) => n + statSync(f).size, 0);
const cssBytes = css.reduce((n, f) => n + statSync(f).size, 0);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

console.log('─'.repeat(70));
console.log(`Pages           ${pages.length}`);
console.log(`HTML total      ${kb(totalHtml)}  (avg ${kb(totalHtml / pages.length)})`);
console.log(`JS  files       ${js.length}  ${kb(jsBytes)}`);
console.log(`CSS files       ${css.length}  ${kb(cssBytes)}`);
console.log('─'.repeat(70));

if (warnings.length) {
  console.log(`\n⚠  ${warnings.length} warning(s)`);
  for (const w of warnings) console.log(`   ${w}`);
}

if (errors.length) {
  console.log(`\n✗  ${errors.length} error(s)`);
  for (const e of errors) console.log(`   ${e}`);
  process.exit(1);
}

console.log('\n✓  No errors.');
