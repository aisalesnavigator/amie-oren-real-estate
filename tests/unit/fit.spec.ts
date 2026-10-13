import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { communityProfiles, dimensions, fitQuestions } from '../../src/data/locationFit';
import { fitOrientation } from '../../src/data/fitOrientation';
import { communities } from '../../src/data/communities';
import { lakes } from '../../src/data/lakes';
import {
  cleanAnswers,
  computeFit,
  missingRequired,
  toSearchParams,
  visibleQuestions,
  type Answers,
} from '../../src/utils/fit';

// ---- Personas -----------------------------------------------------------------------------------

/** A — lake buyer: waterfront top priority, all-sports lake, some privacy, more upkeep OK, will drive. */
const personaA: Answers = {
  priorities: ['water', 'privacy', 'nature'],
  water_type: 'all_sports',
  setting: 'lake',
  home: 'open',
  drive: 'farther',
  care: 'waterfront',
  give_up: 'water',
};

/** B — walkable/character buyer. */
const personaB: Answers = {
  priorities: ['walkable', 'character', 'short_drive'],
  setting: 'connected',
  home: 'older_character',
  drive: 'shortest',
  care: 'typical',
  give_up: 'walkable',
};

/** C — wooded/privacy buyer. */
const personaC: Answers = {
  priorities: ['privacy', 'nature'],
  setting: 'wooded',
  home: 'updated',
  drive: 'farther',
  care: 'larger_lot',
  give_up: 'privacy',
};

/** D — river-oriented buyer. */
const personaD: Answers = {
  priorities: ['water', 'privacy', 'nature'],
  water_type: 'riverfront',
  setting: 'larger_lot',
  home: 'open',
  drive: 'moderate',
  care: 'larger_lot',
  give_up: 'nature',
};

/** E — village + space buyer. */
const personaE: Answers = {
  priorities: ['walkable', 'privacy'],
  setting: 'village',
  home: 'traditional',
  drive: 'moderate',
  care: 'typical',
  give_up: 'privacy',
};

const slugs = (a: Answers) => computeFit(a).results.map((r) => r.slug);

test.describe('question architecture and branching', () => {
  test('seven questions, with the water-setting question as the only branch', () => {
    expect(fitQuestions.map((q) => q.id)).toEqual(['priorities', 'water_type', 'setting', 'home', 'drive', 'care', 'give_up']);
    expect(fitQuestions.filter((q) => q.showIf).map((q) => q.id)).toEqual(['water_type']);
    expect(fitQuestions[0].type).toBe('multi');
    expect(fitQuestions[0].max).toBe(3);
  });

  test('the water question appears only when water is a top priority', () => {
    expect(visibleQuestions({ priorities: ['walkable'] }).map((q) => q.id)).not.toContain('water_type');
    expect(visibleQuestions({ priorities: ['water', 'walkable'] }).map((q) => q.id)).toContain('water_type');
    expect(visibleQuestions({}).length).toBe(6);
    expect(visibleQuestions({ priorities: ['water'] }).length).toBe(7);
  });

  test('a stale water answer is ignored once water is no longer a priority', () => {
    const answers = { ...personaB, water_type: 'all_sports' };
    expect(cleanAnswers(answers).water_type).toBeUndefined();
    expect(computeFit(answers)).toEqual(computeFit(personaB));
  });

  test('only one Grand Rapids proximity question remains', () => {
    const proximityQuestions = fitQuestions.filter((q) => q.options.some((o) => o.prefs.some((p) => p.dim === 'proximity')) && q.id !== 'priorities' && q.id !== 'give_up');
    expect(proximityQuestions.map((q) => q.id)).toEqual(['drive']);
  });

  test('“newer/updated” and “move-in ready” are distinct, and so are “lower maintenance” and “move-in ready”', () => {
    const q1 = fitQuestions[0].options;
    const dimOf = (v: string) => q1.find((o) => o.value === v)!.prefs.map((p) => p.dim);
    expect(dimOf('updated')).toEqual(['updated']);
    expect(dimOf('move_in_ready')).toEqual(['turnkey']);
    expect(dimOf('low_maintenance')).toEqual(['lowCare']);
  });

  test('required questions follow branching; Q1 needs at least one choice', () => {
    expect(missingRequired({}).map((q) => q.id)).toEqual(['priorities', 'setting', 'home', 'drive', 'care', 'give_up']);
    expect(missingRequired({ ...personaA, water_type: undefined }).map((q) => q.id)).toEqual(['water_type']);
    for (const p of [personaA, personaB, personaC, personaD, personaE]) expect(missingRequired(p)).toHaveLength(0);
  });
});

