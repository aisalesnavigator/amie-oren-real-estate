import { test, expect } from '@playwright/test';

const thirdPerson = /\bAmie (helps|brings|works|listens|keeps|is|will|can|has|reaches|plans|starts|puts|adapts|publishes)\b|\b(she|her|she’ll|she’s)\b/i;

test.describe('first-person voice and experience', () => {
  for (const path of ['/', '/selling/', '/buying/', '/waterfront/', '/waterfront/rockford-lakes/', '/about/', '/contact/', '/refer/', '/find-your-fit/', '/home-search/', '/communities/']) {
    test(`main copy speaks in first person: ${path}`, async ({ page }) => {
      await page.goto(path);
      const text = await page.locator('main').innerText();
      expect(text.match(thirdPerson), `third-person phrasing on ${path}`).toBeNull();
      expect(text).toMatch(/\b(I|I’ve|I’m|I’ll|my|me)\b/);
    });
  }

  for (const path of ['/', '/about/', '/waterfront/']) {
    test(`states more than 15 years of experience: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main')).toContainText(/more than 15 years/i);
    });
  }

  test('hero uses the approved headline and first-person supporting copy', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Real estate guidance for the moments that matter.');
    await expect(page.locator('.hero .lede')).toContainText('For more than 15 years, I’ve helped buyers and sellers');
  });

  test('community pages use the first-person community note', async ({ page }) => {
    for (const slug of ['rockford', 'ada', 'east-grand-rapids', 'cascade', 'forest-hills']) {
      await page.goto(`/communities/${slug}/`);
      const text = await page.locator('main').innerText();
      expect(text).toMatch(/\bI\b/);
      expect(text.match(thirdPerson)).toBeNull();
    }
  });
});

test.describe('waterfront authority', () => {
  test('waterfront page states lake experience and avoids overclaiming', async ({ page }) => {
    await page.goto('/waterfront/');
    const text = await page.locator('main').innerText();
    expect(text).toMatch(/Over the last 15 years, I’ve lived on both Lake Bella Vista and Silver Lake/);
    expect(text).not.toMatch(/\b(seven|7)\s+years\b|\b(last\s+)?(eight|8)\s+years\b|the last eight\b/i);
    expect(text).toMatch(/helped many\s+clients buy and sell lakefront homes/);
    expect(text).toMatch(/can’t promise a\s+property before it reaches the market/);
    expect(text).not.toMatch(/exclusive|off-market|before everyone else|guarantee[sd]? access|I always know/i);
  });

  test('Rockford lakes hub covers the five lakes with CTAs and no unverified specifics', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    for (const name of ['Bostwick Lake', 'Silver Lake', 'Lake Bella Vista', 'Myers Lake', 'Brower Lake']) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: /^Send me (Bostwick Lake|Silver Lake|Lake Bella Vista|Myers Lake|Brower Lake) homes$/ })).toHaveCount(5);
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/\d+\s?acres|\bdeep\b|\d+\s?feet/i);
  });

  test('Rockford community page links to the lakes hub', async ({ page }) => {
    await page.goto('/communities/rockford/');
    await expect(page.getByRole('link', { name: 'Explore Rockford-area lakes' })).toBeVisible();
  });
});

test.describe('saved search', () => {
  test('form is a POST form with form_type=location_fit_search and requires name + email', async ({ page }) => {
    await page.goto('/home-search/');
    const form = page.locator('form#search-form');
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form.locator('input[name="form_type"]')).toHaveValue('location_fit_search');
    await expect(form.locator('input[name="_gotcha"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Send My Search Request' }).click();
    await expect(page.locator('[data-error-summary]')).toBeVisible();
    await expect(page.locator('[data-error-summary]')).toContainText(/Name is required/);
    await expect(page.locator('[data-error-summary]')).toContainText(/valid email|Email is required/);
  });

  test('is explicit that the search is set up manually', async ({ page }) => {
    await page.goto('/home-search/');
    await expect(page.locator('main')).toContainText('I set up your search by hand');
    await expect(page.locator('main')).toContainText('It isn’t automated');
  });

  test('ignores unknown query values (whitelist)', async ({ page }) => {
    await page.goto('/home-search/?community=evil<script>&lake=nope&fit_primary=x');
    await expect(page.locator('input[name="communities"]:checked')).toHaveCount(0);
    await expect(page.locator('[data-context]')).toBeHidden();
  });

  test('a failed submission shows an error rather than silently succeeding', async ({ page }) => {
    await page.route('https://formspree.io/**', (route) => route.abort());
    await page.goto('/home-search/');
    await page.locator('#search-name').fill('Test Person');
    await page.locator('#search-email').fill('test@example.com');
    await page.getByRole('button', { name: 'Send My Search Request' }).click();
    await expect(page.locator('[data-form-status]')).toContainText(/could not be sent/i);
  });
});

test.describe('lake CTAs', () => {
  test('Silver Lake CTA opens the saved-search form with Silver Lake preselected', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    await page.getByRole('link', { name: 'Send me Silver Lake homes' }).click();
    await expect(page).toHaveURL(/\/home-search\/\?community=rockford&lake=silver-lake$/);
    await expect(page.locator('input[name="lakes"][data-slug="silver-lake"]')).toBeChecked();
    await expect(page.locator('input[name="communities"][data-slug="rockford"]')).toBeChecked();
    await expect(page.locator('input[name="lakes"][data-slug="bostwick-lake"]')).not.toBeChecked();
    await expect(page.locator('[data-context]')).toContainText('Silver Lake');
  });

  test('Silver Lake request reaches Formspree with the lake and source', async ({ page }) => {
    let posted = '';
    await page.route('https://formspree.io/**', async (route) => {
      posted = route.request().postData() ?? '';
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/home-search/?community=rockford&lake=silver-lake');
    await page.locator('#search-name').fill('Test Person');
    await page.locator('#search-email').fill('test@example.com');
    await page.getByRole('button', { name: 'Send My Search Request' }).click();
    await expect(page).toHaveURL(/thank-you/);
    expect(posted).toContain('location_fit_search');
    expect(posted).toContain('Silver Lake');
    expect(posted).toContain('lake_page');
  });
});

test.describe('discovery paths', () => {
  test('homepage promotes Find Your West Michigan Fit', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Find Your West Michigan Fit' }).first().click();
    await expect(page).toHaveURL(/\/find-your-fit\/$/);
  });

  test('communities page offers both paths', async ({ page }) => {
    await page.goto('/communities/');
    await expect(page.getByText('Explore directly')).toBeVisible();
    await expect(page.getByText('Get guidance')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Find Your West Michigan Fit' })).toBeVisible();
  });
});

test.describe('responsive: new pages', () => {
  for (const path of ['/find-your-fit/', '/home-search/', '/waterfront/rockford-lakes/', '/waterfront/']) {
    test(`no horizontal overflow: ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

});

test.describe('review protections remain', () => {
  test('production build still shows no illustrative reviews on new pages', async ({ page }) => {
    for (const path of ['/', '/find-your-fit/', '/waterfront/']) {
      await page.goto(path);
      await expect(page.getByText(/Illustrative draft/i)).toHaveCount(0);
    }
  });
});
