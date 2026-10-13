import { test, expect } from '@playwright/test';

// Pages that are indexable in production, and the few that are intentionally noindex.
const indexable = [
  '/', '/about/', '/buying/', '/selling/', '/communities/', '/communities/rockford/', '/communities/ada/',
  '/communities/east-grand-rapids/', '/communities/cascade/', '/communities/forest-hills/', '/waterfront/',
  '/waterfront/rockford-lakes/', '/find-your-fit/', '/home-search/', '/client-experiences/', '/contact/', '/refer/',
  '/properties/', '/privacy/', '/insights/',
];
const intentionallyNoindex = [
  '/review/',
  '/thank-you/',
  '/insights/before-listing-a-home-in-west-michigan/',
  '/insights/comparing-west-michigan-communities/',
  '/insights/waterfront-vs-a-typical-home-purchase/',
];

test.describe('production is indexable', () => {
  for (const path of indexable) {
    test(`no noindex on ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      expect(response?.headers()['x-robots-tag'] ?? '').not.toMatch(/noindex/i);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    });
  }

  test('the homepage is indexable with the production canonical URL', async ({ page }) => {
    await page.goto('/');
    expect(await page.content()).not.toMatch(/noindex/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://amieorenrealestate.com/');
  });

  for (const path of intentionallyNoindex) {
    test(`noindex is kept on ${path} (intentional)`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });
  }

  test('robots.txt allows crawling and the sitemap lists indexable pages only', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/User-agent:\s*\*/);
    expect(robots).toMatch(/Allow:\s*\//);
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
    const index = await (await request.get('/sitemap-index.xml')).text();
    const sitemap = await (await request.get(index.match(/<loc>[^<]*?(\/sitemap-0\.xml)<\/loc>/)![1])).text();
    expect(sitemap).toContain('<loc>https://amieorenrealestate.com/</loc>');
    expect(sitemap).toContain('<loc>https://amieorenrealestate.com/client-experiences/</loc>');
    for (const p of intentionallyNoindex) expect(sitemap, `${p} should not be in the sitemap`).not.toContain(`amieorenrealestate.com${p}</loc>`);
  });
});

test.describe('production has no development or review messaging', () => {
  for (const path of [...indexable, ...intentionallyNoindex]) {
    test(`no design-review banner on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('.review-mode-banner')).toHaveCount(0);
      const html = await page.content();
      expect(html).not.toMatch(/Design-review build|Do not publish this build|illustrative sample reviews are visible/i);
      expect(html).not.toMatch(/Illustrative draft|ILLUSTRATIVE SAMPLE/);
    });
  }
});

test.describe('Client Experiences: temporary illustrative examples', () => {
  test('three examples are shown, each clearly labeled, with the explanatory note', async ({ page }) => {
    await page.goto('/client-experiences/');
    const cards = page.locator('figure.testimonial');
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute('data-review-kind', 'illustrative');
      await expect(card.locator('.testimonial__label')).toHaveText('Illustrative client experience');
      await expect(card.locator('blockquote')).toBeVisible();
    }
    await expect(page.getByText('Illustrative examples shown while client-submitted experiences are being collected.')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('What working together looks like.');
    // Never presented as verified reviews.
    await expect(page.locator('[data-review-kind="verified"]')).toHaveCount(0);
    await expect(page.locator('[data-review-kind="sample"]')).toHaveCount(0);
    await expect(page.locator('main')).not.toContainText('every review on this page has been verified');
  });

  test('the label is discreet: small, muted, sentence case, not a badge', async ({ page }) => {
    await page.goto('/client-experiences/');
    const label = page.locator('.testimonial__label').first();
    const m = await label.evaluate((el) => {
      const c = getComputedStyle(el);
      return { px: parseFloat(c.fontSize), transform: c.textTransform, bg: c.backgroundColor, border: c.borderTopWidth };
    });
    expect(m.px).toBeLessThanOrEqual(15);
    expect(m.transform).toBe('none');
    expect(m.bg).toBe('rgba(0, 0, 0, 0)');
    expect(m.border).toBe('0px');
  });

  test('the examples carry no names, initials, ratings or addresses', async ({ page }) => {
    await page.goto('/client-experiences/');
    const cards = page.locator('figure.testimonial');
    for (let i = 0; i < 3; i++) {
      const text = (await cards.nth(i).innerText()).replace(/\s+/g, ' ');
      expect(text).toContain('Illustrative client experience');
      expect(text).not.toMatch(/\b[A-Z]\.\s?[A-Z]?\.?(?=\s|$)/); // initials such as "J. D."
      expect(text).not.toMatch(/[★☆]|\bstars?\b|\b\d(\.\d)?\s?\/\s?5\b|rated/i);
      expect(text).not.toMatch(/\b(best|perfect|guaranteed)\b/i);
      expect(text).not.toMatch(/\d{2,}\s+[A-Z][a-z]+\s+(St|Ave|Rd|Dr|Ln)\b/);
      const words = (await cards.nth(i).locator('blockquote').innerText()).split(/\s+/).filter(Boolean).length;
      expect(words).toBeGreaterThanOrEqual(45);
      expect(words).toBeLessThanOrEqual(80);
    }
  });

  test('the invitation to submit a real experience is kept and goes to the review form', async ({ page }) => {
    await page.goto('/client-experiences/');
    const cta = page.locator('main').getByRole('link', { name: 'Leave a Review' });
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute('href', '/review/');
    await expect(page.getByText(/I publish only genuine, verified reviews/)).toBeVisible();
  });

  test('the homepage still shows only real reviews (the empty invitation), never the illustrative examples', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-review-kind]')).toHaveCount(0);
    await expect(page.locator('[data-reviews-empty]')).toBeVisible();
    await expect(page.locator('main')).not.toContainText('Illustrative client experience');
  });

  test('no Review, AggregateRating or rating structured data is generated anywhere', async ({ page }) => {
    for (const path of ['/', '/client-experiences/', '/about/', '/contact/']) {
      await page.goto(path);
      const blocks = await page.locator('script[type="application/ld+json"]').allInnerTexts();
      expect(blocks.length).toBeGreaterThan(0);
      for (const b of blocks) {
        expect(b, path).not.toMatch(/"@type"\s*:\s*"(Review|AggregateRating|Rating)"/);
        expect(b, path).not.toMatch(/aggregateRating|reviewCount|ratingValue|reviewRating|"review"\s*:/i);
        expect(b, path).not.toMatch(/Illustrative/i);
      }
    }
  });

  test('the review submission flow is unchanged: Formspree, unpublished until verified', async ({ page }) => {
    await page.goto('/review/');
    const form = page.locator('form');
    await expect(form).toHaveAttribute('action', /^https:\/\/formspree\.io\/f\/mnpnylyj$/);
    await expect(form).toHaveAttribute('method', /post/i);
    await expect(form.locator('input[name="form_type"]')).toHaveValue('client_review');
    await expect(form.locator('input[name="_gotcha"]')).toHaveCount(1);
  });

  test('no horizontal overflow on the page', async ({ page }) => {
    await page.goto('/client-experiences/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
