/**
 * Overall `/waterfront/` photo gallery: a broad, growing collection of Amie-owned waterfront photography.
 *
 * HOW TO ADD A PHOTO
 *   1. Save the image in `src/assets/waterfront/` (any name; keep it descriptive, e.g. `myers-lake-dock-morning.jpg`).
 *   2. Add one entry to `galleryItems` below. A photo appears only when the file exists AND its
 *      `status` is an approved one. `pending-approval` entries are kept in the file but never shown.
 *   3. Run `npm run build`. Astro creates the responsive sizes; the carousel adapts to the count.
 *
 * HOW IT BEHAVES
 *   - 0 approved photos:  three designed "photography to come" slides (same carousel, so it looks intentional).
 *   - 1-2 approved photos: a calm static layout (no controls) with a short note that more are coming.
 *   - 3+ approved photos:  a swipeable, keyboard-operable carousel (no JavaScript library).
 *   - `featured` photos are shown first.
 *
 * SEPARATION RULE
 *   Lake-specific photos live with their lake in `src/data/placeImages.ts` (they appear only in the
 *   Rockford lake drill-down sections at `/waterfront/rockford-lakes/`). Do not repeat those photos here
 *   unless the owner explicitly approves it. This gallery is for the broader waterfront collection.
 *
 * Only owned, licensed or otherwise rights-cleared photography belongs here. See docs/COMMUNITY_IMAGE_BRIEF.md.
 */
export type GalleryApproval = 'owned-approved' | 'licensed-approved' | 'pending-approval';

export interface WaterfrontGalleryItem {
  /** Stable identifier (used for tests and anchors). */
  id: string;
  /** File name inside `src/assets/waterfront/`, for example `myers-lake-dock-morning.jpg`. */
  file: string;
  /** Lake or location label shown with the caption, for example "Myers Lake" or "Rockford area". */
  lake: string;
  /** Short caption in Amie's voice or neutral description. */
  caption: string;
  /** Meaningful alt text describing what is in the photo. */
  alt: string;
  /** Rights status. Only `owned-approved` and `licensed-approved` photos are displayed. */
  status: GalleryApproval;
  /** Featured photos are shown first. */
  featured?: boolean;
}

/** Intentionally empty until the owner approves photos for the overall gallery. */
export const galleryItems: WaterfrontGalleryItem[] = [];

/** Shown (as designed placeholders) only while there are no approved photos. */
export const galleryPlaceholders: { caption: string }[] = [
  { caption: 'Morning light on a Rockford-area lake' },
  { caption: 'Docks and shoreline through the seasons' },
  { caption: 'Evening on the water' },
];

export const galleryHeading = 'A closer look at life on the water.';
export const galleryLede =
  'Photography from the lakes I know. More of my own waterfront photos will appear here as they’re added.';
