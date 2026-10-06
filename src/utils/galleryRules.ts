import type { WaterfrontGalleryItem } from '../data/waterfrontGallery';
import type { PhotoMoment, PlaceImageCredit } from '../data/placeImages';
import { photoCaption, placeName } from './photoCaption';

/**
 * The presentation threshold: below this many real photos the carousel is padded with designed placeholders
 * so it never looks empty. It is NOT a maximum; there is no upper limit on real photos.
 */
export const MIN_SLIDES = 3;

export type GalleryMode = 'empty' | 'partial' | 'full';

/** Only rights-cleared entries are ever displayed. */
export const isApproved = (status: WaterfrontGalleryItem['status']) =>
  status === 'owned-approved' || status === 'licensed-approved';

/** 0 real photos: all placeholders; fewer than MIN_SLIDES: photos plus placeholders; otherwise real photos only. */
export function galleryMode(realCount: number): GalleryMode {
  if (realCount === 0) return 'empty';
  return realCount < MIN_SLIDES ? 'partial' : 'full';
}

/** The placeholders to show after the real photos (each real photo replaces the next placeholder). */
export function fillerPlaceholders<T>(realCount: number, pool: T[], min = MIN_SLIDES): T[] {
  const needed = Math.max(0, min - realCount);
  return pool.slice(realCount, realCount + needed);
}

/** Featured first, otherwise the order written in the data file. */
export function orderGallery<T extends { featured?: boolean }>(items: T[]): T[] {
  return [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)];
}

export interface ResolvedGalleryMeta {
  id: string;
  featured: boolean;
  /** Where the image file comes from: a rights-register key, or a file in src/assets/waterfront/. */
  source: { kind: 'place'; stem: string } | { kind: 'gallery'; file: string };
  lake: string;
  moment: PhotoMoment;
  caption: string;
  alt: string;
  credit: string;
}

/**
 * Turns a gallery entry into display metadata. A `placePhoto` entry inherits from the rights register;
 * a gallery-only entry must supply file, lake, alt and credit. Returns undefined when incomplete.
 */
export function resolveGalleryMeta(
  item: WaterfrontGalleryItem,
  register: Record<string, PlaceImageCredit>,
): ResolvedGalleryMeta | undefined {
  const featured = Boolean(item.featured);
  if (item.placePhoto) {
    const entry = register[item.placePhoto];
    if (!entry) return undefined;
    const lake = placeName(entry.slug) ?? entry.slug;
    return {
      id: item.id,
      featured,
      source: { kind: 'place', stem: item.placePhoto },
      lake,
      moment: entry.moment,
      caption: photoCaption({ place: lake, moment: entry.moment, caption: item.caption ?? entry.caption }),
      alt: item.alt ?? entry.alt,
      credit: item.credit ?? entry.credit,
    };
  }
  if (!item.file || !item.lake || !item.alt || !item.credit) return undefined;
  const moment = item.moment ?? 'other';
  return {
    id: item.id,
    featured,
    source: { kind: 'gallery', file: item.file },
    lake: item.lake,
    moment,
    caption: photoCaption({ place: item.lake, moment, caption: item.caption }),
    alt: item.alt,
    credit: item.credit,
  };
}
