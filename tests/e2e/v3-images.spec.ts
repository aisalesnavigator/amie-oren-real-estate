import { test, expect, type Locator, type Page } from '@playwright/test';

const LAKE_PHOTO = /(silver-lake|lake-bella-vista)-(rainbow|sunset|sunrise)-reflection/;
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
  test('Silver Lake shows a primary and a secondary photo, Bella Vista shows its pair', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    const silver = await lakePhotos(page, 'silver-lake');
    await expect(silver).toHaveCount(2);
    await expect(silver.nth(0)).toHaveAttribute('data-place-image', 'silver-lake-rainbow-reflection');
    await expect(silver.nth(1)).toHaveAttribute('data-place-image', 'silver-lake-sunset-reflection');
    const bella = await lakePhotos(page, 'lake-bella-vista');
    await expect(bella).toHaveCount(2);
    await expect(bella.nth(0)).toHaveAttribute('data-place-image', 'lake-bella-vista-sunrise-reflection');
    await expect(bella.nth(1)).toHaveAttribute('data-place-image', 'lake-bella-vista-sunset-reflection');
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

  test('captions: Sunrise and Sunset for each lake, with the credit as a quiet secondary line', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    const expected: Record<string, string[]> = {
      'silver-lake': ['Silver Lake Sunrise', 'Silver Lake Sunset'],
      'lake-bella-vista': ['Lake Bella Vista Sunrise', 'Lake Bella Vista Sunset'],
    };
    for (const [id, captions] of Object.entries(expected)) {
      const figures = await lakePhotos(page, id);
      await expect(figures).toHaveCount(2);
      for (let i = 0; i < 2; i++) {
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
      await expect(page.locator('[data-place-image]')).toHaveCount(0);
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
      expect(s).not.toMatch(/silver-lake-sunset|lake-bella-vista/);
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
