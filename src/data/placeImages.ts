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
 * NAMING: `<place-slug>-<subject>.jpg`, e.g. `silver-lake-rainbow-reflection.jpg`. The file name is
 * for people; it is never shown. The visible caption comes from `slug` + `moment` (see below), so a file
 * does NOT need to be renamed or duplicated to be captioned "Silver Lake Sunrise".
 *   - `slug` is the community or lake slug the photo belongs to (rockford, ada, ..., silver-lake, ...).
 *   - `moment` is the time-of-day theme: 'sunrise' | 'sunset' | 'other'. The caption is derived as
 *     "<place name> <Moment>", e.g. "Silver Lake Sunrise". Set `caption` only to override it.
 *   - `role: 'primary'` is the lead photo for that place (used by community heroes and cards too, for a
 *     community slug); `role: 'secondary'` photos appear only in the lake drill-down section.
 *
 * LAKE PHOTOGRAPHY CONVENTION: every featured lake is ultimately shown with one sunrise and one sunset
 * photo (sunrise = primary, sunset = secondary). A test allows at most one of each per lake. Further lake
 * photos (aerials, docks, other light) use `moment: 'other'` with a `caption` and appear after the
 * sunrise/sunset pair. To add Bostwick Lake: add `bostwick-lake-<subject>.jpg` for each moment and two
 * entries below. No component changes are needed.
 *
 * WHERE LAKE PHOTOS APPEAR: in their Rockford lake drill-down section (`/waterfront/rockford-lakes/`) and,
 * only when an entry in `src/data/waterfrontGallery.ts` explicitly references them by key, in the overall
 * `/waterfront/` gallery. They are never the `/waterfront/` hero or used on community pages or the homepage.
 *
 * COMMUNITY PHOTOS: a photo registered against a COMMUNITY slug (e.g. `east-grand-rapids`) is that
 * community's own photography. Its primary is the community hero image and its community card image
 * (on /communities/ and the homepage). Community secondaries are registered for future use and are not
 * displayed anywhere yet. Reeds Lake is East Grand Rapids' lake, so its photos are registered here.
 *
 * PRIVACY: image files must carry no EXIF/GPS metadata (a test fails if they do). Strip it before adding:
 * `sharp(input).rotate().toFile(output)` removes metadata and applies the camera orientation.
 */
export type PlaceImageApproval = 'owned-approved' | 'licensed' | 'public-domain' | 'creative-commons';

/** Time-of-day theme of a photo; drives the visible caption. */
export type PhotoMoment = 'sunrise' | 'sunset' | 'other';

export interface PlaceImageCredit {
  /** Community or lake slug this photo belongs to. */
  slug: string;
  role: 'primary' | 'secondary';
  moment: PhotoMoment;
  /** Optional override of the derived caption ("<place name> <Moment>"). Rarely needed. */
  caption?: string;
  /** Describes what is actually in the photo; must not just repeat the caption. */
  alt: string;
  /** Credit shown quietly beneath the caption ("Photo: ..."). */
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
    moment: 'sunrise',
    alt: 'A rainbow arcs over Silver Lake, with lakefront homes along the far shore and the whole scene mirrored in calm water.',
    ratio: '5 / 4',
    ...ownedApproved,
  },
  'silver-lake-sunset-reflection': {
    slug: 'silver-lake',
    role: 'secondary',
    moment: 'sunset',
    alt: 'A pink, violet and orange sunset sky reflected in still Silver Lake, seen from a sandy shoreline.',
    ...ownedApproved,
  },
  'lake-bella-vista-sunrise-reflection': {
    slug: 'lake-bella-vista',
    role: 'primary',
    moment: 'sunrise',
    alt: 'Sunrise on Lake Bella Vista, with trees and lakeside homes in silhouette and the clouds and golden light mirrored in still water.',
    ...ownedApproved,
  },
  'silver-lake-aerial-autumn': {
    slug: 'silver-lake',
    role: 'secondary',
    moment: 'other',
    caption: 'Silver Lake from above',
    alt: 'Aerial view of Silver Lake in autumn: the oval lake ringed by homes along its shoreline, with orange, gold and green trees in the foreground under a clear sky.',
    // Very wide panorama (about 2.7:1): a wide frame keeps both ends of the lake.
    ratio: '5 / 2',
    ...ownedApproved,
    approvedOn: '2026-11-09',
  },
  'silver-lake-docks-golden-hour': {
    slug: 'silver-lake',
    role: 'secondary',
    moment: 'other',
    caption: 'Silver Lake at golden hour',
    alt: 'A low sun just above the tree line lights a streak across calm water, past a wooden dock and canopied boat lifts, under a wide sky of rippled clouds.',
    ratio: '4 / 3',
    ...ownedApproved,
    approvedOn: '2026-11-09',
  },
  'lake-bella-vista-sunset-reflection': {
    slug: 'lake-bella-vista',
    role: 'secondary',
    moment: 'sunset',
    alt: 'A fiery orange sunset over Lake Bella Vista, with trees silhouetted along the shore and the glowing sky rippling across the water.',
    ...ownedApproved,
  },
  'lake-bella-vista-aerial': {
    slug: 'lake-bella-vista',
    role: 'secondary',
    moment: 'other',
    caption: 'Lake Bella Vista from above',
    alt: 'Summer aerial view of Lake Bella Vista: turquoise water winding between wooded points, with lakeside homes, docks and boats along the shore.',
    ...ownedApproved,
    approvedOn: '2026-11-09',
  },
  // East Grand Rapids community photography (Reeds Lake).
  'east-grand-rapids-reeds-lake-aerial': {
    slug: 'east-grand-rapids',
    role: 'primary',
    moment: 'other',
    caption: 'Reeds Lake, East Grand Rapids',
    alt: 'Summer aerial view of Reeds Lake: blue water curving between dense green tree canopy, with lakeside homes and docks along the shore and distant city buildings on the horizon.',
    ...ownedApproved,
    approvedOn: '2026-11-09',
  },
  'east-grand-rapids-reeds-lake-titled-aerial': {
    // Has the words "REEDS LAKE" set into the image itself, so it is kept as a secondary and is not displayed.
    slug: 'east-grand-rapids',
    role: 'secondary',
    moment: 'other',
    caption: 'Reeds Lake',
    alt: 'Early-spring aerial view along Reeds Lake, with a lakeside path and lawns on the near shore, bare trees and homes on the far shore, and the words Reeds Lake set over the water.',
    ...ownedApproved,
    approvedOn: '2026-11-09',
  },
};