test.describe('personas', () => {
  test('A — lake buyer: Rockford is the strongest fit, with the lakes block', () => {
    const outcome = computeFit(personaA);
    expect(outcome.results[0].slug).toBe('rockford');
    expect(outcome.showRockfordLakes).toBe(true);
    expect(outcome.results[0].tourStop).toBe('all_sports');
  });

  test('B — walkable/character buyer: East Grand Rapids is the strongest fit', () => {
    expect(slugs(personaB)[0]).toBe('east-grand-rapids');
  });

  test('C — wooded/privacy buyer: Forest Hills and/or Ada lead; East Grand Rapids does not appear', () => {
    const s = slugs(personaC);
    expect(['forest-hills', 'ada']).toContain(s[0]);
    expect(s.slice(0, 2).filter((x) => x === 'forest-hills' || x === 'ada').length).toBeGreaterThanOrEqual(1);
    expect(s).not.toContain('east-grand-rapids');
  });

  test('D — river buyer: Ada leads, and Ada or Cascade outrank the lake-centric answer', () => {
    const s = slugs(personaD);
    expect(s[0]).toBe('ada');
    expect(s.slice(0, 3)).toEqual(expect.arrayContaining(['ada']));
    expect(s.indexOf('cascade') === -1 || s.indexOf('cascade') < 3).toBe(true);
  });

  test('E — village + space buyer: Ada is the strongest fit', () => {
    expect(slugs(personaE)[0]).toBe('ada');
  });

  test('changing the water type from all-sports lake to riverfront materially changes the ordering', () => {
    const lake = slugs(personaA);
    const river = slugs({ ...personaA, water_type: 'riverfront', setting: 'larger_lot', care: 'larger_lot', give_up: 'water' });
    expect(lake[0]).toBe('rockford');
    expect(river[0]).not.toBe('rockford');
    expect(['ada', 'cascade']).toContain(river[0]);
  });

  test('East Grand Rapids is not over-recommended for lake or privacy-led buyers', () => {
    expect(slugs(personaA)).not.toContain('east-grand-rapids');
    expect(slugs(personaC)).not.toContain('east-grand-rapids');
    expect(slugs(personaD)).not.toContain('east-grand-rapids');
    // "Near water" (not on it) is where Reeds Lake can legitimately help East Grand Rapids.
    const nearWater = slugs({ ...personaB, priorities: ['water', 'walkable', 'character'], water_type: 'near_water' });
    expect(nearWater[0]).toBe('east-grand-rapids');
  });

  test('each community can be the strongest fit for some reasonable set of answers', () => {
    const winners = new Set([personaA, personaB, personaC, personaD, personaE].map((p) => slugs(p)[0]));
    const cascadeLike: Answers = {
      priorities: ['short_drive', 'updated', 'nature'],
      setting: 'connected',
      home: 'move_in_ready',
      drive: 'shortest',
      care: 'typical',
      give_up: 'short_drive',
    };
    winners.add(slugs({ ...cascadeLike, priorities: ['water', 'short_drive', 'updated'], water_type: 'riverfront', give_up: 'water' })[0]);
    expect([...winners].sort()).toEqual(['ada', 'cascade', 'east-grand-rapids', 'forest-hills', 'rockford']);
  });
});

