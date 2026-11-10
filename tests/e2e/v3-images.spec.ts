import { test, expect, type Locator, type Page } from '@playwright/test';

// Any Rockford-lake photo file (lake slugs), however it is named.
const LAKE_PHOTO = /(silver-lake|lake-bella-vista|bostwick-lake|myers-lake|brower-lake)-[a-z-]+\.[a-z0-9_]+/;
// East Grand Rapids' own community photography (Reeds Lake). Allowed on its hero and community cards only.
const EGR_PHOTO = 'east-grand-rapids-reeds-lake-aerial';
// Pages that render the East Grand Rapids hero or its community card (the homepage and communities grids, and
// the Forest Hills page, whose related communities include East Grand Rapids).
const egrCardPages = new Set(['/', '/communities/', '/communities/east-grand-rapids/', '/communities/forest-hills/']);
const otherPages = [
  '/', '/about/', '/buying/', '/selling/', '/communities/', '/communities/rockford/', '/communities/ada/',
  '/communities/east-grand-rapids/', '/communities/cascade/', '/communities/forest-hills/',
  '/find-your-fit/', '/home-search/', '/contact/', '/client-experiences/',
];

/** The credit must be visibly subordinate to the caption: smaller, sentence case, and not an on-image badge. */
async function expectQuietCredit(figure: Locator) {
  const m = await figure.evaluate((el) => {
    const t = getComputedStyle(el.querySelector('.photo-caption__text')!);
    const c = getComputedStyle(el.querySelector('.photo-caption__credit')!);
    const frame = el.querySelector('.place__frame, .gallery__frame');
    return {
      captionPx: parseFloat(t.fontSize),
      creditPx: parseFloat(c.fontSize),
      transform: c.textTransform,
      letterSpacing: c.letterSpacing,
      position: c.position,
      insideImage: !!frame?.contains(el.querySelector('.photo-caption__credit')),
      creditAfterCaption: !!(el.querySelector('.photo-caption__text')!.compareDocumentPosition(el.querySelector('.photo-caption__credit')!) & Node.DOCUMENT_POSITION_FOLLOWING),
    };
  });
  expect(m.creditPx).toBeLessThanOrEqual(13);
  expect(m.captionPx / m.creditPx).toBeGreaterThanOrEqual(1.3);
  expect(m.transform).toBe('none');
  expect(m.letterSpacing === 'normal' || parseFloat(m.letterSpacing) === 0).toBe(true);
  expect(m.position).not.toBe('absolute');
  expect(m.insideImage).toBe(false);
  expect(m.creditAfterCaption).toBe(true);
}

async function lakePhotos(page: Page, id: string) {
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  return section.locator('figure.place[data-place-image]');
}

test.describe('Rockford lake drill-down photography', () => {
  test('each lake shows its sunrise/sunset pair first, then its other approved photos', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    const silver = await lakePhotos(page, 'silver-lake');
    const silverOrder = ['silver-lake-rainbow-reflection', 'silver-lake-sunset-reflection', 'silver-lake-aerial-autumn', 'silver-lake-docks-golden-hour'];
    await expect(silver).toHaveCount(silverOrder.length);
    for (let i = 0; i < silverOrder.length; i++) await expect(silver.nth(i)).toHaveAttribute('data-place-image', silverOrder[i]);
    const bella = await lakePhotos(page, 'lake-bella-vista');
    const bellaOrder = ['lake-bella-vista-sunrise-reflection', 'lake-bella-vista-sunset-reflection', 'lake-bella-vista-aerial'];
    await expect(bella).toHaveCount(bellaOrder.length);
    for (let i = 0; i < bellaOrder.length; i++) await expect(bella.nth(i)).toHaveAttribute('data-place-image', bellaOrder[i]);
  });

  test('photos keep their own shape: never stretched, and wide aerials use a wide frame', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    for (const id of ['silver-lake', 'lake-bella-vista']) {
      const imgs = page.locator(`#${id} img.place__img`);
      for (let i = 0; i < (await imgs.count()); i++) {
        const img = imgs.nth(i);
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
        expect(await img.evaluate((e) => getComputedStyle(e).objectFit)).toBe('cover');
      }
    }
    const aerial = page.locator('#silver-lake figure[data-place-image="silver-lake-aerial-autumn"] .place__frame');
    const box = (await aerial.boundingBox())!;
    expect(box.width / box.height).toBeGreaterThan(2.3);
  });

  test('photos have scene-describing alt text, a caption, a credit line and optimized responsive sources', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    for (const id of ['silver-lake', 'lake-bella-vista']) {
      const figures = await lakePhotos(page, id);
      for (let i = 0; i < (await figures.count()); i++) {
        const fig = figures.nth(i);
        const img = fig.locator('img');
        const alt = (await img.getAttribute('alt')) ?? '';
        const caption = (await fig.locator('.photo-caption__text').innerText()).trim();
        expect(alt.length).toBeGreaterThan(40);
        expect(alt.toLowerCase(), 'alt describes the scene, it does not just repeat the caption').not.toBe(caption.toLowerCase());
        expect(alt).not.toMatch(/^photo:/i);
        expect(await img.getAttribute('srcset')).toMatch(/\.webp/);
        expect(await img.getAttribute('sizes')).toBeTruthy();
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
      }
    }
  });

  test('captions: Sunrise and Sunset for each lake, then descriptive captions, each with a quiet credit line', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    const expected: Record<string, string[]> = {
      'silver-lake': ['Silver Lake Sunrise', 'Silver Lake Sunset', 'Silver Lake from above', 'Silver Lake at golden hour'],
      'lake-bella-vista': ['Lake Bella Vista Sunrise', 'Lake Bella Vista Sunset', 'Lake Bella Vista from above'],
    };
    for (const [id, captions] of Object.entries(expected)) {
      const figures = await lakePhotos(page, id);
      await expect(figures).toHaveCount(captions.length);
      for (let i = 0; i < captions.length; i++) {
        const fig = figures.nth(i);
        await expect(fig.locator('.photo-caption__text')).toHaveText(captions[i]);
        await expect(fig.locator('.photo-caption__credit')).toHaveText('Photo: Amie Oren Real Estate');
        await expectQuietCredit(fig);
      }
    }
  });

  test('lakes without approved photos keep their designed placeholders', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    for (const id of ['bostwick-lake', 'myers-lake', 'brower-lake']) {
      await expect(page.locator(`#${id} figure.place`)).toHaveCount(0);
      await expect(page.locator(`#${id} [data-image-slot]`)).toHaveCount(1);
    }
  });

  test('the two-photo strip is a keyboard-focusable swipe strip below desktop width, and plain stacking above', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    const strip = page.locator('#silver-lake [data-lake-photos]');
    await expect(strip).toHaveAttribute('aria-label', 'Silver Lake photos');
    const wide = (page.viewportSize()?.width ?? 0) >= 1024;
    if (wide) {
      await expect(strip).not.toHaveAttribute('tabindex', /.*/);
    } else {
      await expect(strip).toHaveAttribute('tabindex', '0');
      const scrolls = await strip.evaluate((e) => e.scrollWidth > e.clientWidth);
      expect(scrolls).toBe(true);
    }
  });
});

