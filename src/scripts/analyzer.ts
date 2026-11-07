/**
 * Website analyzer — client for the Google PageSpeed Insights API.
 *
 * This is deliberately a real measurement, not a mock. PSI is CORS-enabled and
 * returns both lab (Lighthouse) and field (CrUX) data, which is exactly the
 * pairing the positioning rests on: we grade you on what real users experience,
 * then show the lab detail that explains why.
 *
 * Loaded ONLY on /analyze. No other page pays for this script.
 *
 * Quota note: keyless requests are rate-limited by Google. Set
 * PUBLIC_PSI_API_KEY in the environment before this becomes the main lead
 * source — see docs/REDESIGN-PLAN.md.
 */

import { INVALID_MESSAGE, normalizeUrl } from '../lib/url';

/**
 * The edge proxy in functions/api/pagespeed.js. It holds the API key, so no
 * key is ever compiled into this bundle.
 */
const PROXY_ENDPOINT = '/api/pagespeed';

/** Direct endpoint, used only by the dev fallback below. */
const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

type Strategy = 'mobile' | 'desktop';

interface MetricView {
  key: string;
  label: string;
  value: number | null;
  display: string;
  /** good | needs-improvement | poor — CWV thresholds. */
  rating: Rating;
  /** Plain-language explanation of what the metric measures. */
  help: string;
  /** True when sourced from real users rather than a lab run. */
  field: boolean;
}

type Rating = 'good' | 'average' | 'poor' | 'none';

interface Opportunity {
  title: string;
  description: string;
  savingsMs: number;
  displayValue: string;
}

interface Report {
  finalUrl: string;
  strategy: Strategy;
  scores: { id: string; label: string; score: number | null }[];
  metrics: MetricView[];
  opportunities: Opportunity[];
  hasFieldData: boolean;
}

/* ------------------------------------------------------------------ utils */

const $ = <T extends HTMLElement = HTMLElement>(sel: string) =>
  document.querySelector<T>(sel);

/** Core Web Vitals thresholds, per web.dev. */
function rate(metric: string, value: number | null): Rating {
  if (value === null || Number.isNaN(value)) return 'none';
  const t: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
  };
  const bounds = t[metric];
  if (!bounds) return 'none';
  return value <= bounds[0] ? 'good' : value <= bounds[1] ? 'average' : 'poor';
}

const fmtMs = (ms: number | null) =>
  ms === null ? '—' : ms >= 1000 ? `${(ms / 1000).toFixed(0 + (ms < 10000 ? 1 : 0))} s` : `${Math.round(ms)} ms`;

const scoreRating = (s: number | null): Rating =>
  s === null ? 'none' : s >= 0.9 ? 'good' : s >= 0.5 ? 'average' : 'poor';

const RATING_TEXT: Record<Rating, string> = {
  good: 'Good',
  average: 'Needs work',
  poor: 'Poor',
  none: 'No data',
};

/* ------------------------------------------------------------------ fetch */

/**
 * Cloudflare Pages Functions do not run under `astro dev`, so the proxy 404s
 * locally. Rather than leave the analyzer dead in development, fall back to a
 * keyless direct call — which is rate-limited, and is why it is gated on DEV.
 * In production a failing proxy surfaces as an error instead of silently
 * degrading to an unauthenticated request.
 */
async function fetchReport(url: string, strategy: Strategy): Promise<Response> {
  const params = new URLSearchParams({ url, strategy });
  const res = await fetch(`${PROXY_ENDPOINT}?${params}`);

  if (res.status === 404 && import.meta.env.DEV) {
    const direct = new URLSearchParams({ url, strategy });
    for (const c of ['performance', 'seo', 'accessibility', 'best-practices']) {
      direct.append('category', c);
    }
    return fetch(`${PSI_ENDPOINT}?${direct}`);
  }

  return res;
}