test.describe('engine behavior', () => {
  test('is deterministic and returns 2–3 distinct existing communities', () => {
    for (const p of [personaA, personaB, personaC, personaD, personaE]) {
      expect(computeFit(p)).toEqual(computeFit(p));
      const { results } = computeFit(p);
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.length).toBeLessThanOrEqual(3);
      expect(new Set(results.map((r) => r.slug)).size).toBe(results.length);
      results.forEach((r, i) => {
        expect(r.rank).toBe(i + 1);
        expect(r.position).toBe(i === 0 ? 'Strongest fit' : 'Also worth exploring');
        expect(communities.some((c) => c.slug === r.slug)).toBe(true);
      });
    }
  });

  test('Q7 breaks near-ties toward what the visitor would hate to give up', () => {
    const base: Answers = { priorities: ['updated'], setting: 'flexible', home: 'open', drive: 'not_deciding', care: 'flexible' };
    expect(slugs({ ...base, give_up: 'nature' })[0]).toBe('forest-hills');
    expect(slugs({ ...base, give_up: 'walkable' })[0]).not.toBe('forest-hills');
  });

  test('“Why it fits” has 2–4 items, each quoting one of the visitor’s own answers', () => {
    for (const p of [personaA, personaB, personaC, personaD, personaE]) {
      const chosenLabels = fitQuestions.flatMap((q) =>
        q.options.filter((o) => ([] as string[]).concat(p[q.id] ?? []).includes(o.value)).map((o) => o.label),
      );
      for (const r of computeFit(p).results) {
        expect(r.why.length).toBeGreaterThanOrEqual(2);
        expect(r.why.length).toBeLessThanOrEqual(4);
        for (const w of r.why) expect(chosenLabels).toContain(w.lead);
      }
    }
  });

  test('“What I’d want you to know” surfaces honest tradeoffs', () => {
    const egr = computeFit({ ...personaE, priorities: ['walkable', 'privacy', 'character'] }).results.find(
      (r) => r.slug === 'east-grand-rapids',
    );
    expect(egr?.know.join(' ')).toMatch(/Lots are typically more modest/);
  });

  test('the explanation never shows false-precision numbers', () => {
    for (const p of [personaA, personaB, personaC, personaD, personaE]) {
      for (const r of computeFit(p).results) {
        expect(JSON.stringify([r.explanation, r.why, r.know, r.tour])).not.toMatch(/\d+(\.\d+)?\s?%|score/i);
      }
    }
  });

  test('search params carry selections and results only, and the selected card', () => {
    const outcome = computeFit(personaA);
    const params = toSearchParams(personaA, outcome, 'rockford');
    expect(params.get('from')).toBe('fit');
    expect(params.get('fit_primary')).toBe('rockford');
    expect(params.get('selected')).toBe('rockford');
    expect(params.get('top_priorities')).toBe('water,privacy,nature');
    expect(params.get('water_type')).toBe('all_sports');
    expect(params.get('hardest_to_give_up')).toBe('water');
    expect([...params.keys()].join(' ')).not.toMatch(/name|email|phone/);
    // A skipped branch is never sent.
    expect(toSearchParams(personaB, computeFit(personaB)).has('water_type')).toBe(false);
  });
});