test.describe('lake photos are not reused elsewhere', () => {
  for (const path of otherPages) {
    test(`no lake-section photo on ${path}`, async ({ page }) => {
      await page.goto(path);
      // Only East Grand Rapids' own Reeds Lake photo may appear, and only on its hero and community cards.
      const shown = await page.locator('[data-place-image]').evaluateAll((els) => els.map((e) => e.getAttribute('data-place-image')));
      expect(shown).toEqual(egrCardPages.has(path) ? [EGR_PHOTO] : []);
      const srcs = await page.locator('img').evaluateAll((els) => els.map((e) => `${(e as HTMLImageElement).currentSrc} ${e.getAttribute('src')} ${e.getAttribute('srcset') ?? ''}`));
      for (const s of srcs) expect(s).not.toMatch(LAKE_PHOTO);
    });
  }

  test('/waterfront/ reuses only the approved Silver Lake Sunrise photo, never the other three', async ({ page }) => {
    await page.goto('/waterfront/');
    const srcs = await page.locator('main img').evaluateAll((els) => els.map((e) => `${(e as HTMLImageElement).currentSrc} ${e.getAttribute('src')} ${e.getAttribute('srcset') ?? ''}`));
    expect(srcs.length).toBeGreaterThan(0);
    for (const s of srcs) {
      expect(s).toMatch(/silver-lake-rainbow-reflection/);
      expect(s).not.toMatch(/silver-lake-sunset|silver-lake-aerial|silver-lake-docks|lake-bella-vista|east-grand-rapids/);
    }
  });

  test('the /waterfront/ hero area has no photograph', async ({ page }) => {
    await page.goto('/waterfront/');
    await expect(page.locator('.page-hero img')).toHaveCount(0);
    await expect(page.locator('.page-hero [data-place-image]')).toHaveCount(0);
  });
});

