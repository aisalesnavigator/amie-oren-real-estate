import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { getInsights, insightHref } from '../utils/insights';

export async function GET(context: APIContext) {
  // Entries marked noindex (e.g. drafts awaiting review) are kept out of the public feed.
  const entries = (await getInsights()).filter((e) => !e.data.noindex);
  return rss({
    title: `${site.brand}: Insights`,
    description: 'Practical real estate guidance for West Michigan.',
    site: context.site ?? site.siteUrl,
    items: entries.map((e) => ({
      title: e.data.title,
      description: e.data.description,
      pubDate: e.data.publishedDate,
      link: insightHref(e),
    })),
  });
}