test.describe('“If I were showing you the area…”', () => {
  test('each community has a base orientation and is personalized by the visitor’s answers', () => {
    const rockfordWalk = computeFit({ ...personaA, give_up: 'walkable', priorities: ['water', 'walkable'] }).results.find((r) => r.slug === 'rockford')!;
    const rockfordNature = computeFit({ ...personaA, give_up: 'nature' }).results.find((r) => r.slug === 'rockford')!;
    const rockfordBoat = computeFit(personaA).results.find((r) => r.slug === 'rockford')!;
    const rockfordSpace = computeFit({ ...personaA, give_up: 'privacy' }).results.find((r) => r.slug === 'rockford')!;
    for (const r of [rockfordWalk, rockfordNature, rockfordBoat, rockfordSpace]) {
      expect(r.tour).toContain('Lake Bella Vista, Silver Lake and Bostwick Lake');
    }
    expect(rockfordWalk.tour).toMatch(/dam overlook on Bridge Street/);
    expect(rockfordNature.tour).toMatch(/White Pine Trail/);
    expect(rockfordBoat.tour).toMatch(/activity levels, launch arrangements and lake rules/);
    expect(rockfordSpace.tour).toMatch(/more wooded, spacious settings/);
    expect(new Set([rockfordWalk.tour, rockfordNature.tour, rockfordBoat.tour, rockfordSpace.tour]).size).toBe(4);
  });

  test('every community’s tour names its anchor places', () => {
    const anchors: Record<string, RegExp> = {
      rockford: /Lake Bella Vista/,
      ada: /Ada Village.*Covered Bridge.*Thornapple/,
      'east-grand-rapids': /Gaslight Village.*Reeds Lake/,
      cascade: /Thornapple River/,
      'forest-hills': /wooded, larger-lot/,
    };
    for (const [slug, re] of Object.entries(anchors)) expect(fitOrientation[slug].tour.base).toMatch(re);
  });

  test('East Grand Rapids makes clear its lake living differs from Rockford’s', () => {
    expect(fitOrientation['east-grand-rapids'].tour.base).toMatch(/one lake.*different from Rockford/);
  });
});

test.describe('fair-housing guardrails', () => {
  const prohibited =
    /\b(age|aged|ages|elderly|senior|seniors|retire\w*|children|child|kids?|famil(y|ies)|parent\w*|married|marital|spouse|school\w*|church\w*|religio\w*|race|racial|ethnic\w*|nationalit\w*|gender|disab\w*|handicap\w*|crime|safe|safety|diverse|diversity|demograph\w*|young|empty.?nest\w*|native|immigrant\w*)\b/i;

  test('questions, options, profiles and all result content contain no prohibited terms', () => {
    const corpus = JSON.stringify({ fitQuestions, communityProfiles, fitOrientation });
    const hit = corpus.match(prohibited);
    expect(hit, `Prohibited term in Location Fit content: ${hit?.[0]}`).toBeNull();
  });

  test('the source files contain no prohibited terms outside the documented guardrail comments', () => {
    for (const file of ['src/data/locationFit.ts', 'src/data/fitOrientation.ts']) {
      const code = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      expect(code.match(prohibited), file).toBeNull();
    }
  });

  test('generated results for many answer combinations contain no prohibited terms', () => {
    let checked = 0;
    const q = Object.fromEntries(fitQuestions.map((x) => [x.id, x.options.map((o) => o.value)]));
    for (let seed = 0; seed < 120; seed++) {
      const pr = q.priorities;
      const answers: Answers = {
        priorities: [pr[seed % pr.length], pr[(seed * 5 + 2) % pr.length]],
        water_type: q.water_type[seed % q.water_type.length],
        setting: q.setting[(seed * 3) % q.setting.length],
        home: q.home[(seed * 7) % q.home.length],
        drive: q.drive[seed % q.drive.length],
        care: q.care[(seed * 2) % q.care.length],
        give_up: q.give_up[(seed * 11) % q.give_up.length],
      };
      for (const r of computeFit(answers).results) {
        expect(JSON.stringify(r)).not.toMatch(prohibited);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(200);
  });

  test('every profile covers every dimension and maps to a real community with orientation content', () => {
    for (const p of communityProfiles) {
      expect(Object.keys(p.values).sort()).toEqual([...dimensions].sort());
      expect(communities.some((c) => c.slug === p.slug)).toBe(true);
      expect(fitOrientation[p.slug]).toBeTruthy();
    }
  });
});

test.describe('lake data discipline', () => {
  test('five Rockford-area lakes exist; result content states no lake acreage, depths or rules', () => {
    expect(lakes.map((l) => l.name)).toEqual(['Bostwick Lake', 'Silver Lake', 'Lake Bella Vista', 'Myers Lake', 'Brower Lake']);
    const text = JSON.stringify(fitOrientation);
    expect(text).not.toMatch(/\d+\s?(acres?|feet|ft)\b/i);
    expect(text).not.toMatch(/no[- ]wake|horsepower|all[- ]sports lake\b(?! \/)/i);
  });
});
