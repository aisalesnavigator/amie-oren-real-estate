import { test, expect, type Page } from '@playwright/test';

const LAKE_PHOTO = /(silver-lake|lake-bella-vista)-(rainbow|sunset|sunrise)-reflection/;
const otherPages = [
  '/', '/about/', '/buying/', '/selling/', '/communities/', '/communities/rockford/', '/communities/ada/',
  '/communities/east-grand-rapids/', '/communities/cascade/', '/communities/forest-hills/', '/waterfront/',
  '/find-your-fit/', '/home-search/', '/contact/', '/client-experiences/',
];

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

  test('photos have meaningful alt text, a credit line and optimized responsive sources', async ({ page }) => {
    await page.goto('/waterfront/rockford-lakes/');
    for (const id of ['silver-lake', 'lake-bella-vista']) {
      const imgs = (await lakePhotos(page, id)).locator('img');
      for (let i = 0; i < (await imgs.count()); i++) {
        const img = imgs.nth(i);
        expect(((await img.getAttribute('alt')) ?? '').length).toBeGreaterThan(40);
        expect(await img.getAttribute('srcset')).toMatch(/\.webp/);
        expect(await img.getAttribute('sizes')).toBeTruthy();
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
      }
      await expect(page.locator(`#${id} .place__credit`).first()).toContainText('Photo:');
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

  test('the /waterfront/ hero area has no photograph', async ({ page }) => {
    await page.goto('/waterfront/');
    await expect(page.locator('.page-hero img')).toHaveCount(0);
    await expect(page.locator('.page-hero [data-place-image]')).toHaveCount(0);
  });
});

test.describe('/waterfront/ gallery', () => {
  test('renders as an accessible carousel region in a designed state', async ({ page }) => {
    await page.goto('/waterfront/');
    const section = page.locator('[data-waterfront-gallery]');
    await expect(section).toHaveCount(1);
    await expect(section).toHaveAttribute('data-mode', /^(empty|few|carousel)$/);
    const region = section.locator('[role="region"][aria-roledescription="carousel"]');
    await expect(region).toHaveAttribute('aria-label', 'Waterfront photography');
    const slides = region.locator('[role="group"][aria-roledescription="slide"]');
    expect(await slides.count()).toBeGreaterThanOrEqual(3);
    await expect(slides.first()).toHaveAttribute('aria-label', /^1 of \d+$/);
    await expect(section.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('the overall gallery is not populated with the lake-section photos', async ({ page }) => {
    await page.goto('/waterfront/');
    await expect(page.locator('[data-waterfront-gallery] [data-gallery-item]')).toHaveCount(0);
    await expect(page.locator('[data-waterfront-gallery] [data-mode="empty"], [data-waterfront-gallery][data-mode="empty"]').first()).toBeAttached();
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
