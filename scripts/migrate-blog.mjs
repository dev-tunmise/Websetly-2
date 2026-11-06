/**
 * One-shot migration: legacy hand-written `blog-*.html` files -> Markdown in
 * the `blog` content collection.
 *
 * The flat legacy slug is written into frontmatter as `legacySlug` so the post
 * keeps rendering at its exact indexed URL (`/blog-seo-basics-designers`).
 * Nothing here changes a URL.
 *
 *   node scripts/migrate-blog.mjs
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'content', 'blog');

/**
 * The legacy files hold double-encoded UTF-8: the original bytes were decoded
 * as CP1252 (not Latin-1) and re-saved, so `—` became `â€”` and an emoji
 * became `ðŸ’¡`. CP1252 maps 0x80–0x9F to typographic characters, which is why
 * a plain latin1 round-trip cannot reverse it.
 *
 * We map each character back to its CP1252 byte, then decode the run as UTF-8.
 * Only well-formed runs are replaced, so genuinely-correct text is untouched.
 */
const CP1252_REV = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
  [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
  [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f],
]);

function toByte(ch) {
  const cp = ch.codePointAt(0);
  if (cp <= 0xff) return cp;
  return CP1252_REV.get(cp);
}

function repairEncoding(s) {
  let out = '';
  for (let i = 0; i < s.length; ) {
    const lead = toByte(s[i]);
    // UTF-8 lead bytes for 2–4 byte sequences.
    const len = lead === undefined ? 0
      : lead >= 0xf0 && lead <= 0xf4 ? 4
      : lead >= 0xe0 && lead <= 0xef ? 3
      : lead >= 0xc2 && lead <= 0xdf ? 2
      : 0;

    if (len) {
      const bytes = [lead];
      for (let k = 1; k < len; k++) {
        const b = toByte(s[i + k] ?? '');
        if (b === undefined || b < 0x80 || b > 0xbf) break;
        bytes.push(b);
      }
      if (bytes.length === len) {
        const decoded = Buffer.from(bytes).toString('utf8');
        if (!decoded.includes('�')) {
          out += decoded;
          i += len;
          continue;
        }
      }
    }
    out += s[i];
    i += 1;
  }
  return out;
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');
}

const collapse = (s) => s.replace(/[ \t ]+/g, ' ').trim();
const clean = (s) => collapse(decodeEntities(s.replace(/<[^>]+>/g, '')));

/* ==========================================================================
   Minimal HTML parser. Regex alone dropped text held in nested card <div>s,
   which is real content loss on posts we are migrating for their SEO value.
   ========================================================================== */

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function parse(html) {
  const root = { tag: '#root', attrs: '', children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [full, closeTag, openTag, attrs, selfClose, text] = m;
    const top = stack[stack.length - 1];
    if (text !== undefined) {
      if (text.trim()) top.children.push({ tag: '#text', value: text });
    } else if (closeTag) {
      const name = closeTag.toLowerCase();
      // Unwind to the matching open tag; tolerate unclosed inline elements.
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === name) {
          stack.length = i;
          break;
        }
      }
    } else if (openTag) {
      const name = openTag.toLowerCase();
      if (full.startsWith('<!--')) continue;
      const node = { tag: name, attrs: attrs || '', children: [] };
      top.children.push(node);
      if (!VOID.has(name) && !selfClose) stack.push(node);
    }
  }
  return root;
}

const BLOCK = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li',
  'blockquote', 'pre', 'table', 'figure', 'hr',
]);
const DROP = new Set(['script', 'style', 'svg', 'noscript', 'button', 'nav', 'form']);

function attrOf(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'));
  return m ? m[1] : '';
}

function hasBlockDescendant(node) {
  for (const c of node.children || []) {
    if (c.tag === '#text') continue;
    if (DROP.has(c.tag)) continue;
    if (BLOCK.has(c.tag)) return true;
    if (hasBlockDescendant(c)) return true;
  }
  return false;
}

