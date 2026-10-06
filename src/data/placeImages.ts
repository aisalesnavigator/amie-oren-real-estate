/**
 * Rights register for place photography (communities and lakes).
 *
 * An image is shown ONLY when BOTH exist:
 *   1. a file in src/assets/places/ named "<slug>.jpg|jpeg|png|webp"  (e.g. rockford.jpg, silver-lake.jpg)
 *   2. an entry below documenting alt text, credit and license.
 * Otherwise a placeholder is shown. Never add an image without a documented, rights-safe source
 * (owned by Amie, commercially licensed, public domain, or an appropriate Creative Commons license).
 * See docs/COMMUNITY_IMAGE_BRIEF.md.
 */
export interface PlaceImageCredit {
  alt: string;
  /** Photographer / owner. */
  credit: string;
  /** e.g. "Owned by Amie Oren", "Licensed (Adobe Stock #...)", "CC BY 4.0", "Public domain". */
  license: string;
  sourceUrl?: string;
}

export const placeImageCredits: Record<string, PlaceImageCredit> = {
  // 'rockford': { alt: '...', credit: '...', license: '...', sourceUrl: '...' },
};
