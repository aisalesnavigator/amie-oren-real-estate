import { resolveSiteUrl } from './siteUrl';

/**
 * Central business + site configuration.
 * Anything optional is left undefined until verified real information exists.
 * Never invent values here (phone, license, address, social profiles, ...).
 */

/** Current Formspree form. A form endpoint is public by design - it is not a secret. */
const DEFAULT_FORM_ENDPOINT = 'https://formspree.io/f/mnpnylyj';

/**
 * Endpoint resolution:
 *  - variable unset            -> default endpoint above
 *  - variable set to a URL     -> that URL
 *  - variable set but empty    -> endpoint disabled; forms fall back to email (mailto)
 */
function endpoint(value: string | undefined, fallback: string | undefined): string | undefined {
  if (value === undefined) return fallback;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

const formEndpoint = endpoint(import.meta.env.PUBLIC_FORM_ENDPOINT, DEFAULT_FORM_ENDPOINT);

export const site = {
  name: 'Amie Oren',
  brand: 'Amie Oren Real Estate Professional',
  professionalTitle: 'Real Estate Professional',
  brokerage: 'Five Star Real Estate',
  contactEmail: 'Amieoren@yahoo.com',
  siteUrl: resolveSiteUrl(import.meta.env.PUBLIC_SITE_URL),
  tagline: 'Real estate guidance for the moments that matter.',
  /** Neutral third-person description for metadata and structured data. */
  description:
    'Amie Oren, a West Michigan real estate professional with more than 15 years of experience, brings local knowledge, attention to detail, and highly personal service to buyers and sellers navigating important moves.',
  /** First-person supporting line for the homepage hero. */
  heroIntro:
    'For more than 15 years, I’ve helped buyers and sellers throughout West Michigan navigate moves that are about far more than a transaction. I bring local knowledge, close attention to detail, and highly personal service to every decision.',

  /** Unknown until supplied. Leave undefined - the UI hides anything that is not set. */
  phone: undefined as string | undefined,
  office: undefined as
    | { street?: string; city?: string; region?: string; postalCode?: string }
    | undefined,
  license: undefined as string | undefined,
  /** Required brokerage / fair-housing / state disclosures, once confirmed with the brokerage. */
  legalNotice: undefined as string | undefined,

  socialProfiles: [] as { label: string; url: string }[],

  /** Third-party review profiles Amie wants to link to (Google, Zillow, ...). */
  reviewLinks: [] as { label: string; url: string }[],

  serviceAreas: [
    { name: 'Rockford', href: '/communities/rockford/' },
    { name: 'Ada', href: '/communities/ada/' },
    { name: 'East Grand Rapids', href: '/communities/east-grand-rapids/' },
    { name: 'Cascade', href: '/communities/cascade/' },
    { name: 'Forest Hills', href: '/communities/forest-hills/' },
  ],
  regionName: 'West Michigan',

  forms: {
    contact: formEndpoint,
    referral: formEndpoint,
    search: formEndpoint,
    review: endpoint(import.meta.env.PUBLIC_REVIEW_FORM_ENDPOINT, formEndpoint),
  },
} as const;

export type Site = typeof site;
export const mailtoHref = (subject?: string) =>
  `mailto:${site.contactEmail}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