/** Render a node's subtree as inline Markdown. */
function inlineOf(node) {
  let out = '';
  for (const c of node.children || []) {
    if (c.tag === '#text') {
      out += decodeEntities(c.value).replace(/[\s ]+/g, ' ');
    } else if (DROP.has(c.tag)) {
      continue;
    } else if (c.tag === 'br') {
      out += '\n';
    } else if (c.tag === 'strong' || c.tag === 'b') {
      const t = inlineOf(c).trim();
      if (t) out += `**${t}**`;
    } else if (c.tag === 'em' || c.tag === 'i') {
      const t = inlineOf(c).trim();
      if (t) out += `*${t}*`;
    } else if (c.tag === 'code') {
      const t = inlineOf(c).trim();
      if (t) out += `\`${t}\``;
    } else if (c.tag === 'a') {
      const t = inlineOf(c).trim();
      if (!t) continue;
      const href = attrOf(c.attrs, 'href');
      if (!href || href.startsWith('#')) {
        out += t;
      } else {
        // Legacy internal .html links become extensionless, matching new routes.
        let to = href.replace(/^\/?index\.html$/, '/').replace(/\.html(?=$|[#?])/, '');
        if (!/^(https?:|mailto:|tel:|\/)/.test(to)) to = `/${to}`;
        out += `[${t}](${to})`;
      }
    } else {
      out += inlineOf(c);
    }
  }
  return out;
}

/** Strip decorative glyphs the legacy markup baked into list text. */
function stripBullet(s) {
  return s.replace(/^\s*[•▪◦·✓✔→–—-]\s+/, '').trim();
}

function walk(node, out, depth = 0) {
  for (const c of node.children || []) {
    if (c.tag === '#text') {
      // Loose text directly inside a container still counts as content.
      const t = collapse(decodeEntities(c.value));
      if (t) out.push({ type: 'p', text: t });
      continue;
    }
    if (DROP.has(c.tag)) continue;

    switch (c.tag) {
      case 'h1':
        // The <h1> lives outside the article body; if one appears inside,
        // demote it so the page keeps exactly one h1.
        pushHeading(out, 2, inlineOf(c));
        break;
      case 'h2':
        pushHeading(out, 2, inlineOf(c));
        break;
      case 'h3':
        pushHeading(out, 3, inlineOf(c));
        break;
      case 'h4':
      case 'h5':
      case 'h6':
        pushHeading(out, 4, inlineOf(c));
        break;
      case 'p': {
        const t = collapse(inlineOf(c));
        if (t) out.push({ type: 'p', text: t });
        break;
      }
      case 'ul':
      case 'ol': {
        const items = (c.children || [])
          .filter((x) => x.tag === 'li')
          .map((li) => stripBullet(collapse(inlineOf(li))))
          .filter(Boolean);
        if (items.length) out.push({ type: 'list', ordered: c.tag === 'ol', items });
        break;
      }
      case 'blockquote': {
        const t = collapse(inlineOf(c));
        if (t) out.push({ type: 'quote', text: t });
        break;
      }
      case 'pre': {
        const t = decodeEntities(inlineOf(c)).trim();
        if (t) out.push({ type: 'code', text: t });
        break;
      }
      case 'hr':
        break;
      case 'img':
        break;
      default: {
        // A container with no block children is a styled text block (the card
        // grids the legacy templates used). Emit its text rather than lose it.
        if (!hasBlockDescendant(c)) {
          const t = collapse(inlineOf(c));
          // Skip decorative badges: bare step numbers, single glyphs, icon-only
          // circles. These carried no meaning outside the old visual design.
          if (t && !/^[\d\W_]{1,3}$/.test(t)) {
            out.push({ type: 'p', text: t, soft: true });
          }
        } else {
          walk(c, out, depth + 1);
        }
      }
    }
  }
}

function pushHeading(out, level, raw) {
  const t = collapse(raw);
  if (t) out.push({ type: 'h', level, text: t });
}

/**
 * Normalise heading levels so the shallowest heading in the body is an h2.
 *
 * The legacy templates used <h2> for decorative section kickers and <h3> for
 * the actual section titles, so several posts open at h3 directly under the
 * page <h1>. That is a skipped level: screen-reader users navigating by
 * heading lose a rung, and the document outline reads as if content is nested
 * under a section that does not exist.
 */
function normaliseHeadingLevels(blocks) {
  const levels = blocks.filter((b) => b.type === 'h').map((b) => b.level);
  if (levels.length === 0) return blocks;

  // Pass 1 — shift the whole document so its shallowest heading is an h2,
  // sitting one level below the page <h1> supplied by the layout.
  const shift = 2 - Math.min(...levels);
  const shifted = blocks.map((b) =>
    b.type === 'h' ? { ...b, level: Math.min(6, b.level + shift) } : b,
  );

  // Pass 2 — clamp in document order so no heading is ever more than one level
  // deeper than the heading before it. Shifting alone is not enough: a post
  // whose first heading is an h3 (because the legacy h2 above it was a
  // decorative kicker we dropped) still skips a level even when h2s appear
  // later in the page. `prev` starts at 1 for the layout's <h1>.
  let prev = 1;
  return shifted.map((b) => {
    if (b.type !== 'h') return b;
    const level = Math.min(b.level, prev + 1);
    prev = level;
    return { ...b, level };
  });
}

function render(rawBlocks) {
  const blocks = normaliseHeadingLevels(rawBlocks);
  const parts = [];
  let prev = null;
  for (const b of blocks) {
    if (b.type === 'h') {
      parts.push(`${'#'.repeat(b.level)} ${b.text}`);
    } else if (b.type === 'p') {
      // Consecutive soft blocks (sibling cards) read better as a list than as
      // a run of one-line paragraphs.
      if (b.soft && prev && prev.type === 'p' && prev.soft) {
        const last = parts.length - 1;
        if (parts[last].startsWith('- ')) parts[last] += `\n- ${b.text}`;
        else parts[last] = `- ${parts[last]}\n- ${b.text}`;
      } else {
        parts.push(b.text);
      }
    } else if (b.type === 'list') {
      parts.push(
        b.items.map((it, i) => `${b.ordered ? `${i + 1}.` : '-'} ${it}`).join('\n'),
      );
    } else if (b.type === 'quote') {
      parts.push(`> ${b.text}`);
    } else if (b.type === 'code') {
      parts.push('```\n' + b.text + '\n```');
    }
    prev = b;
  }
  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

function htmlToMarkdown(html) {
  return render(collect(parse(html)));
}
function collect(tree) {
  const out = [];
  walk(tree, out);
  return out;
}

/* ========================================================================== */

/** Legacy pill labels -> the taxonomy defined in content.config.ts. */
const CATEGORY_MAP = {
  seo: 'Technical SEO',
  'technical seo': 'Technical SEO',
  performance: 'Performance',
  speed: 'Performance',
  'case study': 'Case Study',
  'web design': 'Guides',
  design: 'Guides',
  business: 'Guides',
  startup: 'Guides',
  domains: 'Guides',
  domain: 'Guides',
  hosting: 'Guides',
  accessibility: 'Accessibility',
  conversion: 'Conversion',
};

function pickCategory(label, slug, title) {
  const key = (label || '').toLowerCase().trim();
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  const hay = `${slug} ${title}`.toLowerCase();
  if (hay.includes('case-study') || hay.includes('case study')) return 'Case Study';
  if (hay.includes('performance') || hay.includes('speed') || hay.includes('checklist'))
    return 'Performance';
  if (hay.includes('seo')) return 'Technical SEO';
  if (hay.includes('accessib')) return 'Accessibility';
  if (hay.includes('convers') || hay.includes('leads')) return 'Conversion';
  return 'Guides';
}

const yamlString = (s) => `'${String(s).replace(/'/g, "''")}'`;

function fitDescription(desc, fallback) {
  let d = clean(desc || '') || clean(fallback || '');
  if (d.length < 70 && fallback) d = clean(`${d} ${clean(fallback)}`);
  if (d.length > 165) {
    const cut = d.slice(0, 166);
    const lastSpace = cut.lastIndexOf(' ');
    d = (lastSpace > 90 ? cut.slice(0, lastSpace) : cut.slice(0, 165)).replace(
      /[,;:\s]+$/,
      '',
    );
  }
  return d;
}

mkdirSync(OUT, { recursive: true });

const files = readdirSync(ROOT).filter(
  (f) => f.startsWith('blog-') && f.endsWith('.html'),
);

const report = [];
let migrated = 0;

for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  const raw = repairEncoding(readFileSync(join(ROOT, file), 'utf8'));

  const h1 = raw.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title = h1 ? clean(h1[1]) : slug;

  const metaDesc = raw.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const standfirst = raw.match(/<\/h1>\s*<p\b[^>]*>([\s\S]*?)<\/p>/i);
  const description = fitDescription(metaDesc?.[1], standfirst?.[1] ?? '');

  const dateM = raw.match(
    /<span class="text-gray-500">\s*([A-Z][a-z]+ \d{1,2}, \d{4})\s*<\/span>/,
  );
  const pubDate = dateM ? new Date(dateM[1]) : new Date('2025-08-20');

  const readM = raw.match(/(\d+)\s*min read/i);
  const categoryM = raw.match(
    /<span class="px-4 py-2 bg-[\w-]+ text-[\w-]+ rounded-full[^"]*">\s*([^<]+?)\s*<\/span>/,
  );

  const keywordsM = raw.match(/<meta\s+name="keywords"\s+content="([^"]*)"/i);
  const tags = keywordsM
    ? keywordsM[1].split(',').map((t) => clean(t)).filter(Boolean).slice(0, 6)
    : [];

  const start = raw.search(/<div class="prose[^"]*"[^>]*>/i);
  const end = raw.indexOf('</article>', start);
  if (start === -1 || end === -1) {
    report.push(`SKIP  ${slug} — no prose/article container`);
    continue;
  }

  const body = htmlToMarkdown(raw.slice(start, end));
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 250) report.push(`WARN  ${slug} — only ${words} words extracted`);

  const readingTime = readM ? Number(readM[1]) : Math.max(1, Math.round(words / 220));
  const category = pickCategory(categoryM?.[1], slug, title);

  const frontmatter = [
    '---',
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    `pubDate: ${pubDate.toISOString().slice(0, 10)}`,
    `category: ${yamlString(category)}`,
    `legacySlug: ${yamlString(slug)}`,
    tags.length
      ? `tags:\n${tags.map((t) => `  - ${yamlString(t)}`).join('\n')}`
      : 'tags: []',
    `readingTime: ${readingTime}`,
    `author: 'Websetly'`,
    '---',
    '',
  ].join('\n');

  writeFileSync(join(OUT, `${slug}.md`), `${frontmatter}${body}\n`, 'utf8');
  migrated += 1;
  report.push(`OK    ${slug} — ${words} words, ${category}`);
}

console.log(report.sort().join('\n'));
console.log(`\nMigrated ${migrated}/${files.length} posts into src/content/blog/`);
