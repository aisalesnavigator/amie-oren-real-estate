import { test, expect } from '@playwright/test';
import { communityProfiles, dimensionLabels, fitQuestions } from '../../src/data/locationFit';
import { communities } from '../../src/data/communities';
import { lakes } from '../../src/data/lakes';
import { computeFit, missingRequired, toSearchParams, type Answers } from '../../src/utils/fit';

const rockfordWater: Answers = {
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

const egrCloseIn: Answers = {
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

const woodedPrivate: Answers = {
  water: 'not_important',
  village: 'separation',
  lot: 'large',
  character: 'open',
  maintenance: 'more_property',
  access: 'trade',
  recreation: 'trails',
  setting: 'wooded',
  priorities: ['privacy', 'larger_lot'],
};

test.describe('fit engine', () => {
  test('is deterministic', () => {
    expect(computeFit(rockfordWater)).toEqual(computeFit(rockfordWater));
    expect(computeFit(egrCloseIn)).toEqual(computeFit(egrCloseIn));
  });

  test('returns two or three distinct communities that exist', () => {
    for (const answers of [rockfordWater, egrCloseIn, woodedPrivate]) {
      const { results } = computeFit(answers);
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.length).toBeLessThanOrEqual(3);
      expect(new Set(results.map((r) => r.slug)).size).toBe(results.length);
      for (const r of results) expect(communities.some((c) => c.slug === r.slug)).toBe(true);
      expect(results.map((r) => r.rank)).toEqual(results.map((_, i) => i + 1));
    }
  });

  test('water-heavy scenario leads with Rockford and shows the lakes block', () => {
    const outcome = computeFit(rockfordWater);
    expect(outcome.results[0].slug).toBe('rockford');
    expect(outcome.waterPriority).toBe(true);
    expect(outcome.showRockfordLakes).toBe(true);
    expect(outcome.results[0].explanation).toMatch(/^Rockford rises to the top because/);
  });

  test('close-in / walkability scenario leads with East Grand Rapids and no lakes block', () => {
    const outcome = computeFit(egrCloseIn);
    expect(outcome.results[0].slug).toBe('east-grand-rapids');
    expect(outcome.showRockfordLakes).toBe(false);
  });

  test('wooded / private scenario favors larger-lot communities', () => {
    const slugs = computeFit(woodedPrivate).results.map((r) => r.slug);
    expect(slugs[0]).toBe('forest-hills');
    expect(slugs).not.toContain('east-grand-rapids');
  });

  test('explanations come from the visitor’s answers and surface honest considerations', () => {
    const egr = computeFit(egrCloseIn).results[0];
    expect(egr.matches.length).toBeGreaterThan(0);
    expect(egr.explanation.toLowerCase()).toContain('restaurants');
    // In the water-heavy scenario, the close-in community should not simply be affirmed.
    const all = computeFit({ ...rockfordWater, village: 'very', lot: 'large' }).results;
    expect(all.some((r) => r.considerations.length > 0)).toBe(true);
  });

  test('never exposes false-precision percentages in explanations', () => {
    for (const answers of [rockfordWater, egrCloseIn, woodedPrivate]) {
      for (const r of computeFit(answers).results) {
        expect(JSON.stringify([r.explanation, r.matches, r.considerations])).not.toMatch(/\d+(\.\d+)?\s?%/);
      }
    }
  });

  test('required questions are enforced; the priorities question is optional', () => {
    const missing = missingRequired({}).map((q) => q.id);
    expect(missing).toContain('water');
    expect(missing).not.toContain('priorities');
    expect(missingRequired(rockfordWater)).toHaveLength(0);
  });

  test('search params carry preference selections and results only', () => {
    const outcome = computeFit(rockfordWater);
    const params = toSearchParams(rockfordWater, outcome);
    expect(params.get('from')).toBe('fit');
    expect(params.get('fit_primary')).toBe('rockford');
    expect(params.get('water_priority')).toBe('waterfront');
    expect(params.get('priorities')).toBe('waterfront,outdoor_recreation');
    expect([...params.keys()].join(' ')).not.toMatch(/name|email|phone/);
  });

  test('every profile covers every dimension and every answer maps to known dimensions', () => {
    const dims = Object.keys(dimensionLabels);
    for (const p of communityProfiles) {
      expect(Object.keys(p.values).sort()).toEqual([...dims].sort());
      expect(communities.some((c) => c.slug === p.slug)).toBe(true);
    }
    for (const q of fitQuestions) for (const o of q.options) for (const pref of o.prefs) expect(dims).toContain(pref.dim);
  });
});

test.describe('fair-housing guardrails', () => {
  // Terms that must never appear in Location Fit questions, answers, labels, or profile text.
  const prohibited =
    /\b(age|aged|ages|elderly|senior|seniors|retire\w*|children|child|kids?|famil(y|ies)|parent\w*|married|marital|spouse|school\w*|church\w*|religio\w*|race|racial|ethnic\w*|nationalit\w*|gender|disab\w*|handicap\w*|crime|safe|safety|diverse|diversity|demograph\w*|young|empty.?nest\w*|native|immigrant\w*)\b/i;

  test('questions, options, labels and profile text contain no prohibited terms', () => {
    const corpus = JSON.stringify({ fitQuestions, communityProfiles, dimensionLabels });
    const hit = corpus.match(prohibited);
    expect(hit, `Prohibited term in Location Fit configuration: ${hit?.[0]}`).toBeNull();
  });

  test('generated explanations for many answer combinations contain no prohibited terms', () => {
    const singles = fitQuestions.filter((q) => q.type === 'single');
    let checked = 0;
    for (let seed = 0; seed < 60; seed++) {
      const answers: Answers = {};
      singles.forEach((q, i) => {
        answers[q.id] = q.options[(seed * 7 + i * 3) % q.options.length].value;
      });
      for (const r of computeFit(answers).results) {
        expect(JSON.stringify(r)).not.toMatch(prohibited);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(100);
  });
});

test.describe('lake data discipline', () => {
  test('five Rockford-area lakes exist and state no unverified facts', () => {
    expect(lakes.map((l) => l.name)).toEqual(['Bostwick Lake', 'Silver Lake', 'Lake Bella Vista', 'Myers Lake', 'Brower Lake']);
    for (const l of lakes) {
      expect(l.verifiedFacts).toEqual([]);
      const text = JSON.stringify(l);
      expect(text).not.toMatch(/\d+\s?(acres?|feet|ft|miles?)\b/i);
      expect(text).not.toMatch(/\$\d/);
      expect(text).not.toMatch(/no[- ]wake|horsepower|public access|private lake/i);
    }
  });
});
