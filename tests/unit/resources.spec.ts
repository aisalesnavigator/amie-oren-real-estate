import { test, expect } from '@playwright/test';
import { communities } from '../../src/data/communities';
import { communityResources } from '../../src/data/communityResources';
import { fitQuestions, communityProfiles } from '../../src/data/locationFit';
import { fitOrientation } from '../../src/data/fitOrientation';

// Directories, portals and lead-generation sites are not acceptable outbound resources.
const lowQualityHosts = /(zillow|realtor\.com|redfin|trulia|homes\.com|movoto|niche\.com|yelp|tripadvisor|facebook|linkedin|nextdoor|apartments\.com|marketgrandrapids|polarisrealestate|lucashoward)/i;

// Community/lifestyle copy must stay about property and place, never about who lives there.
const demographicLanguage =
  /\b(best for|families|family|kids?|children|young professionals?|retire\w*|seniors?|safe|safest|safety|crime|schools?|demographic\w*)\b/i;

test.describe('community resource links (data)', () => {
  test('every community has 2–4 unique https links to a non-directory host', () => {
    for (const c of communities) {
      const set = communityResources[c.slug];
      expect(set, `resources for ${c.slug}`).toBeDefined();
      expect(set.links.length).toBeGreaterThanOrEqual(2);
      expect(set.links.length).toBeLessThanOrEqual(4);
      const hrefs = set.links.map((l) => l.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
      for (const l of set.links) {
        expect(l.href).toMatch(/^https:\/\//);
        expect(new URL(l.href).host).not.toMatch(lowQualityHosts);
        expect(l.label.length).toBeGreaterThan(2);
        expect(l.source.length).toBeGreaterThan(2);
        expect(l.description.length).toBeGreaterThan(10);
      }
    }
  });

  test('resource copy uses neutral place and property language', () => {
    expect(JSON.stringify(communityResources)).not.toMatch(demographicLanguage);
  });

  test('no resource data exists for an unknown community', () => {
    const slugs = communities.map((c) => c.slug).sort();
    expect(Object.keys(communityResources).sort()).toEqual(slugs);
  });
});

test.describe('Location Fit plain-language setting wording', () => {
  test('“close-in” does not appear in any user-facing Location Fit text', () => {
    const corpus = JSON.stringify({ fitQuestions, communityProfiles, fitOrientation });
    expect(corpus).not.toMatch(/close[- ]in(?!\w)/i);
  });

  test('the setting question offers distinct, plainly described settings', () => {
    const setting = fitQuestions.find((q) => q.id === 'setting')!;
    expect(setting.prompt).toBe('Which setting feels most like home to you?');
    expect(setting.options.map((o) => o.value)).toEqual(['village', 'connected', 'larger_lot', 'wooded', 'lake', 'flexible']);
    for (const o of setting.options.filter((x) => x.value !== 'flexible')) expect(o.hint, o.value).toBeTruthy();
  });
});
