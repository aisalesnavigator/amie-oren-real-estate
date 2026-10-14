import { getCollection, type CollectionEntry } from 'astro:content';
import { isReviewMode } from './reviewMode';

export type Review = CollectionEntry<'reviews'>;

/**
 * Review-only sample reviews (`sample: true`) are shown ONLY in review mode: the dev server
 * (`npm run dev`) or a deliberate `npm run build:review` (build mode `review`, see utils/reviewMode.ts).
 * A normal `npm run build` can never include them, whatever the build environment sets.
 */
export const samplesEnabled: boolean = isReviewMode({ DEV: import.meta.env.DEV, MODE: import.meta.env.MODE });

/** A review is real and publishable only if it is verified, permitted and not a draft. */
export function isPublishableReview(review: Review): boolean {
  const d = review.data;
  return (
    d.verified === true && d.permissionToPublish === true && d.draft === false && d.sample === false
  );
}

export async function getVisibleReviews(): Promise<Review[]> {
  const all = await getCollection('reviews');
  const visible = all.filter((r) => isPublishableReview(r) || (samplesEnabled && r.data.sample));
  // Newest first; reviews published together keep their file order (client-1, client-2, ...).
  return visible.sort(
    (a, b) =>
      (b.data.publishedDate ?? b.data.submittedDate).getTime() - (a.data.publishedDate ?? a.data.submittedDate).getTime() ||
      a.id.localeCompare(b.id),
  );
}

export const experienceLabels: Record<Review['data']['experienceType'], string> = {
  seller: 'Seller',
  buyer: 'Buyer',
  waterfront: 'Waterfront',
  'move-up': 'Move-up buyer',
  downsizing: 'Downsizing / transition',
  referral: 'Referral client',
  other: 'Client experience',
};
