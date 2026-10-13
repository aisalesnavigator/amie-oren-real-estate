import { getCollection, type CollectionEntry } from 'astro:content';
import { isReviewMode } from './reviewMode';

export type Review = CollectionEntry<'reviews'>;

/**
 * Review-only sample reviews (`sample: true`) are shown ONLY in review mode: the dev server
 * (`npm run dev`) or a deliberate `npm run build:review` (build mode `review`, see utils/reviewMode.ts).
 * A normal `npm run build` can never include them, whatever the build environment sets.
 *
 * This is separate from the public "illustrative examples" (`illustrative: true`), which are allowed in
 * production, clearly labeled, and shown only on the Client Experiences page.
 */
export const samplesEnabled: boolean = isReviewMode({ DEV: import.meta.env.DEV, MODE: import.meta.env.MODE });

/** A review is real and publishable only if it is verified, permitted and not a draft. */
export function isPublishableReview(review: Review): boolean {
  const d = review.data;
  return (
    d.verified === true && d.permissionToPublish === true && d.draft === false && d.sample === false && d.illustrative === false
  );
}

/**
 * A temporary, clearly labeled example (not a real client) shown on the Client Experiences page only,
 * while real client-submitted experiences are being collected. Remove one by deleting its file or
 * setting `draft: true`. Never counted as a real review and never used in structured data.
 */
export function isIllustrativeExample(review: Review): boolean {
  const d = review.data;
  return d.illustrative === true && d.draft === false && d.sample === false;
}

export async function getIllustrativeExamples(): Promise<Review[]> {
  const all = await getCollection('reviews');
  return all.filter(isIllustrativeExample).sort((a, b) => a.id.localeCompare(b.id));
}

export async function getVisibleReviews(): Promise<Review[]> {
  const all = await getCollection('reviews');
  const visible = all.filter((r) => isPublishableReview(r) || (samplesEnabled && r.data.sample));
  return visible.sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      (b.data.publishedDate ?? b.data.submittedDate).getTime() -
        (a.data.publishedDate ?? a.data.submittedDate).getTime(),
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
