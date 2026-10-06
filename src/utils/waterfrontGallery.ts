import type { ImageMetadata } from 'astro';
import { galleryItems, type WaterfrontGalleryItem } from '../data/waterfrontGallery';
import { isApproved, orderGallery } from './galleryRules';

export { galleryMode, type GalleryMode } from './galleryRules';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/waterfront/*.{jpg,jpeg,png,webp}', { eager: true });

export interface GallerySlide extends WaterfrontGalleryItem {
  src: ImageMetadata;
}

/** Resolves approved entries to image files; featured first, otherwise in file order. */
export function getGallerySlides(items: WaterfrontGalleryItem[] = galleryItems): GallerySlide[] {
  const byName = new Map(Object.entries(files).map(([path, mod]) => [path.replace(/^.*\//, ''), mod.default]));
  const slides: GallerySlide[] = [];
  for (const item of items) {
    const src = byName.get(item.file);
    if (src && isApproved(item.status)) slides.push({ ...item, src });
  }
  return orderGallery(slides);
}
