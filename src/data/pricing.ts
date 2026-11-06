/**
 * Pricing.
 *
 * `price: null` renders as "Priced after your audit", which is the honest
 * answer for scoped performance work — the size of the job is not knowable
 * until something has been measured. Set a number here only when you are
 * willing to be held to it.
 *
 * The one figure carried over from the previous site is the website build
 * starting price, which websetly.com already published in its FAQ
 * (₦150,000 for a business site, ₦300,000+ for e-commerce).
 */

export type Tier = {
  name: string;
  /** Displayed price, or null for "priced after your audit". */
  price: string | null;
  cadence?: string;
  tagline: string;
  /** Who this is actually for. Reduces mis-qualified enquiries. */
  bestFor: string;
  features: string[];
  cta: { label: string; href: string };
  /** Visually emphasised. Exactly one tier should set this. */
  featured?: boolean;
};

export const TIERS: Tier[] = [
  {
    name: 'Performance Audit',
    price: 'Free',
    tagline: 'Find out what is actually wrong.',
    bestFor:
      'Anyone who suspects their site is slow but does not know why, or what it is costing.',
    features: [
      'Core Web Vitals from real Chrome user data',
      'Lighthouse scores across all four categories',
      'Opportunities ranked by load time saved',
      'A written view on whether we can help',
    ],
    cta: { label: 'Run it now', href: '/analyze' },
  },
  {
    name: 'Optimization Sprint',
    price: null,
    tagline: 'Fix the things that are costing you the most.',
    bestFor:
      'Sites with failing Core Web Vitals or a known conversion problem, where the fixes are understood and need shipping.',
    features: [
      'Full diagnosis with each issue traced to its cause',
      'Implementation in priority order, highest value first',
      'Core Web Vitals, speed and technical SEO work',
      'Before/after measurement on field and lab data',
      'Handover documentation for your team',
    ],
    cta: { label: 'Scope a sprint', href: '/contact' },
    featured: true,
  },
  {
    name: 'Ongoing Care',
    price: null,
    cadence: 'per month',
    tagline: 'Keep the gains, and keep improving.',
    bestFor:
      'Businesses where the site is a primary revenue channel and a regression is expensive.',
    features: [
      'Continuous performance and uptime monitoring',
      'Performance budgets enforced on every deploy',
      'Monthly health report with trend lines',
      'Platform, plugin and dependency updates',
      'A standing allocation for fixes and improvements',
    ],
    cta: { label: 'Talk to us', href: '/contact' },
  },
];

/** Secondary offer — the one price the previous site published publicly. */
export const BUILD_PRICING = {
  name: 'New website build',
  from: '₦150,000',
  note: 'Business sites from ₦150,000; e-commerce and custom platforms from ₦300,000. Quoted properly after we understand the scope.',
  href: '/services/website-development',
};

export const PRICING_FAQ = [
  {
    q: 'Why are most of the prices not listed?',
    a: 'Because we do not know what your site needs until we have measured it. A store with one oversized hero image and a store with four competing JavaScript frameworks both look "slow", and they are not the same job. The audit is free precisely so the quote can be real.',
  },
  {
    q: 'How do you decide what to work on first?',
    a: 'Expected impact divided by effort. Every item in the plan carries an estimate of what it is worth, so you can start at the top and stop at the point where the return no longer justifies the cost. You approve the order before anything ships.',
  },
  {
    q: 'Do I have to commit to a retainer?',
    a: 'No. Most engagements start as a one-off sprint. Ongoing care exists because performance regresses when nobody is watching, not because we need you on a subscription.',
  },
  {
    q: 'What if the audit says my site is fine?',
    a: 'Then we tell you that and you have lost nothing. It happens, and it is a better outcome for both of us than selling you work you did not need.',
  },
];
