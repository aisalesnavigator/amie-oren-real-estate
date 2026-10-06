import { test, expect } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { placeImageCredits } from '../../src/data/placeImages';
import { galleryItems, galleryPlaceholders } from '../../src/data/waterfrontGallery';
import { galleryMode, isApproved, orderGallery } from '../../src/utils/galleryRules';
import { communities } from '../../src/data/communities';
import { lakes } from '../../src/data/lakes';

const root = process.cwd(); // Playwright runs from the repository root (see playwright.config.ts)
const placesDir = join(root, 'src', 'assets', 'places');
const galleryDir = join(root, 'src', 'assets', 'waterfront');
const imageFile = /\.(jpe?g|png|webp)$/i;
const stemOf = (f: string) => f.replace(imageFile, '');

test.describe('place image rights register', () => {
  const slugs = new Set([...communities.map((c) => c.slug), ...lakes.map((l) => l.slug)]);

  test('every registered image has a file, a known place, alt text and an approval basis', () => {
    const present = readdirSync(placesDir).filter((f) => imageFile.test(f)).map(stemOf);
    for (const [stem, c] of Object.entries(placeImageCredits)) {
      expect(present, `file for ${stem}`).toContain(stem);
      expect(stem.startsWith(c.slug), `${stem} should be named for its place (${c.slug})`).toBe(true);
      expect(slugs.has(c.slug)).toBe(true);
      expect(c.alt.length).toBeGreaterThan(40);
      expect(c.credit.length).toBeGreaterThan(2);
      expect(c.license).toMatch(/owned|licensed|public domain|creative commons/i);
      expect(['owned-approved', 'licensed', 'public-domain', 'creative-commons']).toContain(c.approval);
    }
  });

  test('no photo file exists without a rights entry (nothing unregistered can ship)', () => {
    for (const f of readdirSync(placesDir).filter((f) => imageFile.test(f))) {
      expect(Object.keys(placeImageCredits), `rights entry for ${f}`).toContain(stemOf(f));
    }
  });

  test('each place has at most one primary photo', () => {
    const primaries = Object.values(placeImageCredits).filter((c) => c.role === 'primary').map((c) => c.slug);
    expect(new Set(primaries).size).toBe(primaries.length);
  });

  test('the owner-supplied photos belong to the right lakes and roles', () => {
    const by = (slug: string) => Object.entries(placeImageCredits).filter(([, c]) => c.slug === slug).map(([s, c]) => `${c.role}:${s}`).sort();
    expect(by('silver-lake')).toEqual(['primary:silver-lake-rainbow-reflection', 'secondary:silver-lake-sunset-reflection']);
    expect(by('lake-bella-vista')).toEqual([
      'primary:lake-bella-vista-sunrise-reflection',
      'secondary:lake-bella-vista-sunset-reflection',
    ]);
    // Lake photos are never registered against a community (so heroes, cards and the homepage cannot use them).
    for (const c of Object.values(placeImageCredits)) expect(communities.map((x) => x.slug)).not.toContain(c.slug);
  });
});

test.describe('waterfront gallery data', () => {
  test('entries are complete, unique and rights-labelled', () => {
    const ids = galleryItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of galleryItems) {
      for (const k of ['id', 'file', 'lake', 'caption', 'alt'] as const) expect(i[k].length, `${i.id}.${k}`).toBeGreaterThan(1);
      expect(['owned-approved', 'licensed-approved', 'pending-approval']).toContain(i.status);
      expect(i.file).toMatch(imageFile);
    }
  });

  test('every approved entry has its file; pending entries never display', () => {
    const present = existsSync(galleryDir) ? readdirSync(galleryDir) : [];
    for (const i of galleryItems.filter((i) => isApproved(i.status))) expect(present, `file for ${i.id}`).toContain(i.file);
    expect(isApproved('pending-approval')).toBe(false);
  });

  test('the lake-section photos are not in the overall gallery unless explicitly approved', () => {
    const lakeFiles = readdirSync(placesDir).filter((f) => imageFile.test(f));
    const used = galleryItems.map((i) => i.file.toLowerCase());
    for (const f of lakeFiles) expect(used, `${f} should stay in its lake section`).not.toContain(f.toLowerCase());
    for (const f of used) expect(f).not.toMatch(/silver-lake-(rainbow|sunset)|lake-bella-vista-(sunrise|sunset)/);
  });

  test('layout mode adapts to the number of photos so it never looks empty', () => {
    expect(galleryMode(0)).toBe('empty');
    expect(galleryMode(1)).toBe('few');
    expect(galleryMode(2)).toBe('few');
    expect(galleryMode(3)).toBe('carousel');
    expect(galleryMode(12)).toBe('carousel');
    expect(galleryPlaceholders.length).toBeGreaterThanOrEqual(3);
  });

  test('featured photos come first, otherwise the data order is kept', () => {
    const out = orderGallery([{ id: 'a' }, { id: 'b', featured: true }, { id: 'c' }, { id: 'd', featured: true }] as { id: string; featured?: boolean }[]);
    expect(out.map((i) => i.id)).toEqual(['b', 'd', 'a', 'c']);
  });
});
