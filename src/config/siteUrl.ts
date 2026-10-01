/**
 * Single source of truth for the canonical site URL.
 * Used by astro.config.ts (sitemap, canonical) and src/config/site.ts.
 * Set PUBLIC_SITE_URL in the environment to override.
 */
export const DEFAULT_SITE_URL = 'https://amieorenrealestate.com';

export function resolveSiteUrl(value: string | undefined): string {
  const raw = (value ?? '').trim();
  return (raw || DEFAULT_SITE_URL).replace(/\/+$/, '');
}
