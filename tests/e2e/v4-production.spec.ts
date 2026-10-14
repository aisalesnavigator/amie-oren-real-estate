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

const APPROVED = [
  { attribution: 'Repeat buyer · West Michigan', start: 'Amie has helped me purchase two homes over the last 15 years' },
  { attribution: 'Seller · West Michigan', start: 'Selling the home we had lived in for years was an emotional decision' },
  { attribution: 'Buyer & Seller · Greater Grand Rapids', start: 'We were balancing a sale and a purchase across the Grand Rapids area' },
];

test.describe('Client Experiences: approved real client reviews', () => {
  test('all three approved reviews are shown with their exact attributions, and nothing illustrative remains', async ({ page }) => {
    await page.goto('/client-experiences/');
    const cards = page.locator('figure.testimonial');
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute('data-review-kind', 'verified');
      await expect(card.locator('blockquote')).toContainText(APPROVED[i].start);
      await expect(card.locator('figcaption')).toHaveText(APPROVED[i].attribution);
    }
    await expect(page.locator('h1')).toHaveText('In clients’ own words.');
    await expect(page.locator('main')).toContainText('These are real experiences from clients I’ve worked with.');
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/Illustrative client experience|Illustrative examples shown|illustrative/i);
    await expect(page.locator('[data-review-kind="illustrative"], [data-review-kind="sample"], .testimonial__label')).toHaveCount(0);
  });

  test('cards carry no names, initials, ratings or addresses beyond the approved attribution', async ({ page }) => {
    await page.goto('/client-experiences/');
    const cards = page.locator('figure.testimonial');
    for (let i = 0; i < 3; i++) {
      const caption = (await cards.nth(i).locator('figcaption').innerText()).trim();
      expect(caption).toBe(APPROVED[i].attribution);
      const text = (await cards.nth(i).innerText()).replace(/\s+/g, ' ');
      expect(text).not.toMatch(/\b[A-Z]\.\s?[A-Z]?\.?(?=\s|$)/); // initials such as "J. D."
      expect(text).not.toMatch(/[★☆]|\bstars?\b|\b\d(\.\d)?\s?\/\s?5\b|rated/i);
      expect(text).not.toMatch(/\d{2,}\s+[A-Z][a-z]+\s+(St|Ave|Rd|Dr|Ln)\b/);
    }
  });

  test('the invitation to submit a real experience is kept and goes to the review form', async ({ page }) => {
    await page.goto('/client-experiences/');
    const cta = page.locator('main').getByRole('link', { name: 'Leave a Review' });
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute('href', '/review/');
    await expect(page.getByText(/I publish only genuine, verified reviews/)).toBeVisible();
  });

  test('the homepage shows a restrained set of real reviews and links to the full page', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('section[aria-labelledby="reviews-heading"]');
    await expect(section).toContainText('Real clients, in their own words.');
    const cards = section.locator('figure.testimonial');
    await expect(cards).toHaveCount(2);
    for (let i = 0; i < 2; i++) await expect(cards.nth(i)).toHaveAttribute('data-review-kind', 'verified');
    await expect(cards.nth(0).locator('figcaption')).toHaveText('Seller · West Michigan');
    await expect(cards.nth(1).locator('figcaption')).toHaveText('Buyer & Seller · Greater Grand Rapids');
    await expect(section.locator('[data-reviews-empty]')).toHaveCount(0);
    await expect(section.getByRole('link', { name: 'Read more client experiences' })).toHaveAttribute('href', '/client-experiences/');
    await expect(page.locator('main')).not.toContainText(/Illustrative/i);
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
