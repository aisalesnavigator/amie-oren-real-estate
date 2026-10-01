import { test, expect } from '@playwright/test';

const pages: [string, RegExp][] = [
  ['/', /moments that matter/i],
  ['/selling/', /Selling a home deserves more/i],
  ['/buying/', /Find the right home/i],
  ['/communities/', /Know the place/i],
  ['/communities/rockford/', /Rockford/],
  ['/communities/ada/', /Ada/],
  ['/communities/east-grand-rapids/', /East Grand Rapids/],
  ['/communities/cascade/', /Cascade/],
  ['/communities/forest-hills/', /Forest Hills/],
  ['/waterfront/', /Buy the water/i],
  ['/about/', /rarely only about real estate/i],
  ['/insights/', /Useful answers/i],
  ['/insights/before-listing-a-home-in-west-michigan/', /before listing a home/i],
  ['/client-experiences/', /clients’ own words/i],
  ['/review/', /share your experience/i],
  ['/refer/', /Know someone making a move/i],
  ['/contact/', /Start a conversation/i],
  ['/properties/', /coming soon/i],
  ['/privacy/', /privacy/i],
];

test.describe('pages render', () => {
  for (const [path, heading] of pages) {
    test(`${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toContainText(heading);
    });
  }

  test('404 page renders for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText(/couldn’t find/i);
  });
});

test.describe('layout', () => {
  for (const [path] of pages) {
    test(`no horizontal overflow: ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('navigation', () => {
  test('primary navigation reaches every top-level page', async ({ page, isMobile, viewport }) => {
    const wide = (viewport?.width ?? 0) >= 1200;
    const targets = ['Selling', 'Buying', 'Communities', 'Waterfront', 'Insights', 'About', 'Client Experiences'];
    for (const label of targets) {
      await page.goto('/');
      if (!wide) await page.locator('summary[aria-label="Menu"]').click();
      const nav = page.getByRole('navigation', { name: wide ? 'Primary' : 'Primary (mobile)' });
      await nav.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${label.toLowerCase().replace(' ', '-')}/$`));
      await expect(page.locator('h1')).toHaveCount(1);
    }
    void isMobile;
  });

  test('mobile/tablet menu opens, closes with Escape, and closes on link click', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) >= 1200, 'Desktop uses the inline navigation');
    await page.goto('/');
    const details = page.locator('[data-mobile-nav]');
    const summary = details.locator('summary');
    await expect(details).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(details).toHaveAttribute('open', '');
    await expect(page.getByRole('link', { name: 'Start a Conversation' }).last()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(details).not.toHaveAttribute('open', '');
    await summary.click();
    await details.getByRole('link', { name: 'Selling' }).click();
    await expect(page).toHaveURL(/\/selling\/$/);
    await expect(details).not.toHaveAttribute('open', '');
  });

  test('inline navigation is shown on desktop only', async ({ page, viewport }) => {
    await page.goto('/');
    const wide = (viewport?.width ?? 0) >= 1200;
    if (wide) await expect(page.locator('.primary-nav')).toBeVisible();
    else await expect(page.locator('.primary-nav')).toBeHidden();
  });

  test('skip link targets main content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main');
    await expect(page.locator('main#main')).toHaveCount(1);
  });
});

test.describe('forms', () => {
  for (const [path, type, button] of [
    ['/contact/', 'contact', 'Send Message'],
    ['/review/', 'client_review', 'Share My Experience'],
    ['/refer/', 'referral', 'Send Introduction'],
  ] as const) {
    test(`${path} is a POST form with identifier and honeypot`, async ({ page }) => {
      await page.goto(path);
      const form = page.locator('form[data-enhanced-form]');
      await expect(form).toHaveAttribute('method', 'post');
      await expect(form).toHaveAttribute('action', /formspree\.io\/f\/|^mailto:/);
      await expect(form.locator('input[name="form_type"]')).toHaveValue(type);
      await expect(form.locator('input[name="_gotcha"]')).toHaveCount(1);
      await expect(form.getByRole('button', { name: button })).toBeVisible();
    });

    test(`${path} shows accessible validation errors when submitted empty`, async ({ page }) => {
      await page.goto(path);
      await page.getByRole('button', { name: button }).click();
      const summary = page.locator('[data-error-summary]');
      await expect(summary).toBeVisible();
      await expect(summary).toBeFocused();
      await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible();
    });
  }

  test('contact form posts to the endpoint and shows the thank-you page', async ({ page }) => {
    let posted: string | null = null;
    await page.route('https://formspree.io/**', async (route) => {
      posted = route.request().postData();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/contact/?interest=selling');
    await expect(page.getByLabel('I’m interested in')).toHaveValue('Selling');
    await page.getByLabel('Name', { exact: false }).first().fill('Test Person');
    await page.getByLabel('Email', { exact: false }).first().fill('test@example.com');
    await page.getByLabel('Message').fill('Hello Amie, this is a test.');
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page).toHaveURL(/\/thank-you\/\?form=contact/);
    expect(posted).toContain('form_type');
    expect(posted).toContain('contact');
  });

  test('a failed submission shows an error and keeps the form usable', async ({ page }) => {
    await page.route('https://formspree.io/**', (route) => route.fulfill({ status: 500, body: 'nope' }));
    await page.goto('/contact/');
    await page.getByLabel('Name', { exact: false }).first().fill('Test Person');
    await page.getByLabel('Email', { exact: false }).first().fill('test@example.com');
    await page.getByLabel('I’m interested in').selectOption('Buying');
    await page.getByLabel('Message').fill('Hello');
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page.locator('[data-form-status]')).toContainText(/could not be sent/i);
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeEnabled();
  });

  for (const [path, type, button, fill] of [
    ['/review/', 'client_review', 'Share My Experience', async (page: import('@playwright/test').Page) => {
      await page.locator('#review-name').fill('Test Person');
      await page.locator('#review-email').fill('test@example.com');
      await page.locator('#review-type').selectOption('Seller');
      await page.locator('#review-text').fill('Great experience.');
      await page.locator('#review-consent').check();
    }],
    ['/refer/', 'referral', 'Send Introduction', async (page: import('@playwright/test').Page) => {
      await page.locator('#ref-name').fill('Test Person');
      await page.locator('#ref-person').fill('A Friend');
      await page.locator('#ref-consent').check();
    }],
  ] as const) {
    test(`${path} submits form_type=${type} and reaches thank-you`, async ({ page }) => {
      let posted = '';
      await page.route('https://formspree.io/**', async (route) => {
        posted = route.request().postData() ?? '';
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      });
      await page.goto(path);
      await fill(page);
      await page.getByRole('button', { name: button }).click();
      await expect(page).toHaveURL(/\/thank-you\//);
      expect(posted).toContain(type);
    });

    test(`${path} shows an error (not silent success) when the endpoint fails or is offline`, async ({ page }) => {
      await page.route('https://formspree.io/**', (route) => route.abort());
      await page.goto(path);
      await fill(page);
      await page.getByRole('button', { name: button }).click();
      await expect(page.locator('[data-form-status]')).toContainText(/could not be sent/i);
      await expect(page).not.toHaveURL(/thank-you/);
    });
  }

  test('review form requires explicit permission to publish', async ({ page }) => {
    await page.goto('/review/');
    await expect(page.locator('#review-consent')).toBeVisible();
    await page.locator('#review-name').fill('Test Person');
    await page.locator('#review-email').fill('test@example.com');
    await page.locator('#review-type').selectOption('Seller');
    await page.locator('#review-text').fill('Great experience.');
    await page.getByRole('button', { name: 'Share My Experience' }).click();
    await expect(page.locator('[data-error-summary]')).toContainText(/permission to publish/i);
  });
});

test.describe('review gating', () => {
  test('production build never shows illustrative sample reviews', async ({ page }) => {
    for (const path of ['/', '/client-experiences/']) {
      await page.goto(path);
      await expect(page.getByText(/Illustrative draft/i)).toHaveCount(0);
      await expect(page.locator('blockquote')).toHaveCount(0);
    }
  });
});

test.describe('seo basics', () => {
  test('home has canonical, OG tags and valid JSON-LD without invented ratings', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/.+\/$/);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const joined = blocks.join(' ');
    blocks.forEach((b) => JSON.parse(b));
    expect(joined).toContain('RealEstateAgent');
    expect(joined).not.toMatch(/aggregateRating|reviewCount|priceRange/);
  });
});