test.describe('/waterfront/ gallery', () => {
  test('renders as an accessible carousel region with one real photo and designed placeholders', async ({ page }) => {
    await page.goto('/waterfront/');
    const section = page.locator('[data-waterfront-gallery]');
    await expect(section).toHaveCount(1);
    await expect(section).toHaveAttribute('data-mode', 'partial');
    const region = section.locator('[role="region"][aria-roledescription="carousel"]');
    await expect(region).toHaveAttribute('aria-label', 'Waterfront photography');
    const slides = region.locator('[role="group"][aria-roledescription="slide"]');
    await expect(slides).toHaveCount(3);
    await expect(slides.first()).toHaveAttribute('aria-label', '1 of 3');
    await expect(region.locator('[data-gallery-item]')).toHaveCount(1);
    await expect(region.locator('[data-gallery-placeholder]')).toHaveCount(2);
    await expect(section.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('the first slide is the featured Silver Lake Sunrise photo, captioned with a quiet credit', async ({ page }) => {
    await page.goto('/waterfront/');
    const first = page.locator('[data-waterfront-gallery] [role="group"][aria-roledescription="slide"]').first();
    await expect(first).toHaveAttribute('data-gallery-item', 'silver-lake-sunrise');
    await expect(first).toHaveAttribute('data-featured', '');
    await expect(first.locator('.photo-caption__text')).toHaveText('Silver Lake Sunrise');
    await expect(first.locator('.photo-caption__credit')).toHaveText('Photo: Amie Oren Real Estate');
    await expectQuietCredit(first);
    const img = first.locator('img');
    const alt = (await img.getAttribute('alt')) ?? '';
    expect(alt.length).toBeGreaterThan(40);
    expect(alt.toLowerCase()).not.toBe('silver lake sunrise');
    expect(await img.getAttribute('srcset')).toMatch(/silver-lake-rainbow-reflection.*\.webp/);
    await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
  });

  test('the remaining placeholders stay designed and the page hero is unchanged', async ({ page }) => {
    await page.goto('/waterfront/');
    const holders = page.locator('[data-waterfront-gallery] [data-gallery-placeholder] [data-image-slot]');
    await expect(holders).toHaveCount(2);
    await expect(page.locator('[data-waterfront-gallery]')).not.toContainText('Morning light on a Rockford-area lake');
    await expect(page.locator('.page-hero img')).toHaveCount(0);
  });

  test('is operable by keyboard and by its buttons', async ({ page }) => {
    await page.goto('/waterfront/');
    const section = page.locator('[data-waterfront-gallery]');
    await section.scrollIntoViewIfNeeded();
    const track = section.locator('[data-track]');
    const status = section.locator('[data-status]');
    const prev = section.locator('[data-prev]');
    const next = section.locator('[data-next]');
    await expect(track).toHaveAttribute('tabindex', '0');
    await expect(status).toHaveText(/^Photo 1 of \d+$/);
    await expect(prev).toBeDisabled();

    await track.focus();
    await page.keyboard.press('ArrowRight');
    await expect(status).not.toHaveText(/^Photo 1 of/);
    await expect(prev).toBeEnabled();
    await page.keyboard.press('End');
    await expect(next).toBeDisabled();
    await page.keyboard.press('Home');
    await expect(status).toHaveText(/^Photo 1 of \d+$/);
    await expect(prev).toBeDisabled();

    await next.click();
    await expect(status).not.toHaveText(/^Photo 1 of/);
    await prev.click();
    await expect(status).toHaveText(/^Photo 1 of \d+$/);
  });

  test('controls are touch-sized, labelled, and the track scrolls natively', async ({ page }) => {
    await page.goto('/waterfront/');
    const section = page.locator('[data-waterfront-gallery]');
    await expect(section.locator('[data-prev]')).toHaveAttribute('aria-label', 'Previous photo');
    await expect(section.locator('[data-next]')).toHaveAttribute('aria-label', 'Next photo');
    for (const b of [section.locator('[data-prev]'), section.locator('[data-next]')]) {
      const box = await b.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const snaps = await section.locator('[data-track]').evaluate((e) => getComputedStyle(e).scrollSnapType);
    expect(snaps).toMatch(/x/);
    expect(await section.locator('[data-track]').evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
  });

  test('no horizontal page overflow', async ({ page }) => {
    for (const path of ['/waterfront/', '/waterfront/rockford-lakes/']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('East Grand Rapids community photography', () => {
  test('the hero leads with the clean Reeds Lake aerial, captioned and credited; the titled image is not shown', async ({ page }) => {
    await page.goto('/communities/east-grand-rapids/');
    const fig = page.locator('.chero__media figure.place');
    await expect(fig).toHaveAttribute('data-place-image', EGR_PHOTO);
    await expect(fig.locator('.photo-caption__text')).toHaveText('Reeds Lake, East Grand Rapids');
    await expect(fig.locator('.photo-caption__credit')).toHaveText('Photo: Amie Oren Real Estate');
    await expectQuietCredit(fig);
    const img = fig.locator('img');
    expect(((await img.getAttribute('alt')) ?? '').length).toBeGreaterThan(40);
    await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
    const html = await page.content();
    expect(html).not.toMatch(/east-grand-rapids-reeds-lake-titled-aerial/);
  });

  test('community cards show the photo without a caption, so card titles stay aligned', async ({ page }) => {
    await page.goto('/communities/');
    const card = page.locator('a.community-card[href="/communities/east-grand-rapids/"]');
    await expect(card.locator('figure.place')).toHaveAttribute('data-place-image', EGR_PHOTO);
    await expect(card.locator('.photo-caption__text')).toHaveCount(0);
    const tops = await page.locator('.community-card h3').evaluateAll((hs) => hs.map((h) => Math.round(h.getBoundingClientRect().top)));
    const firstRow = tops.filter((t) => Math.abs(t - tops[0]) < 200);
    expect(Math.max(...firstRow) - Math.min(...firstRow)).toBeLessThanOrEqual(2);
  });
});
