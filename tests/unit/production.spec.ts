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

test.describe('illustrative client experiences (content)', () => {
  const dir = join(root, 'src', 'content', 'reviews');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.startsWith('illustrative-') && f.endsWith('.md')) : [];
  const field = (text: string, key: string) => text.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
  const unquote = (v: string) => v.replace(/^'(.*)'$/s, '$1').replace(/''/g, "'");

  test('there are three, each clearly flagged as illustrative and never as a verified review', () => {
    expect(files).toHaveLength(3);
    for (const f of files) {
      const t = readFileSync(join(dir, f), 'utf8');
      expect(field(t, 'illustrative'), f).toBe('true');
      expect(field(t, 'verified'), f).toBe('false');
      expect(field(t, 'permissionToPublish'), f).toBe('false');
      expect(field(t, 'sample'), f).toBe('false');
      expect(unquote(field(t, 'displayName'))).toBe('Illustrative client experience');
      expect(unquote(field(t, 'clientName'))).toMatch(/not a real client/i);
      expect(t).toMatch(/NOT a real client/);
    }
  });

  test('quotes are concise (45-80 words), unnamed, and free of overclaiming, ratings and addresses', () => {
    for (const f of files) {
      const text = unquote(field(readFileSync(join(dir, f), 'utf8'), 'reviewText'));
      const words = text.split(/\s+/).filter(Boolean).length;
      expect(words, `${f} word count`).toBeGreaterThanOrEqual(45);
      expect(words, `${f} word count`).toBeLessThanOrEqual(80);
      expect(text, f).not.toMatch(/\b(best|perfect|guarantee[sd]?|#1|number one|top[- ]rated|five[- ]star|5[- ]star|flawless|unparalleled|world-class)\b/i);
      expect(text, f).not.toMatch(/[★☆]|\bstars?\b|\d\s*\/\s*5/i);
      expect(text, f).not.toMatch(/\d{2,}\s+[A-Z][a-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane)\b/);
      expect(text, f).not.toMatch(/\$\s?\d|\b\d+\s?(days|%)\b/i);
    }
  });

  test('they cover the three requested themes', () => {
    const by = Object.fromEntries(files.map((f) => [f, unquote(field(readFileSync(join(dir, f), 'utf8'), 'reviewText'))]));
    expect(by['illustrative-1-family-seller.md']).toMatch(/emotional|important change/i);
    expect(by['illustrative-2-waterfront-buyer.md']).toMatch(/Rockford-area lakes/);
    expect(by['illustrative-2-waterfront-buyer.md']).toMatch(/shoreline/i);
    expect(by['illustrative-3-west-michigan-move.md']).toMatch(/Grand Rapids/);
    expect(by['illustrative-3-west-michigan-move.md']).toMatch(/personal/i);
  });
});
