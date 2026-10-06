import { test, expect } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { placeImageCredits } from '../../src/data/placeImages';
import { galleryItems, galleryPlaceholders, type WaterfrontGalleryItem } from '../../src/data/waterfrontGallery';
import { MIN_SLIDES, fillerPlaceholders, galleryMode, isApproved, orderGallery, resolveGalleryMeta } from '../../src/utils/galleryRules';
import { creditLine, photoCaption, placeName } from '../../src/utils/photoCaption';
import { communities } from '../../src/data/communities';
import { lakes } from '../../src/data/lakes';

const root = process.cwd(); // Playwright runs from the repository root (see playwright.config.ts)
const placesDir = join(root, 'src', 'assets', 'places');
const galleryDir = join(root, 'src', 'assets', 'waterfront');
const imageFile = /\.(jpe?g|png|webp)$/i;
const stemOf = (f: string) => f.replace(imageFile, '');
const listImages = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => imageFile.test(f)) : []);

test.describe('place image rights register', () => {
  const slugs = new Set([...communities.map((c) => c.slug), ...lakes.map((l) => l.slug)]);

  test('every registered image has a file, a known place, a moment, alt text and an approval basis', () => {
    const present = listImages(placesDir).map(stemOf);
    for (const [stem, c] of Object.entries(placeImageCredits)) {
      expect(present, `file for ${stem}`).toContain(stem);
      expect(stem.startsWith(c.slug), `${stem} should be named for its place (${c.slug})`).toBe(true);
      expect(slugs.has(c.slug)).toBe(true);
      expect(['sunrise', 'sunset', 'other']).toContain(c.moment);
      expect(c.alt.length).toBeGreaterThan(40);
      expect(c.credit.length).toBeGreaterThan(2);
      expect(c.license).toMatch(/owned|licensed|public domain|creative commons/i);
      expect(['owned-approved', 'licensed', 'public-domain', 'creative-commons']).toContain(c.approval);
    }
  });

  test('alt text describes the scene and is not just the caption', () => {
    for (const [stem, c] of Object.entries(placeImageCredits)) {
      const caption = photoCaption({ place: placeName(c.slug) ?? c.slug, moment: c.moment, caption: c.caption });
      expect(c.alt.toLowerCase(), `${stem} alt should not equal its caption`).not.toBe(caption.toLowerCase());
      expect(c.alt.split(/\s+/).length, `${stem} alt should be a real description`).toBeGreaterThanOrEqual(8);
      expect(c.alt, `${stem} alt must not be the credit`).not.toMatch(/^photo:/i);
    }
  });

  test('no photo file exists without a rights entry (nothing unregistered can ship)', () => {
    for (const f of listImages(placesDir)) {
      expect(Object.keys(placeImageCredits), `rights entry for ${f}`).toContain(stemOf(f));
    }
  });

  test('each place has at most one primary photo', () => {
    const primaries = Object.values(placeImageCredits).filter((c) => c.role === 'primary').map((c) => c.slug);
    expect(new Set(primaries).size).toBe(primaries.length);
  });

  test('lake convention: at most one sunrise and one sunset photo per lake, sunrise as primary', () => {
    for (const lake of lakes) {
      const mine = Object.values(placeImageCredits).filter((c) => c.slug === lake.slug);
      expect(mine.filter((c) => c.moment === 'sunrise').length, `${lake.name} sunrise photos`).toBeLessThanOrEqual(1);
      expect(mine.filter((c) => c.moment === 'sunset').length, `${lake.name} sunset photos`).toBeLessThanOrEqual(1);
      for (const c of mine.filter((c) => c.moment === 'sunrise')) expect(c.role).toBe('primary');
      if (mine.some((c) => c.moment === 'sunrise')) for (const c of mine.filter((c) => c.moment === 'sunset')) expect(c.role).toBe('secondary');
    }
  });

  test('the owner-supplied photos are captioned Silver Lake / Lake Bella Vista Sunrise and Sunset', () => {
    const caption = (stem: string) => {
      const c = placeImageCredits[stem];
      return photoCaption({ place: placeName(c.slug)!, moment: c.moment, caption: c.caption });
    };
    expect(caption('silver-lake-rainbow-reflection')).toBe('Silver Lake Sunrise');
    expect(caption('silver-lake-sunset-reflection')).toBe('Silver Lake Sunset');
    expect(caption('lake-bella-vista-sunrise-reflection')).toBe('Lake Bella Vista Sunrise');
    expect(caption('lake-bella-vista-sunset-reflection')).toBe('Lake Bella Vista Sunset');
    // Files were not renamed to achieve the captions.
    expect(listImages(placesDir).sort()).toEqual([
      'lake-bella-vista-sunrise-reflection.jpg',
      'lake-bella-vista-sunset-reflection.jpg',
      'silver-lake-rainbow-reflection.jpg',
      'silver-lake-sunset-reflection.jpg',
    ]);
    // Lake photos are never registered against a community (so heroes, cards and the homepage cannot use them).
    for (const c of Object.values(placeImageCredits)) expect(communities.map((x) => x.slug)).not.toContain(c.slug);
  });

  test('captions derive from place and moment; the credit is a separate, quiet line', () => {
    expect(photoCaption({ place: 'Bostwick Lake', moment: 'sunrise' })).toBe('Bostwick Lake Sunrise');
    expect(photoCaption({ place: 'Bostwick Lake', moment: 'sunset' })).toBe('Bostwick Lake Sunset');
    expect(photoCaption({ place: 'Myers Lake', moment: 'other' })).toBe('Myers Lake');
    expect(photoCaption({ place: 'Myers Lake', moment: 'sunrise', caption: 'Fog on Myers Lake' })).toBe('Fog on Myers Lake');
    expect(creditLine('Amie Oren Real Estate')).toBe('Photo: Amie Oren Real Estate');
  });
});

