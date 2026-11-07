/**
 * Single source of truth for site metadata, navigation and the service
 * catalogue. Pages, schema, sitemap priorities, nav and footer all read from
 * here so a service can never exist in the menu but not in structured data.
 */

export const SITE = {
  name: 'Websetly',
  url: 'https://websetly.com',
  /** Positioning line. Used as the default OG description and in schema. */
  tagline: 'Website Performance & Growth Agency',
  description:
    'Websetly finds what is slowing your website down and fixes it. Core Web Vitals, technical SEO, accessibility and conversion optimisation for businesses and e-commerce stores.',
  locale: 'en_US',
  lang: 'en',
  /** Carried over from the existing privacy page and contact form. */
  email: 'awomoyitunmise@gmail.com',
  phone: '+2347044121358',
  /* NOTE: the legacy WhatsApp float linked to wa.me/2348012345678, which does
     not match the phone number published on the contact and privacy pages.
     Using the published number here — confirm before launch. */
  whatsapp: '2347044121358',
  /** Existing Formspree form — unchanged so submissions keep arriving. */
  formspree: 'https://formspree.io/f/meozbnag',
  founded: '2023',
  /** Existing GA4 property — carried over so historical data stays continuous. */
  ga4: 'G-YN57XMWHS1',
  address: {
    locality: 'Lagos',
    region: 'Lagos',
    country: 'NG',
  },
  social: {
    twitter: '@websetly',
    linkedin: 'https://www.linkedin.com/company/websetly',
  },
  /** Shared OG image for pages that do not define their own. */
  defaultImage: '/images/og-default.jpg',
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
};

/**
 * Primary navigation. Kept short — the repositioning fails if the menu reads
 * like a generic agency. "Analyze" is the product, not a page, so it stays a
 * button rather than a link here.
 *
 * "Home" is explicit rather than relying on the logo. The logo works, but only
 * for visitors who already know that convention.
 */
export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
];

/**
 * Canonical path for the work/case-studies hub. Imported, never hard-coded.
 *
 * ⚠️ The hub is currently OFFLINE — see src/pages/_portfolio.astro. This
 * constant is kept so restoring it is a rename plus a nav entry, but nothing
 * should link to it while the underscore prefix is in place.
 */
export const WORK_PATH = '/portfolio';

export type Service = {
  slug: string;
  /** Menu / card label. */
  title: string;
  /** <h1> and <title> use this — longer, keyword-bearing. */
  seoTitle: string;
  metaDescription: string;
  /** One line under the card title. No jargon, states the outcome. */
  summary: string;
  /** Longer positioning paragraph for the service page hero. */
  intro: string;
  /** What the client actually receives. */
  deliverables: string[];
  /** Problems this service resolves — feeds the FAQ/problem schema. */
  outcomes: string[];
  /** Lucide-style icon key resolved by the Icon component. */
  icon: string;
  /** Primary services appear in nav and on the homepage grid. */
  primary: boolean;
  /** Anchor ids on the legacy services.html that pointed at this service. */
  legacyAnchors?: string[];
};

