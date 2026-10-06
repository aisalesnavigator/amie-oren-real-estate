/**
 * Rockford-area lakes. Reusable data for the /waterfront/rockford-lakes/ hub; each entry can later
 * become its own page without restructuring.
 *
 * FACT DISCIPLINE: no depths, acreage, frontage statistics, public/private or motor designations,
 * association rules, taxes, home values, or inventory statistics are stated here. Add lake-specific
 * facts ONLY through `verifiedFacts`, each with a source (see docs/CONTENT_GUIDE.md).
 * Everything else is qualitative guidance that applies to inland-lake ownership.
 */
export interface LakeFact {
  label: string;
  value: string;
  /** Required: where this fact was verified, and when. */
  source: string;
}

export interface Lake {
  slug: string;
  name: string;
  /** Short description for cards and the jump list. */
  summary: string;
  /** Overall feel / setting (qualitative). */
  feel: string;
  housing: string[];
  buyerConsiderations: string[];
  sellerConsiderations: string[];
  waterLifestyle: string[];
  /** Amie's first-person note. Only personal, verifiable experience belongs here. */
  amieNote?: string;
  /** Verified, sourced lake-specific facts. Empty until verified. */
  verifiedFacts: LakeFact[];
  /** Caption for the (placeholder) lake photograph. */
  imageSubject: string;
  /** CTA label for the saved-search form. */
  ctaLabel: string;
}

const housingCommon = [
  'Waterfront housing on inland lakes commonly spans long-held cottages, updated year-round homes, and newer or rebuilt properties. Which of those you will see most depends on the part of the lake.',
  'Homes that are close to the water but not on it, sometimes with shared or deeded access, are part of the picture too. What actually comes with access should always be confirmed.',
];

const buyerCommon = (n: string) => [
  `Which part of ${n} fits how you want to use the water, and what does the frontage there actually look like?`,
  'What do the shoreline, seawall, dock, and any lifts look like, and who is responsible for them?',
  'Is the home set up for year-round living, or primarily seasonal use?',
  'What water access, rights, or easements transfer with the property? Confirm in writing.',
  'Which rules or regulations could affect what you want to do? Ask the relevant authority or a qualified professional.',
];

const sellerCommon = (n: string) => [
  `Which parts of the setting on ${n} will matter most to buyers: the view, the frontage, the dock, or the outdoor living spaces?`,
  'Shoreline, seawall, and dock condition are worth understanding before you list, along with any documentation.',
  'Presenting the property in the season it looks best, and being ready to talk about the seasons it doesn’t, builds buyer confidence.',
  'Timing the sale around your next move deserves a plan early, since quality lake properties can draw attention quickly.',
];

const waterCommon = [
  'Think through how you want to spend time on the water: swimming, boating, fishing, quiet mornings, or entertaining.',
  'Consider how the lake feels across seasons, including summer activity and the quieter months.',
  'Ask about anything that affects how the water is used, and confirm it with the proper authority rather than relying on listing remarks.',
];

const build = (
  slug: string,
  name: string,
  summary: string,
  feel: string,
  imageSubject: string,
  extra: Partial<Pick<Lake, 'amieNote'>> = {},
): Lake => ({
  slug,
  name,
  summary,
  feel,
  housing: housingCommon,
  buyerConsiderations: buyerCommon(name),
  sellerConsiderations: sellerCommon(name),
  waterLifestyle: waterCommon,
  verifiedFacts: [],
  imageSubject,
  ctaLabel: `Send me ${name} homes`,
  ...extra,
});

export const lakes: Lake[] = [
  build(
    'bostwick-lake',
    'Bostwick Lake',
    'One of the Rockford-area lakes I help buyers and sellers with.',
    'I’m glad to talk through what different parts of Bostwick Lake feel like and which fit what you have in mind. This resource will grow as lake-specific details are confirmed.',
    'Bostwick Lake shoreline',
  ),
  build(
    'silver-lake',
    'Silver Lake',
    'A Rockford-area lake I know firsthand. It has been my home for the last eight years.',
    'I’ve lived on Silver Lake for the last eight years, so I can speak to what everyday lake life is like here, beyond what a listing shows.',
    'Silver Lake at sunrise',
    {
      amieNote:
        'I’ve lived on Silver Lake for the last eight years. Ask me what I’d want to know before buying here.',
    },
  ),
  build(
    'lake-bella-vista',
    'Lake Bella Vista',
    'A Rockford-area lake where I lived for seven years.',
    'I lived on Lake Bella Vista for seven years, and I remember well what mattered once the boxes were unpacked.',
    'Lake Bella Vista shoreline',
    {
      amieNote:
        'I lived on Lake Bella Vista for seven years. I’m happy to share what I learned living there, as well as what I’ve seen as a real estate professional.',
    },
  ),
  build(
    'myers-lake',
    'Myers Lake',
    'A Rockford-area lake I help buyers and sellers with.',
    'I’m glad to help you understand how Myers Lake compares with the other Rockford-area lakes for the way you want to live.',
    'Myers Lake shoreline',
  ),
  build(
    'brower-lake',
    'Brower Lake',
    'A Rockford-area lake I help buyers and sellers with.',
    'I’m glad to help you understand how Brower Lake compares with the other Rockford-area lakes for the way you want to live.',
    'Brower Lake shoreline',
  ),
];

export const getLake = (slug: string): Lake | undefined => lakes.find((l) => l.slug === slug);
