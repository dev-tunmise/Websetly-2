/**
 * Client testimonials.
 *
 * ⚠️ INTENTIONALLY EMPTY — do not populate with invented quotes.
 *
 * The previous websetly.com had no testimonials anywhere on the site, so there
 * was nothing to migrate. Fabricating attributed quotes would be inventing
 * reviews from real-sounding people, so the section instead hides itself while
 * this array is empty. Add real, permissioned quotes and it appears
 * automatically on the homepage — no template changes needed.
 *
 * Ask each client for: the sentence they would say to a peer, their name, role,
 * company, and written permission to publish. A quote naming a specific
 * measured outcome ("our LCP went from 4.8s to 1.9s") is worth ten generic ones.
 */

export type Testimonial = {
  /** The quote itself, without surrounding quotation marks. */
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Optional headshot in src/assets/. */
  avatar?: string;
  /** Link to the matching case study, when one exists. */
  caseStudy?: string;
};

export const TESTIMONIALS: Testimonial[] = [];
