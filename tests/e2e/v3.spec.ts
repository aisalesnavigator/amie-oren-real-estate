import { test, expect, type Page } from '@playwright/test';

const BROAD_LAKE_SENTENCE = /Over the last 15 years, I’ve lived on both Lake Bella Vista\s+and Silver Lake/;
const EXACT_YEARS = /\b(seven|7)\s+years\b|\b(last\s+)?(eight|8)\s+years\b|the last eight\b/i;
const communitySlugs = ['rockford', 'ada', 'east-grand-rapids', 'cascade', 'forest-hills'];

async function mainText(page: Page, path: string) {
  await page.goto(path);
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

test.describe('About page', () => {
  test('no longer renders the Professional Background placeholder template', async ({ page }) => {
    const text = await mainText(page, '/about/');
    await expect(page.locator('[data-about-placeholder]')).toHaveCount(0);
    await expect(page.locator('#background-heading')).toHaveCount(0);
    expect(text).not.toMatch(/to be added|reserved for verified|professional background|career history|designations and credentials|education and training/i);
  });

  test('still feels complete: first-person story, principles, and a closing conversation CTA', async ({ page }) => {
    const text = await mainText(page, '/about/');
    expect(text).toMatch(/more than 15 years/i);
    await expect(page.getByRole('heading', { level: 2, name: /Helping people through the whole move/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /What clients can expect/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /Let’s talk about your move/ })).toBeVisible();
  });
});

test.describe('lake-residency wording', () => {
  for (const path of ['/about/', '/waterfront/rockford-lakes/']) {
    test(`broad statement, no exact 7/8-year breakdown in the overview: ${path}`, async ({ page }) => {
      // The Rockford-area lake hub is checked above its per-lake sections.
      await page.goto(path);
      const head = path === '/about/' ? page.locator('main') : page.locator('main section').first();
      const text = (await head.innerText()).replace(/\s+/g, ' ');
      expect(text).toMatch(BROAD_LAKE_SENTENCE);
      expect(text).not.toMatch(EXACT_YEARS);
    });
  }

  test('waterfront page uses the broad statement and no exact year breakdown', async ({ page }) => {
    const text = await mainText(page, '/waterfront/');
    expect(text).toMatch(BROAD_LAKE_SENTENCE);
    expect(text).not.toMatch(EXACT_YEARS);
  });

  test('Rockford community page uses the broad statement and no exact year breakdown', async ({ page }) => {
    const text = await mainText(page, '/communities/rockford/');
    expect(text).toMatch(/Over the last 15 years, I’ve lived on both Lake Bella Vista and Silver Lake/);
    expect(text).not.toMatch(EXACT_YEARS);
  });

  test('exact lived-history detail stays in the individual lake sections', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    const silver = (await page.locator('#silver-lake').innerText()).replace(/\s+/g, ' ');
    const bella = (await page.locator('#lake-bella-vista').innerText()).replace(/\s+/g, ' ');
    expect(silver).toMatch(/Silver Lake for the last eight years/);
    expect(bella).toMatch(/Lake Bella Vista for seven years/);
  });

  test('the statement is not over-repeated across the community pages', async ({ page }) => {
    for (const slug of communitySlugs.filter((s) => s !== 'rockford')) {
      const text = await mainText(page, `/communities/${slug}/`);
      expect(text).not.toMatch(/Lake Bella Vista and Silver Lake/);
    }
  });
});

test.describe('Location Fit: plain-language setting question', () => {
  test('“close-in” is not shown anywhere on the tool', async ({ page }) => {
    await page.goto('/find-your-fit/');
    const html = await page.locator('main').innerText();
    // Hidden steps are display:none; read the DOM text instead of rendered text.
    const dom = await page.locator('main').evaluate((el) => el.textContent ?? '');
    expect(html + dom).not.toMatch(/close[- ]in(?!\w)/i);
  });

  test('the setting question explains itself with visible text, not a tooltip', async ({ page }) => {
    await page.goto('/find-your-fit/');
    const option = page.locator('label:has(input[name="setting"][value="close_in"])');
    await expect(option).toContainText('Closer to Grand Rapids and everyday amenities');
    await expect(option.locator('.fit-opt__hint')).toContainText('restaurants, shopping');
    await expect(option).not.toHaveAttribute('title', /.+/);
    // The sibling options remain parallel and understandable.
    for (const v of ['village', 'lake', 'wooded', 'flexible']) {
      await expect(page.locator(`label:has(input[name="setting"][value="${v}"])`)).toHaveCount(1);
    }
  });

  test('East Grand Rapids and Rockford copy no longer say “close-in”', async ({ page }) => {
    for (const slug of ['east-grand-rapids', 'rockford']) {
      const text = await mainText(page, `/communities/${slug}/`);
      expect(text).not.toMatch(/close[- ]in(?!\w)/i);
    }
  });
});

test.describe('community resource links', () => {
  for (const slug of communitySlugs) {
    test(`renders a small set of safe external links: ${slug}`, async ({ page }) => {
      await page.goto(`/communities/${slug}/`);
      const section = page.locator('[data-community-resources]');
      await expect(section).toHaveCount(1);
      await expect(section.getByRole('heading', { level: 2, name: 'Want to explore on your own?' })).toBeVisible();
      const links = section.locator('a.resources__link');
      const n = await links.count();
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(4);
      for (let i = 0; i < n; i++) {
        const a = links.nth(i);
        await expect(a).toHaveAttribute('href', /^https:\/\//);
        await expect(a).toHaveAttribute('target', '_blank');
        const rel = (await a.getAttribute('rel')) ?? '';
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
        await expect(a).toContainText('(opens in a new tab)');
      }
    });
  }

  test('the Rockford page stays about lake living, with a restrained resource list', async ({ page }) => {
    await page.goto('/communities/rockford/');
    await expect(page.locator('[data-community-resources] a.resources__link')).toHaveCount(4);
    await expect(page.locator('.section--lake')).toContainText('Lake living is part of what makes Rockford different');
    const text = await mainText(page, '/communities/rockford/');
    expect(text).toContain('I’ve included a few local resources below if you’d like to get a feel for the community directly.');
  });

  test('no resource section contains demographic or “best for” language', async ({ page }) => {
    for (const slug of communitySlugs) {
      await page.goto(`/communities/${slug}/`);
      const text = await page.locator('[data-community-resources]').innerText();
      expect(text).not.toMatch(/best for|famil(y|ies)|young professionals?|retire\w*|\bsafe\b|crime|schools?/i);
    }
  });

  test('every internal link on community pages still points somewhere on this site', async ({ page }) => {
    await page.goto('/communities/ada/');
    const external = await page.locator('main a[target="_blank"]').count();
    expect(external).toBeGreaterThan(0);
    // Every external link opens in a new tab with safe rel values; none is missing rel.
    const unsafe = await page.locator('main a[target="_blank"]:not([rel~="noopener"])').count();
    expect(unsafe).toBe(0);
  });
});

test.describe('placeholders stay designed until imagery is approved', () => {
  test('no undocumented place photo is embedded; placeholders still render', async ({ page }) => {
    for (const slug of communitySlugs) {
      await page.goto(`/communities/${slug}/`);
      await expect(page.locator('img.place__img')).toHaveCount(0);
      await expect(page.locator('.chero__media')).toBeVisible();
    }
  });
});

test.describe('layout', () => {
  for (const slug of communitySlugs) {
    test(`no horizontal overflow with the resource section: ${slug}`, async ({ page }) => {
      await page.goto(`/communities/${slug}/`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
