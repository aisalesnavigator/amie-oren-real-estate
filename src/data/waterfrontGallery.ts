/**
 * Overall `/waterfront/` photo gallery: a broad, growing collection of Amie-owned waterfront photography,
 * built around one convention: for every featured lake, one SUNRISE and one SUNSET photo.
 *
 * HOW TO ADD A PHOTO (no component or carousel changes are ever needed)
 *   A. A photo already in the rights register (`src/data/placeImages.ts`, e.g. a lake-section photo):
 *        { id: 'silver-lake-sunrise', placePhoto: 'silver-lake-rainbow-reflection', status: 'owned-approved', featured: true }
 *      The image file is NOT copied. The caption, alt text, credit and moment come from the register, so the
 *      photo is described identically everywhere.
 *   B. A gallery-only photo: save it in `src/assets/waterfront/` (for example `bostwick-lake-sunrise.jpg`) and add
 *        { id: 'bostwick-lake-sunrise', file: 'bostwick-lake-sunrise.jpg', lake: 'Bostwick Lake', moment: 'sunrise',
 *          alt: 'What is actually in the photo (not just the caption).', credit: 'Amie Oren Real Estate',
 *          status: 'owned-approved' }
 *      The caption is derived as "<lake> <Moment>" ("Bostwick Lake Sunrise"); set `caption` only to override it.
 *   Then run `npm run build`. Astro makes the responsive sizes.
 *
 * HOW IT BEHAVES
 *   - There is NO maximum. Every approved entry becomes a slide; "Photo X of N" and the keyboard / button
 *     navigation come from the slide count.
 *   - With fewer than three approved photos the carousel is filled to a minimum of three slides with designed
 *     "photography to come" placeholders (each real photo replaces the next placeholder). From three approved
 *     photos up, only real photos are shown.
 *   - `featured` photos are shown first, then the rest in the order written here.
 *   - Only `owned-approved` and `licensed-approved` entries display. `pending-approval` entries are kept but hidden.
 *   - An approved entry whose image file is missing is skipped and reported as a warning during the build.
 *
 * Photo files must carry no EXIF/GPS metadata (a test checks this). Only owned or rights-cleared photography
 * belongs here. See docs/COMMUNITY_IMAGE_BRIEF.md.
 */
import type { PhotoMoment } from './placeImages';

export type GalleryApproval = 'owned-approved' | 'licensed-approved' | 'pending-approval';

export interface WaterfrontGalleryItem {
  /** Stable identifier (used for tests and anchors). */
  id: string;
  /** Rights status. Only `owned-approved` and `licensed-approved` photos are displayed. */
  status: GalleryApproval;
  /** Featured photos are shown first. */
  featured?: boolean;

  /** Option A: key of a photo in the rights register (`placeImageCredits`). Everything else is inherited. */
  placePhoto?: string;

  /** Option B (gallery-only photo): file name inside `src/assets/waterfront/`. */
  file?: string;
  /** Option B: lake or location name, for example "Bostwick Lake". */
  lake?: string;
  /** Option B: sunrise | sunset | other. Drives the derived caption. */
  moment?: PhotoMoment;
  /** Option B: alt text describing what is in the photo. */
  alt?: string;
  /** Option B: credit shown quietly beneath the caption, for example "Amie Oren Real Estate". */
  credit?: string;

  /** Optional override of the derived "<lake> <Moment>" caption. */
  caption?: string;
}

export const galleryItems: WaterfrontGalleryItem[] = [
  { id: 'silver-lake-sunrise', placePhoto: 'silver-lake-rainbow-reflection', status: 'owned-approved', featured: true },
];

/** Designed placeholders; each real photo replaces the next one, and none show once there are three real photos. */
export const galleryPlaceholders: { caption: string }[] = [
  { caption: 'Morning light on a Rockford-area lake' },
  { caption: 'Docks and shoreline through the seasons' },
  { caption: 'Evening on the water' },
];

export const galleryHeading = 'A closer look at life on the water.';
export const galleryLede =
  'Photography from the lakes I know. More of my own waterfront photos will appear here as they’re added.';
