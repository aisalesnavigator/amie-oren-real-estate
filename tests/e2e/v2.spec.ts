import { test, expect, type Page } from '@playwright/test';

const ORDER = ['water', 'village', 'lot', 'character', 'maintenance', 'access', 'recreation', 'setting', 'priorities'];

type Scenario = Record<string, string | string[]>;

const rockfordWater: Scenario = {
  water: 'waterfront',
  village: 'not_deciding',
  lot: 'some_room',
  character: 'open',
  maintenance: 'more_property',
  access: 'trade',
  recreation: 'lakes',
  setting: 'lake',
  priorities: ['waterfront', 'outdoor_recreation'],
};
const egrCloseIn: Scenario = {
  water: 'nice',
  village: 'very',
  lot: 'connected',
  character: 'older',
  maintenance: 'low',
  access: 'very',
  recreation: 'walkable',
  setting: 'close_in',
  priorities: ['walkability'],
};

async function runFit(page: Page, scenario: Scenario) {
  await page.goto('/find-your-fit/');
  for (const id of ORDER) {
    const values = ([] as string[]).concat(scenario[id] ?? []);
    for (const v of values) await page.locator(`label:has(input[name="${id}"][value="${v}"])`).click();
    await page.locator('[data-next]').click();
  }
  await expect(page.locator('#fit-results')).toBeVisible();
}

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

test.describe('Find Your West Michigan Fit', () => {
  test('renders as a guided conversation, not a quiz, with the disclaimer', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await expect(page.locator('h1')).toHaveText('Find your West Michigan fit');
    await expect(page.locator('main')).toContainText('This isn’t a ranking of communities.');
    const text = (await page.locator('main').innerText()).toLowerCase();
    expect(text).not.toContain('quiz');
    expect(text).not.toContain('algorithm');
    await expect(page.locator('[data-progress]')).toHaveText(/Question 1 of 9/);
    await expect(page.locator('fieldset[data-step]:visible')).toHaveCount(1);
  });

  test('requires an answer before continuing, and announces the error', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await page.locator('[data-next]').click();
    await expect(page.locator('[data-error]')).toBeVisible();
    await expect(page.locator('[data-error]')).toContainText('choose an answer');
    await expect(page.locator('[data-progress]')).toHaveText(/Question 1 of 9/);
  });

  test('is operable by keyboard alone', async ({ page }) => {
    await page.goto('/find-your-fit/');
    const first = page.locator('input[name="water"]').first();
    await first.focus();
    await page.keyboard.press('Space');
    await expect(first).toBeChecked();
    await page.keyboard.press('Enter'); // advances like Next
    await expect(page.locator('[data-progress]')).toHaveText(/Question 2 of 9/);
    await expect(page.locator('legend:visible')).toBeFocused();
    // Real radios: arrow keys move the selection.
    const village = page.locator('input[name="village"]').first();
    await village.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('input[name="village"]').nth(1)).toBeChecked();
  });

  test('uses real fieldsets, legends, and radio/checkbox controls', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await expect(page.locator('fieldset[data-step] legend')).toHaveCount(9);
    await expect(page.locator('input[type="radio"]').first()).toBeAttached();
    await expect(page.locator('input[name="priorities"]').first()).toHaveAttribute('type', 'checkbox');
  });

  test('collects no personal information and sends nothing before results', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.method() + ' ' + r.url()));
    await page.goto('/find-your-fit/');
    await expect(page.locator('#fit-form input[type="email"], #fit-form input[type="tel"], #fit-form input[name="name"]')).toHaveCount(0);
    requests.length = 0;
    await runFit(page, rockfordWater);
    expect(requests.filter((r) => r.startsWith('POST'))).toEqual([]);
    expect(requests.filter((r) => /formspree/.test(r))).toEqual([]);
  });

  test('water-heavy scenario: Rockford leads, 2–3 results, lakes block, links', async ({ page }) => {
    await runFit(page, rockfordWater);
    const cards = page.locator('[data-cards] .fit-card');
    const n = await cards.count();
    expect(n).toBeGreaterThanOrEqual(2);
    expect(n).toBeLessThanOrEqual(3);
    await expect(cards.first().locator('.fit-card__name')).toHaveText('Rockford');
    await expect(cards.first().locator('.fit-card__rank')).toHaveText('Strongest fit');
    await expect(cards.first().locator('.fit-card__why')).toContainText('Rockford rises to the top because');
    await expect(page.locator('[data-lakes]')).toBeVisible();
    await expect(page.locator('[data-lakes] a[href="/waterfront/rockford-lakes/#silver-lake"]')).toBeVisible();
    await expect(page.locator('[data-water-note]')).toBeVisible();
    await expect(cards.first().locator('a[data-link]')).toHaveAttribute('href', '/communities/rockford/');
    await expect(page.locator('#fit-results')).not.toContainText(/\d+\s?%/);
    await expect(page.locator('#fit-results')).not.toContainText(/quiz|algorithm/i);
  });

  test('close-in scenario: East Grand Rapids leads and no lakes block is shown', async ({ page }) => {
    await runFit(page, egrCloseIn);
    await expect(page.locator('[data-cards] .fit-card').first().locator('.fit-card__name')).toHaveText('East Grand Rapids');
    await expect(page.locator('[data-lakes]')).toBeHidden();
    await expect(page.locator('[data-cards] .fit-card').first().locator('a[data-link]')).toHaveAttribute(
      'href',
      '/communities/east-grand-rapids/',
    );
  });

  test('same answers always give the same results', async ({ page }) => {
    await runFit(page, rockfordWater);
    const first = await page.locator('[data-cards]').innerText();
    await runFit(page, rockfordWater);
    expect(await page.locator('[data-cards]').innerText()).toBe(first);
  });

  test('result CTA carries the outcome into the saved-search form, then to Formspree', async ({ page }) => {
    let posted = '';
    await page.route('https://formspree.io/**', async (route) => {
      posted = route.request().postData() ?? '';
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await runFit(page, rockfordWater);
    await page.getByRole('link', { name: 'Send me homes that fit this' }).first().click();
    await expect(page).toHaveURL(/\/home-search\/\?.*fit_primary=rockford/);
    await expect(page.locator('[data-context]')).toContainText('Strongest fit: Rockford');
    await expect(page.locator('input[name="communities"][data-slug="rockford"]')).toBeChecked();
    await expect(page.locator('#search-waterfront')).toHaveValue('Strongly preferred');
    await page.locator('#search-name').fill('Test Person');
    await page.locator('#search-email').fill('test@example.com');
    await page.getByRole('button', { name: 'Send My Search Request' }).click();
    await expect(page).toHaveURL(/\/thank-you\/\?form=search/);
    expect(posted).toContain('location_fit_search');
    expect(posted).toContain('fit_primary');
    expect(posted).toContain('Rockford');
    expect(posted).toContain('water_priority');
    expect(posted).toContain('waterfront');
    expect(posted).toContain('privacy_preference');
    expect(posted).toContain('fit_summary');
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

  test('no horizontal overflow on the Find Your Fit results view', async ({ page }) => {
    await runFit(page, rockfordWater);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('review protections remain', () => {
  test('production build still shows no illustrative reviews on new pages', async ({ page }) => {
    for (const path of ['/', '/find-your-fit/', '/waterfront/']) {
      await page.goto(path);
      await expect(page.getByText(/Illustrative draft/i)).toHaveCount(0);
    }
  });
});
