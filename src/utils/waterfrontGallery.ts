import type { ImageMetadata } from 'astro';
import { placeImageCredits } from '../data/placeImages';
import { galleryItems, type WaterfrontGalleryItem } from '../data/waterfrontGallery';
import { isApproved, orderGallery, resolveGalleryMeta, type ResolvedGalleryMeta } from './galleryRules';
import { placeImageFiles } from './placeImages';

export { galleryMode, fillerPlaceholders, type GalleryMode } from './galleryRules';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/waterfront/*.{jpg,jpeg,png,webp}', { eager: true });
const galleryFiles = new Map(Object.entries(files).map(([path, mod]) => [path.replace(/^.*\//, ''), mod.default]));

export interface GallerySlide extends ResolvedGalleryMeta {
  src: ImageMetadata;
}

/**
 * Resolves approved entries to image files; featured first, otherwise in file order. There is no cap on the
 * number of slides. An approved entry that is incomplete or whose file is missing is skipped with a warning.
 */
export function getGallerySlides(items: WaterfrontGalleryItem[] = galleryItems): GallerySlide[] {
  const slides: GallerySlide[] = [];
  for (const item of items) {
    if (!isApproved(item.status)) continue;
    const meta = resolveGalleryMeta(item, placeImageCredits);
    const src = meta && (meta.source.kind === 'place' ? placeImageFiles.get(meta.source.stem) : galleryFiles.get(meta.source.file));
    if (!meta || !src) {
      console.warn(`[waterfront gallery] "${item.id}" is approved but incomplete or its image file is missing; it was skipped.`);
      continue;
    }
    slides.push({ ...meta, src });
  }
  return orderGallery(slides);
}
