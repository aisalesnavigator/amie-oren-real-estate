import { test, expect, type Page } from '@playwright/test';

type Scenario = Record<string, string | string[]>;

/** Persona A — lake buyer. */
const lakeBuyer: Scenario = {
  priorities: ['water', 'privacy', 'nature'],
  water_type: 'all_sports',
  setting: 'lake',
  home: 'open',
  drive: 'farther',
  care: 'waterfront',
  give_up: 'water',
};
/** Persona B — walkable/character buyer (no water branch). */
const walkableBuyer: Scenario = {
  priorities: ['walkable', 'character', 'short_drive'],
  setting: 'connected',
  home: 'older_character',
  drive: 'shortest',
  care: 'typical',
  give_up: 'walkable',
};
/** Persona D — river buyer. */
const riverBuyer: Scenario = { ...lakeBuyer, water_type: 'riverfront', setting: 'larger_lot', care: 'larger_lot', give_up: 'nature' };

const ORDER = ['priorities', 'water_type', 'setting', 'home', 'drive', 'care', 'give_up'];

/** Answers each visible question in order; skipped branches are simply not shown. */
async function runFit(page: Page, scenario: Scenario) {
  await page.goto('/find-your-fit/');
  for (const id of ORDER) {
    const step = page.locator(`fieldset[data-step="${id}"]`);
    if (!(await step.isVisible())) continue;
    for (const v of ([] as string[]).concat(scenario[id] ?? [])) await page.locator(`label:has(input[name="${id}"][value="${v}"])`).click();
    await page.locator('[data-next]').click();
  }
  await expect(page.locator('#fit-results')).toBeVisible();
  await expect(page.locator('#fit-form')).toBeHidden();
}

const cards = (page: Page) => page.locator('[data-cards] .fit-card');

test.describe('questionnaire and branching', () => {
  test('starts with the top-priorities question (choose up to three), as a conversation', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await expect(page.locator('legend:visible')).toHaveText('What matters most to you?');
    await expect(page.locator('[data-progress]')).toHaveText('Question 1 of 6');
    await expect(page.locator('input[name="priorities"]')).toHaveCount(9);
    const text = (await page.locator('main').innerText()).toLowerCase();
    expect(text).not.toContain('quiz');
    expect(text).not.toContain('algorithm');
  });

  test('limits top priorities to three', async ({ page }) => {
    await page.goto('/find-your-fit/');
    for (const v of ['walkable', 'privacy', 'nature']) await page.locator(`label:has(input[name="priorities"][value="${v}"])`).click();
    await expect(page.locator('input[name="priorities"][value="character"]')).toBeDisabled();
  });

  test('choosing water adds the water-setting question and updates the progress count', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await page.locator('label:has(input[name="priorities"][value="water"])').click();
    await expect(page.locator('[data-progress]')).toHaveText('Question 1 of 7');
    await page.locator('[data-next]').click();
    await expect(page.locator('legend:visible')).toHaveText('What kind of water setting are you most drawn to?');
    await expect(page.locator('[data-progress]')).toHaveText('Question 2 of 7');
  });

  test('without water, the water question is skipped and the count stays honest', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await page.locator('label:has(input[name="priorities"][value="walkable"])').click();
    await page.locator('[data-next]').click();
    await expect(page.locator('legend:visible')).toHaveText('Which setting feels most like home to you?');
    await expect(page.locator('[data-progress]')).toHaveText('Question 2 of 6');
  });

  test('Back retraces the questions actually seen, and removing water drops the branch', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await page.locator('label:has(input[name="priorities"][value="water"])').click();
    await page.locator('[data-next]').click();
    await page.locator('label:has(input[name="water_type"][value="riverfront"])').click();
    await page.locator('[data-next]').click();
    await expect(page.locator('[data-progress]')).toHaveText('Question 3 of 7');
    await page.locator('[data-back]').click();
    await expect(page.locator('legend:visible')).toHaveText('What kind of water setting are you most drawn to?');
    await page.locator('[data-back]').click();
    await expect(page.locator('legend:visible')).toHaveText('What matters most to you?');
    // Swap water for walkability: the branch disappears and its answer is cleared.
    await page.locator('label:has(input[name="priorities"][value="water"])').click();
    await page.locator('label:has(input[name="priorities"][value="walkable"])').click();
    await expect(page.locator('[data-progress]')).toHaveText('Question 1 of 6');
    await expect(page.locator('input[name="water_type"]:checked')).toHaveCount(0);
    await page.locator('[data-next]').click();
    await expect(page.locator('legend:visible')).toHaveText('Which setting feels most like home to you?');
  });

  test('requires an answer before continuing and announces the error', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await page.locator('[data-next]').click();
    await expect(page.locator('[data-error]')).toBeVisible();
    await expect(page.locator('[data-error]')).toContainText('choose at least one');
    await expect(page.locator('[data-progress]')).toHaveText('Question 1 of 6');
  });

  test('is operable by keyboard alone', async ({ page }) => {
    await page.goto('/find-your-fit/');
    const first = page.locator('input[name="priorities"]').first();
    await first.focus();
    await page.keyboard.press('Space');
    await expect(first).toBeChecked();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-progress]')).toHaveText('Question 2 of 7');
    await expect(page.locator('legend:visible')).toBeFocused();
    const radio = page.locator('input[name="water_type"]').first();
    await radio.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('input[name="water_type"]').nth(1)).toBeChecked();
  });

  test('uses real fieldsets, legends, and radio/checkbox controls', async ({ page }) => {
    await page.goto('/find-your-fit/');
    await expect(page.locator('fieldset[data-step] legend')).toHaveCount(7);
    await expect(page.locator('input[name="priorities"]').first()).toHaveAttribute('type', 'checkbox');
    await expect(page.locator('input[name="setting"]').first()).toHaveAttribute('type', 'radio');
  });

  test('collects no personal information and sends nothing before results', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.method() + ' ' + r.url()));
    await page.goto('/find-your-fit/');
    await expect(page.locator('#fit-form input[type="email"], #fit-form input[type="tel"], #fit-form input[name="name"]')).toHaveCount(0);
    requests.length = 0;
    await runFit(page, lakeBuyer);
    expect(requests.filter((r) => r.startsWith('POST'))).toEqual([]);
    expect(requests.filter((r) => /formspree/.test(r))).toEqual([]);
  });
});

