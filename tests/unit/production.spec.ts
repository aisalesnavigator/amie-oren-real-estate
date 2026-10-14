import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { isReviewMode } from '../../src/utils/reviewMode';

const root = process.cwd(); // Playwright runs from the repository root
const read = (p: string) => readFileSync(join(root, p), 'utf8');

test.describe('review mode can only be a build mode', () => {
  test('is off for production builds and on only for the dev server or `--mode review`', () => {
    expect(isReviewMode({ DEV: false, MODE: 'production' })).toBe(false);
    expect(isReviewMode({ DEV: false, MODE: 'staging' })).toBe(false);
    expect(isReviewMode({ MODE: 'production' })).toBe(false);
    expect(isReviewMode({ DEV: true, MODE: 'development' })).toBe(true);
    expect(isReviewMode({ DEV: false, MODE: 'review' })).toBe(true);
  });

  test('no environment variable can switch review mode on (the old PUBLIC_SHOW_SAMPLE_REVIEWS flag is gone)', () => {
    for (const dir of ['src', 'scripts']) {
      const walk = (d: string): string[] =>
        readdirSync(join(root, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
      for (const f of walk(dir)) expect(read(f), f).not.toMatch(/PUBLIC_SHOW_SAMPLE_REVIEWS/);
    }
  });

  test('build:review runs Astro in review mode and refuses to run on Netlify; build does not', () => {
    const script = read('scripts/build-review.mjs');
    expect(script).toMatch(/'--mode',\s*'review'/);
    expect(script).toMatch(/NETLIFY/);
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts.build).toBe('astro build');
    expect(pkg.scripts.build).not.toMatch(/review/);
    expect(pkg.scripts['build:review']).toBe('node scripts/build-review.mjs');
  });

  test('the host is pinned to the normal build (netlify.toml overrides the dashboard setting)', () => {
    const toml = read('netlify.toml');
    expect(toml).toMatch(/command\s*=\s*"npm run build"/);
    expect(toml).toMatch(/publish\s*=\s*"dist"/);
    expect(toml).not.toMatch(/command\s*=\s*"[^"]*review/);
  });

  test('the review banner and noindex logic still exist for review mode (not deleted)', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    expect(layout).toMatch(/samplesEnabled/);
    expect(layout).toMatch(/review-mode-banner/);
    expect(layout).toMatch(/forceNoindex\s*=\s*noindex\s*\|\|\s*samplesEnabled/);
  });

  test('intentionally excluded pages are kept out of the sitemap config', () => {
    expect(read('astro.config.ts')).toMatch(/\['\/thank-you\/', '\/404\/', '\/review\/'\]/);
  });
});

test.describe('approved client reviews (content)', () => {
  const dir = join(root, 'src', 'content', 'reviews');
  const all = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(md|mdx|json)$/.test(f)) : [];
  const field = (text: string, key: string) => text.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
  const unquote = (v: string) => v.replace(/^'(.*)'$/s, '$1').replace(/''/g, "'");

  test('exactly the three approved reviews exist; the illustrative and sample files are gone', () => {
    expect(all.sort()).toEqual(['client-1-repeat-buyer.md', 'client-2-seller.md', 'client-3-buyer-seller.md']);
  });

  test('each is verified, permitted, published and never flagged illustrative or sample', () => {
    for (const f of all) {
      const t = readFileSync(join(dir, f), 'utf8');
      expect(field(t, 'verified'), f).toBe('true');
      expect(field(t, 'permissionToPublish'), f).toBe('true');
      expect(field(t, 'draft'), f).toBe('false');
      expect(t, f).not.toMatch(/^illustrative:/m);
      expect(t, f).not.toMatch(/^sample:\s*true/m);
    }
  });

  test('attributions are exactly the approved labels, with no invented names or ratings', () => {
    const attribution = Object.fromEntries(all.map((f) => [f, unquote(field(readFileSync(join(dir, f), 'utf8'), 'attribution'))]));
    expect(attribution).toEqual({
      'client-1-repeat-buyer.md': 'Repeat buyer · West Michigan',
      'client-2-seller.md': 'Seller · West Michigan',
      'client-3-buyer-seller.md': 'Buyer & Seller · Greater Grand Rapids',
    });
    for (const f of all) {
      const t = readFileSync(join(dir, f), 'utf8');
      expect(unquote(field(t, 'clientName'))).toMatch(/withheld/i);
      expect(t).not.toMatch(/rating|stars?:|[★☆]/i);
    }
  });

  test('no review text is duplicated anywhere else in the source tree', () => {
    const texts = all.map((f) => unquote(field(readFileSync(join(dir, f), 'utf8'), 'reviewText')).slice(0, 60));
    const walk = (d: string): string[] =>
      readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
    const others = walk(join(root, 'src')).filter((f) => !f.startsWith(dir) && /\.(astro|ts|md|mdx|json)$/.test(f));
    for (const f of others) {
      const t = readFileSync(f, 'utf8');
      for (const text of texts) expect(t.includes(text), `${f} duplicates a review`).toBe(false);
    }
  });
});
