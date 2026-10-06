import type { ImageMetadata } from 'astro';
import { placeImageCredits, type PlaceImageCredit } from '../data/placeImages';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/places/*.{jpg,jpeg,png,webp}', { eager: true });

export interface PlaceImage {
  /** File name without extension (the key in the rights register). */
  stem: string;
  src: ImageMetadata;
  credit: PlaceImageCredit;
}

const stemOf = (path: string) => path.replace(/^.*\//, '').replace(/\.(jpe?g|png|webp)$/i, '');

/**
 * Every place image for a slug, primary first. An image is returned only when the file exists AND its
 * rights entry exists in src/data/placeImages.ts.
 */
export function getPlaceImages(slug: string): PlaceImage[] {
  const found: PlaceImage[] = [];
  for (const [path, mod] of Object.entries(files)) {
    const stem = stemOf(path);
    const credit = placeImageCredits[stem];
    if (credit && credit.slug === slug) found.push({ stem, src: mod.default, credit });
  }
  return found.sort(
    (a, b) => Number(b.credit.role === 'primary') - Number(a.credit.role === 'primary') || a.stem.localeCompare(b.stem),
  );
}

/** The primary photo for a place, or undefined (the designed placeholder is shown instead). */
export function getPlaceImage(slug: string): PlaceImage | undefined {
  return getPlaceImages(slug).find((i) => i.credit.role === 'primary');
}

/** Secondary photos for a place (lake drill-down sections only). */
export function getSecondaryPlaceImages(slug: string): PlaceImage[] {
  return getPlaceImages(slug).filter((i) => i.credit.role === 'secondary');
}