test.describe('results', () => {
  test('lake buyer: Rockford — strongest fit, four-part card, personalized tour, lakes block', async ({ page }) => {
    await runFit(page, lakeBuyer);
    const n = await cards(page).count();
    expect(n).toBeGreaterThanOrEqual(2);
    expect(n).toBeLessThanOrEqual(3);
    const lead = cards(page).first();
    await expect(lead.locator('.fit-card__name')).toHaveText('Rockford');
    await expect(lead.locator('.fit-card__pos')).toHaveText('— strongest fit');
    await expect(lead.getByRole('heading', { level: 4, name: 'Why it fits' })).toBeVisible();
    await expect(lead.getByRole('heading', { level: 4, name: 'What I’d want you to know' })).toBeVisible();
    await expect(lead.getByRole('heading', { level: 4, name: 'If I were showing you the area…' })).toBeVisible();
    const why = lead.locator('[data-why] li');
    expect(await why.count()).toBeGreaterThanOrEqual(2);
    expect(await why.count()).toBeLessThanOrEqual(4);
    await expect(lead.locator('[data-why]')).toContainText('All-sports lake / boating');
    await expect(lead.locator('[data-tour]')).toContainText('Lake Bella Vista, Silver Lake and Bostwick Lake');
    await expect(lead.locator('[data-tour]')).toContainText('activity levels, launch arrangements and lake rules');
    await expect(page.locator('[data-lakes]')).toBeVisible();
    await expect(page.locator('#fit-results')).not.toContainText(/\d+\s?%/);
    await expect(page.locator('#fit-results')).toContainText('Based on what you told me');
  });

  test('walkable buyer: East Grand Rapids leads, no lakes block, tour is honest about one lake', async ({ page }) => {
    await runFit(page, walkableBuyer);
    const lead = cards(page).first();
    await expect(lead.locator('.fit-card__name')).toHaveText('East Grand Rapids');
    await expect(page.locator('[data-lakes]')).toBeHidden();
    await expect(lead.locator('[data-tour]')).toContainText('Gaslight Village');
    await expect(lead.locator('[data-tour]')).toContainText('different from Rockford’s collection of lake environments');
    await expect(lead.locator('a[data-link]')).toHaveAttribute('href', '/communities/east-grand-rapids/');
  });

  test('river buyer: a river community leads instead of Rockford', async ({ page }) => {
    await runFit(page, riverBuyer);
    await expect(cards(page).first().locator('.fit-card__name')).toHaveText(/^(Ada|Cascade)$/);
  });

  test('same answers always give the same results', async ({ page }) => {
    await runFit(page, lakeBuyer);
    const first = await page.locator('[data-cards]').innerText();
    await runFit(page, lakeBuyer);
    expect(await page.locator('[data-cards]').innerText()).toBe(first);
  });

  test('“Change my answers” returns to the first question with answers kept', async ({ page }) => {
    await runFit(page, walkableBuyer);
    await page.getByRole('button', { name: 'Change my answers' }).click();
    await expect(page.locator('#fit-form')).toBeVisible();
    await expect(page.locator('legend:visible')).toHaveText('What matters most to you?');
    await expect(page.locator('input[name="priorities"]:checked')).toHaveCount(3);
  });

  test('no horizontal overflow on the results view, and card CTAs do not crowd the card', async ({ page }) => {
    await runFit(page, lakeBuyer);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const count = await cards(page).count();
    for (let i = 0; i < count; i++) {
      const card = cards(page).nth(i);
      const cta = card.locator('[data-search]');
      await expect(cta).toBeVisible();
      const c = (await card.boundingBox())!;
      const b = (await cta.boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(c.x - 1);
      expect(b.x + b.width).toBeLessThanOrEqual(c.x + c.width + 1);
      expect(b.height).toBeLessThan(80);
    }
  });
});

test.describe('per-community CTAs and the saved-search handoff', () => {
  test('every recommended community has its own named CTA carrying that community and the fit answers', async ({ page }) => {
    await runFit(page, lakeBuyer);
    const count = await cards(page).count();
    for (let i = 0; i < count; i++) {
      const card = cards(page).nth(i);
      const name = (await card.locator('.fit-card__name').innerText()).trim();
      const slug = (await card.getAttribute('data-community'))!;
      const cta = card.getByRole('link', { name: `Send me homes that fit ${name}` });
      await expect(cta).toBeVisible();
      const href = (await cta.getAttribute('href'))!;
      const params = new URL(href, 'http://x').searchParams;
      expect(params.get('selected')).toBe(slug);
      expect(params.get('from')).toBe('fit');
      expect(params.get('top_priorities')).toBe('water,privacy,nature');
      expect(params.get('water_type')).toBe('all_sports');
      expect(params.get('hardest_to_give_up')).toBe('water');
    }
  });

  test('a community CTA preselects only that community and keeps the full fit summary', async ({ page }) => {
    await runFit(page, lakeBuyer);
    const second = cards(page).nth(1);
    const slug = (await second.getAttribute('data-community'))!;
    const name = (await second.locator('.fit-card__name').innerText()).trim();
    await second.getByRole('link', { name: `Send me homes that fit ${name}` }).click();
    await expect(page).toHaveURL(new RegExp(`/home-search/\\?.*selected=${slug}`));
    await expect(page.locator(`input[name="communities"][data-slug="${slug}"]`)).toBeChecked();
    await expect(page.locator('input[name="communities"]:checked')).toHaveCount(1);
    await expect(page.locator('[data-context]')).toContainText(`Selected from your results: ${name}`);
    await expect(page.locator('[data-context]')).toContainText('Top priorities: Waterfront or water access');
    await expect(page.locator('input[name="fit_selected"]')).toHaveValue(name);
    const summary = await page.locator('input[name="fit_summary"]').inputValue();
    expect(summary).toContain(`Selected community: ${name}`);
    expect(summary).toContain('Water setting: All-sports lake / boating');
    expect(summary).toContain('Hardest to give up: Being on or very near the water');
  });

  test('Rockford + lake water carries lake context through to Formspree', async ({ page }) => {
    let posted = '';
    await page.route('https://formspree.io/**', async (route) => {
      posted = route.request().postData() ?? '';
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await runFit(page, lakeBuyer);
    await cards(page).first().getByRole('link', { name: 'Send me homes that fit Rockford' }).click();
    await expect(page.locator('[data-context]')).toContainText('Lake interest: Rockford-area lakes');
    await expect(page.locator('#search-waterfront')).toHaveValue('Strongly preferred');
    await page.locator('#search-name').fill('Test Person');
    await page.locator('#search-email').fill('test@example.com');
    await page.getByRole('button', { name: 'Send My Search Request' }).click();
    await expect(page).toHaveURL(/\/thank-you\/\?form=search/);
    for (const field of ['location_fit_search', 'fit_selected', 'Rockford', 'top_priorities', 'water_type', 'all_sports', 'hardest_to_give_up', 'fit_summary', 'Lake interest: Rockford-area lakes']) {
      expect(posted).toContain(field);
    }
  });

  test('the bottom CTA still selects every recommended community', async ({ page }) => {
    await runFit(page, walkableBuyer);
    const count = await cards(page).count();
    await page.locator('[data-search-link]').click();
    await expect(page).toHaveURL(/\/home-search\/\?.*fit_primary=east-grand-rapids/);
    expect(new URL(page.url()).searchParams.has('selected')).toBe(false);
    await expect(page.locator('input[name="communities"]:checked')).toHaveCount(count);
    await expect(page.locator('input[name="water_type"]')).toBeDisabled();
  });

  test('a selected value that was not a result is ignored (whitelist)', async ({ page }) => {
    await page.goto('/home-search/?from=fit&fit_primary=ada&fit_secondary=cascade&selected=rockford');
    await expect(page.locator('input[name="communities"][data-slug="rockford"]')).not.toBeChecked();
    await expect(page.locator('input[name="communities"]:checked')).toHaveCount(2);
  });
});
