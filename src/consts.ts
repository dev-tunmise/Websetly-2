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
 * Primary navigation. "Analyze" is the product, not a page, so it stays a
 * button rather than a link here.
 */
export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
];

/**
 * Canonical path for the work/case-studies hub. The hub is currently offline,
 * so nothing should link to it.
 */
export const WORK_PATH = '/portfolio';

export type Service = {
  slug: string;
  /** Menu / card label. */
  title: string;
  /** <h1> and <title> use this — longer, keyword-bearing. */
  seoTitle: string;
  metaDescription: string;
  /** Text shown on the service card. */
  summary: string;
  /** Longer positioning paragraph for the service page hero. */
  intro: string;
  /** What the client actually receives. */
  deliverables: string[];
  /** What changes for the client. */
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
    slug: 'website-development',
    title: 'Business Websites',
    seoTitle: 'Business Website Design & Development',
    metaDescription:
      'We design and build clear, professional websites for businesses. Easy to use on phones, tablets and computers, so customers can find you and get in touch.',
    summary:
      'A clear, professional website for your business. It shows what you do, builds trust and makes it easy for customers to contact you. It works well on phones, tablets and computers.',
    intro:
      'Your website is often the first thing a customer sees. We build a clear, good-looking website that explains what your business does and makes it easy for people to contact you. It works well on phones, tablets and computers.',
    deliverables: [
      'A website designed to match your business and brand',
      'Pages for your services, about and contact details',
      'A contact form so customers can reach you',
      'A site that works well on phones, tablets and computers',
      'Basic setup so people can find you on Google',
      'A short walkthrough of how your website works',
    ],
    outcomes: [
      'Customers can see what you do and how to reach you',
      'A website that looks professional on any device',
      'A solid base you can add to as your business grows',
    ],
    icon: 'code',
    primary: true,
    legacyAnchors: ['development'],
  },
  {
    slug: 'online-stores',
    title: 'Online Stores',
    seoTitle: 'Online Store Development',
    metaDescription:
      'We build online stores where customers can browse your products, order easily and pay online. Simple to use for your customers and for you.',
    summary:
      'An online store where customers can browse your products and place orders easily. We set it up so buying is simple and your products are easy to find.',
    intro:
      'Selling online should be simple for you and for your customers. We build an online store that shows your products clearly, makes ordering easy and works well on phones, which is where most people shop.',
    deliverables: [
      'A store design that matches your brand',
      'Product pages with clear photos, prices and descriptions',
      'A simple cart and checkout',
      'Online payment setup',
      'A store that works well on phones, tablets and computers',
      'A short walkthrough so you can add and edit products yourself',
    ],
    outcomes: [
      'Customers can find and order your products without help',
      'You can manage your own products and prices',
      'A store that is ready to grow as you add more products',
    ],
    icon: 'trending-up',
    primary: true,
  },
  {
    slug: 'shopify-store-design',
    title: 'Shopify Stores',
    seoTitle: 'Shopify Store Design',
    metaDescription:
      'We set up and design Shopify stores that match your brand, so customers can browse your products and order with ease.',
    summary:
      'A Shopify store set up and designed to match your brand. We arrange your products, pages and layout so customers can shop with ease.',
    intro:
      'Shopify is a popular way to sell online. We set up your store, design it to match your brand and organise your products so customers can find what they want and order easily. If you already have a Shopify store, we can improve how it looks and how fast it loads.',
    deliverables: [
      'A Shopify store set up for your business',
      'A design that matches your brand',
      'Product and collection pages with clear photos and descriptions',
      'A store that works well on phones',
      'Payment and delivery options set up',
      'A short walkthrough so you can manage your store',
    ],
    outcomes: [
      'Customers can browse and buy without confusion',
      'A store that looks professional and matches your brand',
      'You can add and edit products yourself',
    ],
    icon: 'trending-up',
    primary: true,
  },
  {
    slug: 'wordpress-websites',
    title: 'WordPress Websites',
    seoTitle: 'WordPress Website Development',
    metaDescription:
      'We build WordPress websites that you can update yourself. Change text, add pages and post news without needing a developer every time.',
    summary:
      'A WordPress website that you can update and manage yourself. You can change text, add pages and post news without needing a developer every time.',
    intro:
      'WordPress is a good choice if you want to manage your own website. We build it to match your brand and set it up so you can change text, add pages and post news on your own, without calling a developer every time.',
    deliverables: [
      'A WordPress website designed for your business',
      'Pages for your services, about and contact details',
      'A simple setup that is easy to update',
      'A site that works well on phones, tablets and computers',
      'Basic security and backup setup',
      'A short walkthrough so you know how to manage your site',
    ],
    outcomes: [
      'You can update your website without a developer',
      'A website that looks the same and works well on every device',
      'A site you can add to as your business grows',
    ],
    icon: 'code',
    primary: true,
  },
  {
    slug: 'website-redesign',
    title: 'Website Redesign',
    seoTitle: 'Website Redesign Services',
    metaDescription:
      'We give your existing website a fresh look and a cleaner layout, so it is easier to use. We keep what works and improve what does not.',
    summary:
      'Is your website old or hard to use? We give it a fresh look and a cleaner layout. We keep what already works and improve what does not, so visitors find things faster.',
    intro:
      'An old website can make a business look outdated, and pages that are hard to use make visitors leave. We look at what your site does well, then give it a fresh design and a cleaner layout. We also take care to keep your existing pages working, so you do not lose the visitors you already have.',
    deliverables: [
      'A review of your current website: what works and what does not',
      'A new design that looks modern and matches your brand',
      'A cleaner layout that is easier to use',
      'A site that works well on phones, tablets and computers',
      'Your existing pages and links carried over so visitors can still find them',
      'A check after launch to make sure everything works',
    ],
    outcomes: [
      'A website that looks current and professional',
      'Visitors find what they need more easily',
      'You keep the visitors you already get',
    ],
    icon: 'zap',
    primary: true,
    /* Both legacy design anchors land here. */
    legacyAnchors: ['web-design', 'ui-ux-design'],
  },
  {
    slug: 'website-performance-optimization',
    title: 'Speed & Performance',
    seoTitle: 'Website Speed & Performance Optimization',
    metaDescription:
      'We find what is making your website slow and fix it, so your pages open faster and feel smoother on phones and computers.',
    summary:
      'A slow website makes visitors leave. We find what slows your pages down and fix it, so your site opens faster and feels smoother on phones and computers.',
    intro:
      'A slow website makes visitors leave before they see anything. We test your site, find what is slowing it down and fix it. Pages open faster and feel smoother, especially on phones.',
    deliverables: [
      'A speed test of your website on phone and computer',
      'A clear list of what is making it slow',
      'Images made smaller so pages load faster',
      'Extra code and scripts you do not need removed or reduced',
      'Settings changed so repeat visits load quicker',
      'A second test after the fixes to show the difference',
    ],
    outcomes: [
      'Pages that open faster',
      'Fewer visitors leaving because the site is slow',
      'A smoother experience on phones',
    ],
    icon: 'gauge',
    primary: true,
  },
  {
    /* Slug keeps the "technical-seo" keyword even though the card reads
       simply "SEO". The URL is the more valuable of the two, and the legacy
       #seo-setup anchor already points here. */
    slug: 'technical-seo',
    title: 'SEO',
    seoTitle: 'SEO Services',
    metaDescription:
      'We make changes that help Google find and understand your website, so it can show up when people search for what you offer.',
    summary:
      'If people cannot find your site on Google, they cannot become customers. We make changes that help Google understand your pages, so your site can show up when people search for what you offer.',
    intro:
      'SEO means helping Google find your website and understand what it is about. We check your site for problems that stop it showing up in search, and we fix them, so the right people can find you.',
    deliverables: [
      'A check of your website for search problems',
      'Page titles and descriptions written clearly',
      'A sitemap so Google can find all your pages',
      'Broken links and duplicate pages fixed',
      'Your site set up in Google Search Console',
      'Simple advice on what to do next',
    ],
    outcomes: [
      'Google can find and understand your pages',
      'Your site can appear when people search for what you offer',
      'Fewer technical mistakes holding your site back',
    ],
    icon: 'search',
    primary: true,
    legacyAnchors: ['seo-setup'],
  },
  {
    slug: 'website-maintenance',
    title: 'Website Maintenance',
    seoTitle: 'Website Maintenance & Support',
    metaDescription:
      'We keep your website updated, backed up and checked, so it stays safe and keeps working without you having to worry about it.',
    summary:
      'Websites need regular care. We keep yours updated, backed up and checked, so it stays safe and keeps working without you having to worry about it.',
    intro:
      'A website needs regular care, just like anything else you own. We keep yours updated, backed up and checked, so it stays safe and keeps working while you focus on your business.',
    deliverables: [
      'Regular updates to your website software',
      'Security checks',
      'Regular backups',
      'Small changes to your text and images when you need them',
      'Help when something stops working',
    ],
    outcomes: [
      'Fewer surprise problems',
      'A website that stays up to date',
      'One person to contact when something goes wrong',
    ],
    icon: 'shield',
    primary: true,
    legacyAnchors: ['branding'],
  },
  {
    slug: 'website-monitoring',
    title: 'Website Monitoring',
    seoTitle: 'Website Monitoring',
    metaDescription:
      'We watch your website and tell you when it goes down or slows down, so problems get fixed before customers notice.',
    summary:
      'Know when your website goes down or slows down. We keep an eye on it and tell you when something is wrong, so problems get fixed quickly.',
    intro:
      'A website can stop working without you noticing. We watch yours and let you know when it goes down or becomes slow, so the problem can be fixed before it costs you customers.',
    deliverables: [
      'Checks that your website is online',
      'An alert when your website goes down',
      'Regular speed checks',
      'Checks for broken links and errors',
      'A short monthly report',
    ],
    outcomes: [
      'You hear about problems from us, not from your customers',
      'Problems get fixed sooner',
      'A clear record of how your website is doing',
    ],
    icon: 'radar',
    primary: true,
  },
  {
    slug: 'accessibility-audits',
    title: 'Accessibility Audits',
    seoTitle: 'Website Accessibility Audit',
    metaDescription:
      'We check your website for things that make it hard for some people to use, and give you a clear list of what to fix.',
    summary:
      'Find what makes your website hard for some people to use. We check your site and give you a clear list of what to fix, so it works for everyone.',
    intro:
      'Some people use a keyboard instead of a mouse, or a screen reader because they cannot see the screen well. If your website is not built for them, you can lose those visitors. We check your site and give you a clear list of what to fix.',
    deliverables: [
      'A check of your pages using testing tools',
      'Testing with a keyboard and a screen reader',
      'A check of text colours and button sizes',
      'A report that lists each problem and how serious it is',
      'A list of fixes in order of importance, and the fixes themselves if you want us to make them',
    ],
    outcomes: [
      'More people can use your website',
      'You know exactly what to fix',
      'A better experience for all visitors',
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
 * rather than moved under /blog/.
 */
export const LEGACY_BLOG_PREFIX = 'blog-';