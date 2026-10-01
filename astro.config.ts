import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import { readdirSync, readFileSync } from 'node:fs';
import { resolveSiteUrl } from './src/config/siteUrl';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_');
const site = resolveSiteUrl(process.env.PUBLIC_SITE_URL ?? env.PUBLIC_SITE_URL);

// Pages that should never appear in the sitemap.
const excluded = ['/thank-you/', '/404/'];

// Insights marked `noindex: true` in frontmatter are kept out of the sitemap.
function noindexInsightPaths(): string[] {
  const dir = './src/content/insights';
  try {
    return readdirSync(dir)
      .filter((f) => /\.(md|mdx)$/.test(f))
      .flatMap((f) => {
        const text = readFileSync(`${dir}/${f}`, 'utf8');
        if (!/^noindex:\s*true\s*$/m.test(text)) return [];
        const slug = text.match(/^slug:\s*['"]?([^'"\r\n]+)['"]?\s*$/m)?.[1] ?? f.replace(/\.(md|mdx)$/, '');
        return [`/insights/${slug}/`];
      });
  } catch {
    return [];
  }
}
const excludedPaths = [...excluded, ...noindexInsightPaths()];

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !excludedPaths.some((path) => page.endsWith(path)),
    }),
  ],
  image: { layout: 'constrained' },
  devToolbar: { enabled: false },
});
