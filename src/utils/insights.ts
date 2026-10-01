import { getCollection, type CollectionEntry } from 'astro:content';

export type Insight = CollectionEntry<'insights'>;

export const insightSlug = (entry: Insight): string => entry.data.slug ?? entry.id;
export const insightHref = (entry: Insight): string => `/insights/${insightSlug(entry)}/`;

export async function getInsights(): Promise<Insight[]> {
  const all = await getCollection('insights', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime());
}

export const formatDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
