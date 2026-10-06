import { test, expect } from '@playwright/test';
import { communities } from '../../src/data/communities';
import { communityResources } from '../../src/data/communityResources';
import { fitQuestions, communityProfiles, dimensionLabels } from '../../src/data/locationFit';

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
  test('“close-in” no longer appears in any user-facing Location Fit text', () => {
    const corpus = JSON.stringify({ fitQuestions, communityProfiles, dimensionLabels });
    // Internal identifiers (`close_in`, `setting_closein`) have no hyphen or space, so they do not match.
    expect(corpus).not.toMatch(/close[- ]in(?!\w)/i);
  });

  test('the setting question states what “closer in” means in plain language', () => {
    const setting = fitQuestions.find((q) => q.id === 'setting')!;
    const closer = setting.options.find((o) => o.value === 'close_in')!;
    expect(closer.label).toBe('Closer to Grand Rapids and everyday amenities');
    expect(closer.hint).toMatch(/restaurants, shopping/i);
    // The proximity-versus-space dimension survives: the other options still describe distinct settings.
    expect(setting.options.map((o) => o.value)).toEqual(['close_in', 'village', 'lake', 'wooded', 'flexible']);
  });
});
