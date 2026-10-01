import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.string() });

const insights = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/insights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(200),
      /** Optional override of the URL slug (defaults to the file name). */
      slug: z.string().optional(),
      publishedDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Amie Oren'),
      /** Set only when a named person has actually reviewed the article. */
      reviewedBy: z.string().optional(),
      reviewedDate: z.coerce.date().optional(),
      /** Community slug (see src/data/communities.ts), if the article is community-specific. */
      community: z.string().optional(),
      topics: z.array(z.string()).default([]),
      intent: z.enum(['sell', 'buy', 'waterfront', 'transition', 'community', 'general']).default('general'),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      /** Concise answer shown at the top of the article (AEO answer block). */
      summary: z.string(),
      sources: z
        .array(z.object({ title: z.string(), url: z.url(), publisher: z.string().optional(), note: z.string().optional() }))
        .default([]),
      faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
      relatedContent: z.array(link).default([]),
      noindex: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,json}', base: './src/content/reviews' }),
  schema: z.object({
    clientName: z.string(),
    displayName: z.string(),
    community: z.string().optional(),
    experienceType: z.enum(['seller', 'buyer', 'waterfront', 'move-up', 'downsizing', 'referral', 'other']),
    reviewText: z.string(),
    source: z.string().default('Direct client submission'),
    submittedDate: z.coerce.date(),
    publishedDate: z.coerce.date().optional(),
    /** Amie has confirmed this is a genuine client who really wrote this. */
    verified: z.boolean().default(false),
    /** The client has given explicit permission to publish. */
    permissionToPublish: z.boolean().default(false),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    /** Illustrative design-review content. NEVER shown on a normal production build. */
    sample: z.boolean().default(false),
  }),
});

export const collections = { insights, reviews };
