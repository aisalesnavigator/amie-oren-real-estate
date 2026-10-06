import type { WaterfrontGalleryItem } from '../data/waterfrontGallery';

export type GalleryMode = 'empty' | 'few' | 'carousel';

/** Only rights-cleared entries are ever displayed. */
export const isApproved = (status: WaterfrontGalleryItem['status']) =>
  status === 'owned-approved' || status === 'licensed-approved';

/** 0 photos: designed placeholders; 1-2: calm static layout; 3+: carousel. */
export function galleryMode(count: number): GalleryMode {
  if (count === 0) return 'empty';
  return count < 3 ? 'few' : 'carousel';
}

/** Featured first, otherwise the order written in the data file. */
export function orderGallery<T extends { featured?: boolean }>(items: T[]): T[] {
  return [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)];
}
