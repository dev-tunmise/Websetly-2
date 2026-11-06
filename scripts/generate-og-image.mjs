/**
 * Generates the default Open Graph / Twitter card image.
 *
 * The previous site pointed og:image at /images/og-image.jpg on every page —
 * a file that did not exist in the repository. Every share on LinkedIn, X,
 * Slack and WhatsApp rendered without a preview image.
 *
 * Run when the brand changes; the output is committed:
 *   node scripts/generate-og-image.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'images');

const W = 1200;
const H = 630;

// Design tokens, kept in sync with src/styles/global.css by hand — this runs
// outside the Tailwind pipeline.
const BRAND = '#2e7d59';
const INK_900 = '#161e25';
const INK_500 = '#5f7383';
const INK_200 = '#e1e8ed';

/* System font stack: this renders through resvg, which has no access to the
   self-hosted Inter woff2. Segoe UI is metrically close enough for a card. */
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f1f9f5"/>
      <stop offset="60%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="${BRAND}"/>

  <!-- Wordmark -->
  <g transform="translate(88, 92)">
    <path d="M0 26 L14 8 L25 19 L48 -8" fill="none" stroke="${BRAND}"
          stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="48" cy="-8" r="6.5" fill="${BRAND}"/>
    <text x="72" y="24" font-family="${FONT}" font-size="40" font-weight="600"
          fill="${INK_900}" letter-spacing="-1">Websetly</text>
  </g>

  <!-- Headline -->
  <text x="88" y="286" font-family="${FONT}" font-size="76" font-weight="700"
        fill="${INK_900}" letter-spacing="-2.6">Faster websites.</text>
  <text x="88" y="374" font-family="${FONT}" font-size="76" font-weight="700"
        fill="${INK_900}" letter-spacing="-2.6">Better rankings.</text>
  <text x="88" y="462" font-family="${FONT}" font-size="76" font-weight="700"
        fill="${BRAND}" letter-spacing="-2.6">More revenue.</text>

  <!-- Footer rule + positioning line -->
  <rect x="88" y="516" width="${W - 176}" height="1" fill="${INK_200}"/>
  <text x="88" y="562" font-family="${FONT}" font-size="27" font-weight="400"
        fill="${INK_500}">Core Web Vitals · Technical SEO · Conversion Optimisation</text>
</svg>`;

mkdirSync(OUT_DIR, { recursive: true });

const target = join(OUT_DIR, 'og-default.jpg');
await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile(target);
console.log(`Wrote ${target} (1200x630)`);

/* --------------------------------------------------------------------------
   Apple touch icon. iOS ignores SVG favicons and falls back to a screenshot
   when this is missing, so it is generated from the same mark as favicon.svg.
   -------------------------------------------------------------------------- */
const ICON = 180;
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON}" height="${ICON}" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${BRAND}"/>
  <path d="M7 21.5 12.5 14.5 17 19 25.5 9" fill="none" stroke="#ffffff"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="25.5" cy="9" r="2.75" fill="#ffffff"/>
</svg>`;

// No rounded corners: iOS applies its own mask, and baking one in leaves a
// visible dark fringe.
const iconTarget = join(ROOT, 'public', 'apple-touch-icon.png');
await sharp(Buffer.from(iconSvg)).png({ compressionLevel: 9 }).toFile(iconTarget);
console.log(`Wrote ${iconTarget} (${ICON}x${ICON})`);
