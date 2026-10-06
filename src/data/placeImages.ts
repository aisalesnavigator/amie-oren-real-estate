/**
 * Rights register for place photography (communities and lakes).
 *
 * An image is shown ONLY when BOTH exist:
 *   1. a file in src/assets/places/ whose name (without extension) is a key below, and
 *   2. the entry below, documenting alt text, credit, license/approval and which place it belongs to.
 * Otherwise the designed placeholder is shown. Never add an image without a documented, rights-safe
 * source (owned by Amie, commercially licensed, public domain, or an appropriate Creative Commons
 * license). See docs/COMMUNITY_IMAGE_BRIEF.md.
 *
 * NAMING: `<place-slug>-<subject>.jpg`, e.g. `silver-lake-rainbow-reflection.jpg`.
 *   - `slug` is the community or lake slug the photo belongs to (rockford, ada, ..., silver-lake, ...).
 *   - `role: 'primary'` is the lead photo for that place (used by community heroes and cards too, for a
 *     community slug); `role: 'secondary'` photos appear only in the lake drill-down section.
 *   - Lake photos are for the Rockford lake drill-down (`/waterfront/rockford-lakes/`) ONLY. They are
 *     intentionally not used as the `/waterfront/` hero and are not in `src/data/waterfrontGallery.ts`.
 */
export type PlaceImageApproval = 'owned-approved' | 'licensed' | 'public-domain' | 'creative-commons';

export interface PlaceImageCredit {
  /** Community or lake slug this photo belongs to. */
  slug: string;
  role: 'primary' | 'secondary';
  alt: string;
  /** Short credit shown on the photo ("Photo: ..."). */
  credit: string;
  /** Plain-language usage basis, e.g. "Owned by the site owner; approved for website use". */
  license: string;
  approval: PlaceImageApproval;
  /** When the owner approved or supplied it (YYYY-MM-DD). */
  approvedOn?: string;
  sourceUrl?: string;
  /** Aspect ratio of the display frame; defaults to 16 / 10. Cropping is centered. */
  ratio?: string;
}

const ownedApproved = {
  credit: 'Amie Oren Real Estate',
  license: 'Owned by the site owner; approved for use on this website',
  approval: 'owned-approved',
  approvedOn: '2026-10-06',
} as const;

export const placeImageCredits: Record<string, PlaceImageCredit> = {
  'silver-lake-rainbow-reflection': {
    slug: 'silver-lake',
    role: 'primary',
    alt: 'A rainbow arcs over Silver Lake, with lakefront homes along the far shore and the whole scene mirrored in calm water.',
    ratio: '5 / 4',
    ...ownedApproved,
  },
  'silver-lake-sunset-reflection': {
    slug: 'silver-lake',
    role: 'secondary',
    alt: 'A pink, violet and orange sunset sky reflected in still Silver Lake, seen from a sandy shoreline.',
    ...ownedApproved,
  },
  'lake-bella-vista-sunrise-reflection': {
    slug: 'lake-bella-vista',
    role: 'primary',
    alt: 'Sunrise on Lake Bella Vista, with trees and lakeside homes in silhouette and the clouds and golden light mirrored in still water.',
    ...ownedApproved,
  },
  'lake-bella-vista-sunset-reflection': {
    slug: 'lake-bella-vista',
    role: 'secondary',
    alt: 'A fiery orange sunset over Lake Bella Vista, with trees silhouetted along the shore and the glowing sky rippling across the water.',
    ...ownedApproved,
  },
};