async function runAnalysis(url: string, strategy: Strategy): Promise<Report> {
  const res = await fetchReport(url, strategy);
  if (!res.ok) {
    let detail = `PageSpeed returned ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error?.message) detail = body.error.message;
    } catch {
      /* keep the status-code message */
    }
    throw new Error(detail);
  }
  const data = await res.json();
  return shape(data, strategy);
}

function shape(data: any, strategy: Strategy): Report {
  const lh = data.lighthouseResult ?? {};
  const audits = lh.audits ?? {};
  const cats = lh.categories ?? {};

  const scores = [
    { id: 'performance', label: 'Performance', score: cats.performance?.score ?? null },
    { id: 'accessibility', label: 'Accessibility', score: cats.accessibility?.score ?? null },
    { id: 'best-practices', label: 'Best Practices', score: cats['best-practices']?.score ?? null },
    { id: 'seo', label: 'SEO', score: cats.seo?.score ?? null },
  ];

  // Prefer field data (what Google actually ranks on); fall back to the lab run.
  const field = data.loadingExperience?.metrics ?? {};
  const hasFieldData = Object.keys(field).length > 0;

  const labMs = (id: string): number | null => {
    const v = audits[id]?.numericValue;
    return typeof v === 'number' ? v : null;
  };

  const metrics: MetricView[] = [
    {
      key: 'LCP',
      label: 'Largest Contentful Paint',
      value: hasFieldData
        ? (field.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null)
        : labMs('largest-contentful-paint'),
      display: '',
      rating: 'none',
      help: 'How long until the main content is visible. Under 2.5 s is good.',
      field: hasFieldData && !!field.LARGEST_CONTENTFUL_PAINT_MS,
    },
    {
      key: 'INP',
      label: 'Interaction to Next Paint',
      value: field.INTERACTION_TO_NEXT_PAINT?.percentile ?? null,
      display: '',
      rating: 'none',
      help: 'How quickly the page responds when someone taps or clicks. Under 200 ms is good.',
      field: !!field.INTERACTION_TO_NEXT_PAINT,
    },
    {
      key: 'CLS',
      label: 'Cumulative Layout Shift',
      value: hasFieldData
        ? (field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile ?? null) / 100
        : (audits['cumulative-layout-shift']?.numericValue ?? null),
      display: '',
      rating: 'none',
      help: 'How much the layout jumps while loading. Under 0.1 is good.',
      field: hasFieldData && !!field.CUMULATIVE_LAYOUT_SHIFT_SCORE,
    },
    {
      key: 'TTFB',
      label: 'Time to First Byte',
      value:
        field.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile ??
        labMs('server-response-time'),
      display: '',
      rating: 'none',
      help: 'How long your server takes to start responding. Under 800 ms is good.',
      field: !!field.EXPERIMENTAL_TIME_TO_FIRST_BYTE,
    },
  ].map((m) => ({
    ...m,
    rating: rate(m.key, m.value),
    display:
      m.value === null
        ? '—'
        : m.key === 'CLS'
          ? m.value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
          : fmtMs(m.value),
  }));

  // Opportunities, ranked by the time they would actually save.
  const opportunities: Opportunity[] = Object.values(audits)
    .filter(
      (a: any) =>
        a?.details?.type === 'opportunity' &&
        typeof a.details.overallSavingsMs === 'number' &&
        a.details.overallSavingsMs > 50,
    )
    .map((a: any) => ({
      title: a.title,
      description: String(a.description ?? '')
        // Strip the markdown links PSI embeds in descriptions.
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim(),
      savingsMs: a.details.overallSavingsMs,
      displayValue: a.displayValue ?? '',
    }))
    .sort((a, b) => b.savingsMs - a.savingsMs)
    .slice(0, 6);

  return {
    finalUrl: lh.finalUrl ?? lh.requestedUrl ?? '',
    strategy,
    scores,
    metrics,
    opportunities,
    hasFieldData,
  };
}

/* ------------------------------------------------------------------ render */

const RATING_CLASS: Record<Rating, string> = {
  good: 'text-brand-700 bg-brand-50 border-brand-200',
  average: 'text-[#9a6b1f] bg-amber-50 border-amber-200',
  poor: 'text-[#b3402f] bg-red-50 border-red-200',
  none: 'text-ink-500 bg-ink-50 border-ink-200',
};

const DIAL_STROKE: Record<Rating, string> = {
  good: 'var(--color-brand-600)',
  average: '#9a6b1f',
  poor: '#b3402f',
  none: 'var(--color-ink-300)',
};

function dial(score: number | null, label: string): string {
  const pct = score === null ? 0 : Math.round(score * 100);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const rating = scoreRating(score);
  return `
    <div class="flex flex-col items-center gap-2 text-center">
      <div class="relative">
        <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
          <circle cx="38" cy="38" r="${r}" fill="none" stroke="var(--color-ink-200)" stroke-width="6"/>
          <circle cx="38" cy="38" r="${r}" fill="none" stroke="${DIAL_STROKE[rating]}"
            stroke-width="6" stroke-linecap="round"
            stroke-dasharray="${dash} ${circ}" transform="rotate(-90 38 38)"/>
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-xl font-semibold text-ink-900">
          ${score === null ? '—' : pct}
        </span>
      </div>
      <span class="text-sm font-medium text-ink-700">${label}</span>
      <span class="sr-only">${label}: ${score === null ? 'no data' : `${pct} out of 100`}</span>
    </div>`;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

function renderReport(r: Report): string {
  const verdict = (() => {
    const perf = r.scores.find((s) => s.id === 'performance')?.score ?? null;
    if (perf === null) return 'We could not score this page.';
    const pct = Math.round(perf * 100);
    if (pct >= 90)
      return `This page scores ${pct}/100. It is already fast — the wins left are in conversion and technical SEO.`;
    if (pct >= 50)
      return `This page scores ${pct}/100. There is meaningful speed being left on the table, and it is fixable.`;
    return `This page scores ${pct}/100. Visitors on mobile are very likely leaving before it finishes loading.`;
  })();

  return `
    <div class="reveal">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p class="eyebrow mb-2">Report</p>
          <h2 class="text-2xl sm:text-3xl">${esc(r.finalUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</h2>
        </div>
        <span class="pill">${r.strategy === 'mobile' ? 'Mobile' : 'Desktop'}</span>
      </div>

      <p class="mt-4 max-w-2xl text-lg text-ink-600">${esc(verdict)}</p>

      <div class="card mt-8">
        <h3 class="text-base font-semibold text-ink-900">Lighthouse scores</h3>
        <div class="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          ${r.scores.map((s) => dial(s.score, s.label)).join('')}
        </div>
      </div>

      <div class="mt-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-base font-semibold text-ink-900">Core Web Vitals</h3>
          ${
            /* Only worth saying when it is good news. The absence of field data
               is a fact about the site's traffic, not about the site, and
               announcing it just undermines the numbers below. */
            r.hasFieldData
              ? '<span class="pill pill-brand">Real user data (28 days)</span>'
              : ''
          }
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          ${r.metrics
            .map(
              (m) => `
            <div class="card">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium text-ink-700">${esc(m.label)}</p>
                <span class="metric-help">
                  <button type="button" class="metric-help-btn"
                          aria-label="What ${esc(m.label)} means"
                          aria-describedby="help-${m.key}">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round"
                         stroke-linejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                    </svg>
                  </button>
                  <span id="help-${m.key}" role="tooltip" class="metric-help-text">${esc(m.help)}</span>
                </span>
              </div>
              <!-- Value and rating share a line rather than sitting at opposite
                   ends of the card. At a quarter of the width there is no room
                   to push a pill to the right of a three-word metric name. -->
              <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                <p class="text-2xl font-semibold text-ink-900">${esc(m.display)}</p>
                <span class="pill border ${RATING_CLASS[m.rating]}">${RATING_TEXT[m.rating]}</span>
              </div>
            </div>`,
            )
            .join('')}
        </div>
      </div>

      ${
        r.opportunities.length
          ? `<div class="mt-6">
              <h3 class="text-base font-semibold text-ink-900">What needs fixing</h3>
              <p class="mt-1 text-sm text-ink-500">These are the biggest issues we found on your website.</p>
              <ul class="mt-4 space-y-3">
                ${r.opportunities
                  .map(
                    (o) => `
                  <li class="card">
                    <p class="font-medium text-ink-900">${esc(o.title)}</p>
                    <p class="mt-2 text-sm leading-relaxed text-ink-600">${esc(o.description)}</p>
                  </li>`,
                  )
                  .join('')}
              </ul>
            </div>`
          : ''
      }

${ctaPanel(r)}
    </div>`;
}

/* --------------------------------------------------------------- lead CTA */

/**
 * The panel that closes a report.
 *
 * When the report found problems it runs three states without ever leaving the
 * page: the pitch, a short contact form, and a confirmation. When it found none
 * it is a single state with a plain link to /contact — there is no report
 * worth sending, so asking for contact details would be friction for nothing.
 *
 * The report itself is only transmitted once, on submit, together with the
 * contact details — so one enquiry produces one message rather than two, and
 * a visitor who abandons halfway does not generate an unreachable lead.
 */
type LeadField = { name: string; label: string; type: string; autocomplete: string; required: boolean; hint?: string };

const LEAD_FIELDS: LeadField[] = [
  { name: 'name', label: 'Name', type: 'text', autocomplete: 'name', required: true },
  { name: 'email', label: 'Email address', type: 'email', autocomplete: 'email', required: true },
  {
    name: 'phone',
    label: 'Phone number',
    type: 'tel',
    autocomplete: 'tel',
    required: false,
    hint: 'Optional',
  },
];

/**
 * Whether the report actually surfaced anything wrong.
 *
 * Deliberately tied to what the page displays: the "What needs fixing" list and
 * the Core Web Vitals ratings. The performance score is included as a guard, so
 * a genuinely slow page cannot be called healthy just because PageSpeed happened
 * to list no single opportunity worth more than 50ms.
 */
function hasIssues(r: Report): boolean {
  if (r.opportunities.length > 0) return true;
  if (r.metrics.some((m) => m.rating === 'poor' || m.rating === 'average')) return true;
  const performance = r.scores.find((s) => s.id === 'performance')?.score;
  return typeof performance === 'number' && performance < 0.9;
}

/** Wrapper is rendered once; only its contents are swapped between states. */
function ctaPanel(r: Report): string {
  return `
      <div
        class="mt-10 rounded-2xl bg-brand-800 px-6 py-10 sm:px-10 sm:py-12"
        data-cta
      >
        <div data-cta-body>${hasIssues(r) ? ctaIntro() : ctaHealthy(r)}</div>
      </div>`;
}

/**
 * Clean report. There is nothing to send and nothing to fix, so this variant
 * skips the lead-capture flow entirely and links straight to /contact. The
 * analyzed URL rides along to prefill the website field.
 */
function ctaHealthy(r: Report): string {
  return `
    <h3 class="text-2xl text-white sm:text-3xl">Your website looks good</h3>
    <p class="mt-3 max-w-2xl leading-relaxed text-brand-100">
      No major issues were found in this analysis. If you want us to take a
      deeper look for hidden performance, SEO, or technical issues &#8212; or
      need ongoing website monitoring and maintenance &#8212; we&#8217;re here
      to help.
    </p>
    <a
      href="/contact?site=${encodeURIComponent(r.finalUrl)}"
      class="btn mt-7 bg-white text-brand-800 hover:bg-brand-50"
    >
      Talk to Us
    </a>`;
}

function ctaIntro(): string {
  return `
    <p class="text-sm font-medium text-brand-200">
      We found several issues with your website
    </p>
    <h3 class="mt-2 text-2xl text-white sm:text-3xl">
      Want us to take a closer look?
    </h3>
    <p class="mt-3 max-w-xl leading-relaxed text-brand-100">
      Send us this report and we&#8217;ll do a deeper analysis of your website
      and recommend what should be fixed first.
    </p>
    <button
      type="button"
      data-cta-start
      class="btn mt-7 bg-white text-brand-800 hover:bg-brand-50"
    >
      Send Report
    </button>`;
}

function ctaForm(): string {
  const fields = LEAD_FIELDS.map(
    (f) => `
      <div>
        <label for="lead-${f.name}" class="block text-sm font-medium text-white">
          ${f.label}${f.hint ? ` <span class="font-normal text-brand-300">(${f.hint})</span>` : ''}
        </label>
        <input
          type="${f.type}"
          id="lead-${f.name}"
          name="${f.name}"
          autocomplete="${f.autocomplete}"
          ${f.required ? 'required' : ''}
          aria-describedby="lead-${f.name}-error"
          class="field mt-1.5"
        />
        <p id="lead-${f.name}-error" class="mt-1.5 text-xs text-red-200" data-field-error hidden></p>
      </div>`,
  ).join('');

  return `
    <h3 tabindex="-1" data-cta-focus class="text-2xl text-white sm:text-3xl">
      Report sent successfully
    </h3>
    <p class="mt-3 text-brand-100">How would you like us to reach you?</p>

    <form data-cta-form class="mt-7 max-w-3xl" novalidate>
      <div class="grid gap-5 sm:grid-cols-3">${fields}</div>

      <!-- Honeypot. Bots fill it; people never see it. -->
      <div class="hidden" aria-hidden="true">
        <label for="lead-company">Leave this empty</label>
        <input type="text" id="lead-company" name="_gotcha" tabindex="-1" />
      </div>

      <p class="mt-5 text-sm text-red-200" data-cta-error role="alert" hidden></p>

      <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="submit"
          data-cta-submit
          class="btn bg-white text-brand-800 hover:bg-brand-50"
        >
          Submit
        </button>
        <p class="text-sm text-brand-200">
          We&#8217;ll use your details only to discuss your website analysis.
        </p>
      </div>
    </form>`;
}

function ctaDone(): string {
  return `
    <h3 tabindex="-1" data-cta-focus class="text-2xl text-white sm:text-3xl">
      Thanks &#8212; we have your details
    </h3>
    <p class="mt-3 max-w-xl leading-relaxed text-brand-100">
      Your report is with our team. We&#8217;ll review it and come back to you
      with what we would fix first, and what it would take.
    </p>`;
}

/**
 * The report, flattened to something readable in an inbox. This is what makes
 * the enquiry actionable — without it the lead is just a name and a URL.
 */
function reportSummary(r: Report): string {
  const lines = [
    `Website: ${r.finalUrl}`,
    `Tested as: ${r.strategy === 'mobile' ? 'Mobile' : 'Desktop'}`,
    `Data source: ${r.hasFieldData ? 'Real user data (28 days)' : 'Lab data'}`,
    '',
    'Scores',
    ...r.scores.map(
      (s) => `  ${s.label}: ${s.score === null ? 'no data' : Math.round(s.score * 100)}/100`,
    ),
    '',
    'Core Web Vitals',
    ...r.metrics.map((m) => `  ${m.key} ${m.display} (${RATING_TEXT[m.rating]})`),
  ];

  if (r.opportunities.length) {
    lines.push('', 'Opportunities');
    for (const o of r.opportunities) {
      lines.push(`  ${o.title} — saves ~${fmtMs(o.savingsMs)}`);
    }
  }

  return lines.join('\n');
}

/**
 * Swap the panel contents, play the fade, and move focus to the new heading so
 * the change is announced rather than silently replacing what was under the
 * pointer.
 */
function setCtaState(panel: HTMLElement, html: string): void {
  const body = panel.querySelector<HTMLElement>('[data-cta-body]');
  if (!body) return;
  body.innerHTML = html;
  body.classList.remove('analyzer-fade');
  // Reading offsetWidth restarts the animation on a re-render.
  void body.offsetWidth;
  body.classList.add('analyzer-fade');
  body.querySelector<HTMLElement>('[data-cta-focus]')?.focus();
}

function wireCta(mount: HTMLElement, report: Report): void {
  const panel = mount.querySelector<HTMLElement>('[data-cta]');
  if (!panel) return;

  /* Read from the mount rather than importing SITE: consts.ts derives
     PRIMARY_SERVICES with a .filter() at module scope, which rollup cannot
     prove is side-effect free, so importing anything from it would drag the
     entire service catalogue into this bundle. */
  const endpoint = mount.dataset.formEndpoint ?? '';

  panel.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-cta-start]')) {
      setCtaState(panel, ctaForm());
    }
  });

  panel.addEventListener('submit', (event) => {
    const form = (event.target as HTMLElement).closest<HTMLFormElement>('[data-cta-form]');
    if (!form) return;
    event.preventDefault();
    void submitLead(panel, form, report, endpoint);
  });

  // Clear a field's error as soon as the visitor starts correcting it.
  panel.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;
    if (!input.name) return;
    const error = panel.querySelector<HTMLElement>(`#lead-${input.name}-error`);
    if (error && !error.hidden) {
      error.hidden = true;
      error.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  });
}

/** Uses the browser's own ValidityState rather than a hand-rolled email regex. */
function validateLead(form: HTMLFormElement): HTMLInputElement | null {
  let firstInvalid: HTMLInputElement | null = null;

  for (const field of LEAD_FIELDS) {
    const input = form.elements.namedItem(field.name) as HTMLInputElement | null;
    const error = form.querySelector<HTMLElement>(`#lead-${field.name}-error`);
    if (!input || !error) continue;

    if (input.checkValidity()) {
      error.hidden = true;
      error.textContent = '';
      input.removeAttribute('aria-invalid');
      continue;
    }

    error.textContent = input.validity.valueMissing
      ? `${field.label} is required.`
      : `Enter a valid ${field.label.toLowerCase()}.`;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    if (!firstInvalid) firstInvalid = input;
  }

  return firstInvalid;
}

async function submitLead(
  panel: HTMLElement,
  form: HTMLFormElement,
  report: Report,
  endpoint: string,
): Promise<void> {
  const invalid = validateLead(form);
  if (invalid) {
    invalid.focus();
    return;
  }

  const button = form.querySelector<HTMLButtonElement>('[data-cta-submit]');
  const formError = form.querySelector<HTMLElement>('[data-cta-error]');
  const data = new FormData(form);

  if (formError) {
    formError.hidden = true;
    formError.textContent = '';
  }
  if (button) {
    button.disabled = true;
    button.textContent = 'Sending…';
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone') || 'Not provided',
        _gotcha: data.get('_gotcha'),
        _subject: `Analyzer report request — ${report.finalUrl}`,
        source: 'analyzer-report',
        website: report.finalUrl,
        report: reportSummary(report),
      }),
    });

    if (!res.ok) throw new Error(`Formspree returned ${res.status}`);

    setCtaState(panel, ctaDone());
    (window as any).gtag?.('event', 'analyzer_lead_submitted', {
      analyzed_url: report.finalUrl,
    });
  } catch {
    if (formError) {
      formError.textContent =
        'We could not send that just now. Please try again, or email us directly.';
      formError.hidden = false;
    }
    if (button) {
      button.disabled = false;
      button.textContent = 'Submit';
    }
  }
}

