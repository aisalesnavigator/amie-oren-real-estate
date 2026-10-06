import type { ImageMetadata } from 'astro';
import { placeImageCredits, type PlaceImageCredit } from '../data/placeImages';
import { photoCaption, placeName } from './photoCaption';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/places/*.{jpg,jpeg,png,webp}', { eager: true });

export interface PlaceImage {
  /** File name without extension (the key in the rights register). */
  stem: string;
  src: ImageMetadata;
  credit: PlaceImageCredit;
  /** Visible caption, for example "Silver Lake Sunrise". */
  caption: string;
}

const stemOf = (path: string) => path.replace(/^.*\//, '').replace(/\.(jpe?g|png|webp)$/i, '');

/** Every registered photo as { stem -> image file }, for code that references the register by key. */
export const placeImageFiles = new Map(Object.entries(files).map(([path, mod]) => [stemOf(path), mod.default]));

/**
 * Every place image for a slug, primary first. An image is returned only when the file exists AND its
 * rights entry exists in src/data/placeImages.ts.
 */
export function getPlaceImages(slug: string): PlaceImage[] {
  const found: PlaceImage[] = [];
  for (const [stem, src] of placeImageFiles) {
    const credit = placeImageCredits[stem];
    if (credit && credit.slug === slug) {
      const caption = photoCaption({ place: placeName(slug) ?? slug, moment: credit.moment, caption: credit.caption });
      found.push({ stem, src, credit, caption });
    }
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