test.describe('photo privacy', () => {
  test('image files carry no EXIF/GPS metadata', async () => {
    const all = [...listImages(placesDir).map((f) => join(placesDir, f)), ...listImages(galleryDir).map((f) => join(galleryDir, f))];
    expect(all.length).toBeGreaterThan(0);
    for (const file of all) {
      const meta = await sharp(file).metadata();
      expect(meta.exif, `${file} has EXIF data; strip it (sharp(input).rotate().toFile(output)) before adding`).toBeUndefined();
    }
  });
});

test.describe('waterfront gallery data', () => {
  test('entries are unique and complete (register reference, or a full gallery-only entry)', () => {
    const ids = galleryItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of galleryItems) {
      expect(['owned-approved', 'licensed-approved', 'pending-approval']).toContain(i.status);
      const meta = resolveGalleryMeta(i, placeImageCredits);
      expect(meta, `${i.id} must reference a register photo or supply file, lake, alt and credit`).toBeDefined();
      expect(meta!.caption.length).toBeGreaterThan(3);
      expect(meta!.alt.length).toBeGreaterThan(40);
      expect(meta!.alt.toLowerCase()).not.toBe(meta!.caption.toLowerCase());
    }
  });

  test('every approved entry has its image file (register photo or src/assets/waterfront)', () => {
    const gallery = listImages(galleryDir);
    const places = listImages(placesDir).map(stemOf);
    for (const i of galleryItems.filter((i) => isApproved(i.status))) {
      const meta = resolveGalleryMeta(i, placeImageCredits)!;
      if (meta.source.kind === 'place') expect(places, `${i.id} -> ${meta.source.stem}`).toContain(meta.source.stem);
      else expect(gallery, `${i.id} -> ${meta.source.file}`).toContain(meta.source.file);
    }
    expect(isApproved('pending-approval')).toBe(false);
  });

  test('the first gallery photo is Silver Lake Sunrise, reusing the registered file without a copy', () => {
    const first = orderGallery(galleryItems.filter((i) => isApproved(i.status)))[0];
    const meta = resolveGalleryMeta(first, placeImageCredits)!;
    expect(first.featured).toBe(true);
    expect(meta.source).toEqual({ kind: 'place', stem: 'silver-lake-rainbow-reflection' });
    expect(meta.caption).toBe('Silver Lake Sunrise');
    expect(meta.credit).toBe('Amie Oren Real Estate');
    expect(listImages(galleryDir), 'no duplicate copy of the photo').toEqual([]);
  });

  test('only the explicitly approved lake photo is reused in the gallery', () => {
    const reused = galleryItems.map((i) => i.placePhoto).filter(Boolean);
    expect(reused).toEqual(['silver-lake-rainbow-reflection']);
  });

  test('a gallery-only entry is resolved with a derived caption, e.g. Bostwick Lake Sunrise', () => {
    const entry: WaterfrontGalleryItem = {
      id: 'bostwick-lake-sunrise',
      file: 'bostwick-lake-sunrise.jpg',
      lake: 'Bostwick Lake',
      moment: 'sunrise',
      alt: 'Mist lifting off Bostwick Lake as the first light reaches the far shoreline.',
      credit: 'Amie Oren Real Estate',
      status: 'owned-approved',
    };
    const meta = resolveGalleryMeta(entry, placeImageCredits)!;
    expect(meta.caption).toBe('Bostwick Lake Sunrise');
    expect(meta.source).toEqual({ kind: 'gallery', file: 'bostwick-lake-sunrise.jpg' });
    expect(resolveGalleryMeta({ ...entry, alt: undefined }, placeImageCredits)).toBeUndefined();
    expect(resolveGalleryMeta({ id: 'x', placePhoto: 'nope', status: 'owned-approved' }, placeImageCredits)).toBeUndefined();
  });

  test('there is no maximum: the layout mode and filler logic scale with any number of photos', () => {
    expect(MIN_SLIDES).toBe(3);
    expect(galleryPlaceholders.length).toBeGreaterThanOrEqual(MIN_SLIDES);
    expect(galleryMode(0)).toBe('empty');
    expect(galleryMode(1)).toBe('partial');
    expect(galleryMode(2)).toBe('partial');
    for (const n of [3, 4, 8, 12, 50, 500]) {
      expect(galleryMode(n)).toBe('full');
      expect(fillerPlaceholders(n, galleryPlaceholders)).toEqual([]);
    }
  });

  test('each real photo replaces the next placeholder; the carousel is padded to three slides', () => {
    const names = galleryPlaceholders.map((p) => p.caption);
    expect(fillerPlaceholders(0, galleryPlaceholders).map((p) => p.caption)).toEqual(names);
    expect(fillerPlaceholders(1, galleryPlaceholders).map((p) => p.caption)).toEqual(names.slice(1));
    expect(fillerPlaceholders(2, galleryPlaceholders).map((p) => p.caption)).toEqual(names.slice(2));
    for (const n of [0, 1, 2]) expect(n + fillerPlaceholders(n, galleryPlaceholders).length).toBe(3);
  });

  test('featured photos come first, otherwise the data order is kept', () => {
    const out = orderGallery([{ id: 'a' }, { id: 'b', featured: true }, { id: 'c' }, { id: 'd', featured: true }] as { id: string; featured?: boolean }[]);
    expect(out.map((i) => i.id)).toEqual(['b', 'd', 'a', 'c']);
  });
});