function renderError(message: string, url: string): string {
  return `
    <div class="card border-red-200 bg-red-50/40">
      <h2 class="text-xl">We could not analyze that page</h2>
      <p class="mt-2 text-ink-600">${esc(message)}</p>
      <p class="mt-3 text-sm text-ink-500">
        This usually means the address is unreachable from Google's servers, the
        site blocks automated requests, or the free API quota is temporarily
        exhausted. It does not necessarily mean anything is wrong with
        ${esc(url)}.
      </p>
      <div class="mt-5 flex flex-wrap gap-2">
        <a href="/analyze" class="btn btn-secondary">Try another address</a>
        <a href="/contact" class="btn btn-primary">Ask us to check it manually</a>
      </div>
    </div>`;
}

function renderLoading(url: string): string {
  return `
    <div class="card" role="status" aria-live="polite">
      <div class="flex items-center gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" class="animate-spin text-brand-600" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
        </svg>
        <p class="font-medium text-ink-900">Analyzing ${esc(url)}…</p>
      </div>
      <p class="mt-3 text-sm text-ink-500">
        We are loading the page the way a real visitor on a mid-range phone would,
        then checking it against Google's own field data. This takes 20–40 seconds.
      </p>
    </div>`;
}

/* ------------------------------------------------------------------- boot */

