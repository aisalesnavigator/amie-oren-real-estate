import { getCollection, type CollectionEntry } from 'astro:content';

export type Review = CollectionEntry<'reviews'>;

/**
 * Sample (illustrative) reviews are shown ONLY when:
 *   - running the dev server (`npm run dev`), or
 *   - a build explicitly sets PUBLIC_SHOW_SAMPLE_REVIEWS=true (`npm run build:review`).
 * A normal `npm run build` can never include them.
 */
export const samplesEnabled: boolean =
  import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_SAMPLE_REVIEWS === 'true';

/** A review is real and publishable only if it is verified, permitted and not a draft. */
export function isPublishableReview(review: Review): boolean {
  const d = review.data;
  return d.verified === true && d.permissionToPublish === true && d.draft === false && d.sample === false;
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
