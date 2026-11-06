/**
 * Homepage content. Extracted from the template so copy can be revised without
 * touching markup — and so every claim on the page is reviewable in one place.
 */

/** Section 3 — the problems the repositioning is built around. */
export const PROBLEMS = [
  {
    icon: 'clock',
    title: 'Your pages take too long to load',
    body: 'Every extra second of load time costs conversions. On mobile, most visitors leave before a slow page finishes rendering — and you never see them in your analytics.',
  },
  {
    icon: 'activity',
    title: 'Core Web Vitals are failing',
    body: 'Search Console says your URLs need improvement, the report is opaque about why, and nobody on your team can translate it into a list of things to actually change.',
  },
  {
    icon: 'search',
    title: 'Good pages are not being indexed',
    body: 'Content you paid for never ranks because crawlers cannot reach it, canonicals point the wrong way, or duplicate URLs split the authority between them.',
  },
  {
    icon: 'trending-up',
    title: 'Traffic arrives but does not convert',
    body: 'You are paying for visitors who abandon at the same step every time. The friction is measurable and fixable, but nobody has instrumented the funnel to find it.',
  },
  {
    icon: 'accessibility',
    title: 'Parts of the site are unusable for some customers',
    body: 'Keyboard traps, unlabelled fields and low-contrast text quietly exclude paying customers — and increasingly attract legal attention.',
  },
  {
    icon: 'radar',
    title: 'Performance silently regresses',
    body: 'A plugin update or a new marketing tag undoes months of work. Without monitoring, you find out from a ranking drop a quarter later.',
  },
] as const;

/** Section 5 - how the engagement actually runs. */
export const PROCESS = [
  {
    step: '01',
    title: 'Measure',
    body: 'We analyze your website using real user data, performance tests, analytics, and a full site crawl to understand what’s actually happening.',
  },
  {
    step: '02',
    title: 'Diagnose',
    body: 'We trace each problem to its root cause and prioritize the fixes that can make the biggest difference.',
  },
  {
    step: '03',
    title: 'Fix',
    body: 'We implement the highest-impact improvements first and measure the results of every change.',
  },
  {
    step: '04',
    title: 'Monitor',
    body: 'We continuously monitor your website to make sure your performance stays strong and catch regressions before they become bigger problems.',
  },
] as const;

/**
 * Section 2 — trust indicators.
 *
 * These are the claims the previous websetly.com already published on its About
 * and Portfolio pages, carried forward unchanged. Do not add a number here that
 * you cannot evidence on request.
 */
export const TRUST_STATS = [
  { value: '150+', label: 'Projects delivered' },
  { value: '2023', label: 'Working with clients since' },
  { value: '7–14', label: 'Days to first measurable win' },
  { value: '4', label: 'Industries served' },
] as const;