export const SERVICES: Service[] = [
  {
    slug: 'website-performance-optimization',
    title: 'Website Performance Optimization',
    seoTitle: 'Website Performance Optimization',
    metaDescription:
      'We diagnose and fix what makes your site slow — render-blocking assets, oversized images, bloated JavaScript and slow server response. Measured before and after.',
    summary: 'Make your website faster, smoother and more reliable for your visitors.',
    intro:
      'Most performance work stops at a Lighthouse screenshot. We start from your real users: the devices they actually hold, the networks they are actually on, and the field data Google actually ranks you against. Then we fix the specific things costing you seconds.',
    deliverables: [
      'Full performance audit across mobile and desktop',
      'Render-blocking CSS and JavaScript eliminated',
      'Image pipeline rebuilt — modern formats, correct sizing, lazy loading',
      'Third-party script audit with a measured cost per tag',
      'Caching and compression strategy implemented',
      'Core Web Vitals moved into the green and verified in Search Console',
    ],
    outcomes: [
      'Pages that load in under two seconds on mid-range mobile',
      'Lower bounce rates on paid traffic landing pages',
      'Headroom to add marketing tags without regressing',
    ],
    icon: 'gauge',
    primary: true,
  },
  {
    /* Slug keeps the "technical-seo" keyword even though the card now reads
       simply "SEO". The URL is the more valuable of the two, and the legacy
       #seo-setup anchor already points here. */
    slug: 'technical-seo',
    title: 'SEO',
    seoTitle: 'SEO & Technical SEO Services',
    metaDescription:
      'Crawlability, indexation, structured data, canonicals and site architecture — the technical foundation your content needs in order to rank on Google.',
    summary:
      'Improve your website’s visibility and rank higher on Google search results.',
    intro:
      'Good content on a broken technical foundation does not rank. We audit how search engines actually crawl, render and index your site, then fix what is blocking you — and we do it without breaking the URLs you already rank for.',
    deliverables: [
      'Full crawl and log-based indexation analysis',
      'Canonical, redirect and duplicate-content resolution',
      'Structured data implementation and validation',
      'Internal linking and site architecture plan',
      'XML sitemap and robots.txt correction',
      'Migration-safe redirect mapping when URLs must change',
    ],
    outcomes: [
      'More of your pages indexed and eligible to rank',
      'Rich results where your content qualifies for them',
      'No traffic lost to preventable technical mistakes',
    ],
    icon: 'search',
    primary: true,
    legacyAnchors: ['seo-setup'],
  },
  {
    slug: 'website-development',
    title: 'Website Development',
    seoTitle: 'Website Design & Development',
    metaDescription:
      'We build websites engineered for Core Web Vitals, accessibility and search from the first commit — not optimised after the fact.',
    summary: 'Build fast, modern websites designed for performance, SEO and growth.',
    intro:
      'We build websites the way a performance team would: fast, accessible and search-ready from the first commit rather than optimised afterwards. Targets are agreed in writing before development starts, so speed is a requirement rather than a hope.',
    deliverables: [
      'Design and build on a performance-first stack',
      'Core Web Vitals targets agreed before development starts',
      'WCAG 2.2 AA built in, not retrofitted',
      'Structured data and technical SEO from launch',
      'Full URL and redirect mapping if replacing an existing site',
    ],
    outcomes: [
      'A site that does not need optimising in twelve months',
      'No traffic lost in the migration',
      'A measurable performance baseline from day one',
    ],
    icon: 'code',
    primary: true,
    legacyAnchors: ['development'],
  },
  {
    slug: 'shopify-store-design',
    title: 'Shopify Store Design',
    seoTitle: 'Shopify Store Design & Development',
    metaDescription:
      'Fast, professional Shopify storefronts built for Core Web Vitals and conversion — custom themes, app audits and speed work on stores you already run.',
    summary:
      'Create fast, professional Shopify stores built to turn visitors into customers.',
    intro:
      'Shopify handles the checkout. Everything in front of it is yours to get wrong — and most stores lose money to a heavy theme, a stack of apps nobody has audited, and images shipped at twice the size they render at. We build storefronts that are fast on a mid-range phone, because that is where the sale is won or lost.',
    deliverables: [
      'Custom theme build, or performance work on the theme you already run',
      'App audit with the measured load cost of each one',
      'Product and collection pages tuned for Core Web Vitals',
      'Image, font and script delivery rebuilt',
      'Checkout and product page friction review',
      'Handover documentation for your team',
    ],
    outcomes: [
      'Product pages that load before a shopper gives up',
      'Fewer abandoned carts on mobile',
      'A store you can add apps to without undoing the work',
    ],
    icon: 'trending-up',
    primary: true,
  },
  {
    slug: 'website-redesign',
    title: 'Website Redesign',
    seoTitle: 'Website Redesign Services',
    metaDescription:
      'Modernise the site you have without losing what it already earns — new design, rebuilt performance, and a full redirect map so your rankings survive the move.',
    summary:
      'Modernize your existing website with better design, performance and usability.',
    intro:
      'A redesign is the easiest way to lose traffic you spent years earning. We rebuild the design and the performance together, map every existing URL before anything moves, and measure the new site against the old one rather than against a mood board.',
    deliverables: [
      'Audit of what the current site already does well',
      'New design built on performance-first foundations',
      'Core Web Vitals targets agreed before the build starts',
      'WCAG 2.2 AA accessibility built in from the start',
      'Complete URL and redirect map before launch',
      'Before/after measurement once the new site is live',
    ],
    outcomes: [
      'A site that looks current and loads faster than the one it replaced',
      'No search rankings lost in the move',
      'A measured baseline you can hold future changes against',
    ],
    icon: 'zap',
    primary: true,
    /* Both legacy design anchors land here. #web-design and #ui-ux-design were
       the old site's design services, and a redesign is their closest successor
       now that those two pages are gone. */
    legacyAnchors: ['web-design', 'ui-ux-design'],
  },
  {
    slug: 'website-monitoring',
    title: 'Website Monitoring',
    seoTitle: 'Website & Uptime Monitoring',
    metaDescription:
      'Continuous monitoring of uptime, Core Web Vitals and performance budgets, with alerts before your customers are the ones telling you.',
    summary:
      'Know when your website slows down, breaks or starts losing performance.',
    intro:
      'Performance is not a project you finish. A plugin update, a new marketing tag or a redesigned template can undo months of work overnight. We watch continuously and alert you when it happens.',
    deliverables: [
      'Uptime and availability monitoring with alerting',
      'Real user Core Web Vitals tracking',
      'Performance budgets enforced against every deploy',
      'Broken link and error monitoring',
      'Monthly health report with trend lines',
    ],
    outcomes: [
      'Regressions caught in hours instead of quarters',
      'Evidence of what changed and when',
      'Performance that holds its value over time',
    ],
    icon: 'radar',
    primary: true,
  },
  {
    slug: 'website-maintenance',
    title: 'Website Maintenance',
    seoTitle: 'Website Maintenance & Support Plans',
    metaDescription:
      'Ongoing updates, backups, security patching and performance care — so your site stays fast, secure and current without you managing it.',
    summary: 'Keep your website secure, updated, fast and running smoothly.',
    intro:
      'The work does not end at launch. Plugins age, dependencies pick up vulnerabilities, and content grows heavier. We handle the upkeep so your site does not quietly degrade.',
    deliverables: [
      'Platform, plugin and dependency updates',
      'Security patching and vulnerability monitoring',
      'Automated backups with tested restores',
      'Content and small change requests',
      'Quarterly performance review',
    ],
    outcomes: [
      'No surprise breakages or security incidents',
      'A site that stays current without your attention',
      'One accountable team when something goes wrong',
    ],
    icon: 'shield',
    primary: true,
    legacyAnchors: ['branding'],
  },
  {
    slug: 'accessibility-audits',
    title: 'Accessibility Audits',
    seoTitle: 'WCAG Accessibility Audits',
    metaDescription:
      'WCAG 2.2 AA audits combining automated testing with manual keyboard and screen reader review, plus a prioritised remediation plan.',
    summary:
      'Find accessibility issues and make your website easier for everyone to use.',
    intro:
      'Automated tools catch roughly a third of accessibility issues. The rest need a person with a keyboard and a screen reader. We do both, and give you a remediation plan ordered by user impact and legal exposure.',
    deliverables: [
      'Automated scan across all page templates',
      'Manual keyboard-only and screen reader testing',
      'Colour contrast and target size review',
      'WCAG 2.2 AA conformance report with severity ratings',
      'Prioritised remediation plan, and the fixes if you want us to ship them',
    ],
    outcomes: [
      'A site usable by customers you are currently turning away',
      'Reduced legal and procurement risk',
      'Accessibility improvements that also help SEO',
    ],
    icon: 'accessibility',
    primary: true,
  },
];

export const PRIMARY_SERVICES = SERVICES.filter((s) => s.primary);
export const SECONDARY_SERVICES = SERVICES.filter((s) => !s.primary);

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Legacy blog posts published as flat root URLs (`/blog-seo-basics-designers`).
 * These are indexed and carry link equity, so the slug is preserved verbatim
 * rather than moved under /blog/. See docs/REDESIGN-PLAN.md for the rationale.
 */
export const LEGACY_BLOG_PREFIX = 'blog-';
