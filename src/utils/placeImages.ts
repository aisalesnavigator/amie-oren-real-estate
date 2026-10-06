import type { ImageMetadata } from 'astro';
import { placeImageCredits, type PlaceImageCredit } from '../data/placeImages';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/places/*.{jpg,jpeg,png,webp}', { eager: true });

export interface PlaceImage {
  src: ImageMetadata;
  credit: PlaceImageCredit;
}

/** Returns a place image only when the file exists AND its rights are documented. */
export function getPlaceImage(slug: string): PlaceImage | undefined {
  const credit = placeImageCredits[slug];
  if (!credit) return undefined;
  const match = Object.entries(files).find(([path]) => new RegExp(`/${slug}[.](jpe?g|png|webp)$`, 'i').test(path));
  return match ? { src: match[1].default, credit } : undefined;
}