function boot() {
  const mount = $('#analyzer-result');
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const rawUrl = params.get('url');
  if (!rawUrl) return;

  const url = normalizeUrl(rawUrl);
  const form = $<HTMLFormElement>('#analyze-page-form');
  const input = form?.querySelector<HTMLInputElement>('input[name="url"]');
  if (input && rawUrl) input.value = rawUrl;

  if (!url) {
    mount.innerHTML = renderError(INVALID_MESSAGE, rawUrl);
    return;
  }

  const strategy: Strategy = params.get('strategy') === 'desktop' ? 'desktop' : 'mobile';

  mount.innerHTML = renderLoading(url);
  mount.scrollIntoView({ behavior: 'smooth', block: 'start' });

  runAnalysis(url, strategy)
    .then((report) => {
      mount.innerHTML = renderReport(report);
      wireCta(mount, report);
      // Report completion is the conversion event worth optimising against.
      (window as any).gtag?.('event', 'analyzer_report_generated', {
        analyzed_url: report.finalUrl,
        strategy: report.strategy,
        performance_score: report.scores.find((s) => s.id === 'performance')?.score,
      });
    })
    .catch((err: Error) => {
      mount.innerHTML = renderError(err.message, url);
      (window as any).gtag?.('event', 'analyzer_error', { message: err.message });
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
