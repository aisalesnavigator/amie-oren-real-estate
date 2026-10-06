import {
  communityProfiles,
  dimensionLabels,
  fitQuestions,
  type CommunityProfile,
  type Dimension,
  type FitQuestion,
  type Preference,
} from '../data/locationFit';

/** Answers keyed by question id. Single = one option value; multi = array of option values. */
export type Answers = Record<string, string | string[] | undefined>;

export interface FitResult {
  slug: string;
  name: string;
  rank: 1 | 2 | 3;
  /** Internal score (0..1). Never shown to visitors: it would imply false precision. */
  score: number;
  explanation: string;
  matches: string[];
  considerations: string[];
}

export interface FitOutcome {
  results: FitResult[];
  /** True when Rockford leads AND water is a stated priority. */
  showRockfordLakes: boolean;
  waterPriority: boolean;
}

const asArray = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []);

/** Collect every preference implied by the visitor's answers. */
export function collectPreferences(answers: Answers, questions: FitQuestion[] = fitQuestions): Preference[] {
  const prefs: Preference[] = [];
  for (const q of questions) {
    const chosen = asArray(answers[q.id]).slice(0, q.type === 'multi' ? (q.max ?? 3) : 1);
    for (const value of chosen) {
      const option = q.options.find((o) => o.value === value);
      if (option) prefs.push(...option.prefs);
    }
  }
  return prefs;
}

/** Merge preferences on the same dimension: summed weight, weighted-average target. */
function mergeByDimension(prefs: Preference[]): Preference[] {
  const map = new Map<Dimension, { w: number; tw: number }>();
  for (const pref of prefs) {
    const cur = map.get(pref.dim) ?? { w: 0, tw: 0 };
    cur.w += pref.weight;
    cur.tw += pref.weight * pref.target;
    map.set(pref.dim, cur);
  }
  return [...map.entries()].map(([dim, { w, tw }]) => ({ dim, weight: w, target: tw / w }));
}

const closeness = (pref: Preference, profile: CommunityProfile): number =>
  1 - Math.abs(pref.target - profile.values[pref.dim]);

function score(prefs: Preference[], profile: CommunityProfile): number {
  const total = prefs.reduce((n, p) => n + p.weight, 0);
  if (total === 0) return 0;
  return prefs.reduce((n, p) => n + p.weight * closeness(p, profile), 0) / total;
}

function phraseFor(pref: Preference): string {
  const labels = dimensionLabels[pref.dim];
  return pref.target >= 0.65 ? labels.high : pref.target <= 0.35 ? labels.low : labels.mid;
}

const joinList = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

function explain(profile: CommunityProfile, rank: number, matched: Preference[]): string {
  if (matched.length === 0) {
    return `${profile.name} is worth comparing alongside the others, since your answers leave a lot of room and it offers a distinct combination of setting and housing.`;
  }
  const strong = matched.some((m) => m.weight >= 2.5);
  const lead =
    rank === 1
      ? `${profile.name} rises to the top because you ${strong ? 'placed a high value on' : 'mentioned'}`
      : `${profile.name} may also appeal because you ${strong ? 'value' : 'mentioned'}`;
  return `${lead} ${joinList(matched.map(phraseFor))}.`;
}

export function computeFit(
  answers: Answers,
  profiles: CommunityProfile[] = communityProfiles,
  questions: FitQuestion[] = fitQuestions,
): FitOutcome {
  const prefs = mergeByDimension(collectPreferences(answers, questions));

  const ranked = profiles
    .map((profile, index) => ({ profile, index, score: score(prefs, profile) }))
    // Deterministic: higher score first, then the configured order of communities.
    .sort((a, b) => b.score - a.score || a.index - b.index);

  // Always show two; show a third only when it is close to the leader.
  const top = ranked[0]?.score ?? 0;
  const shown = ranked.filter((r, i) => i < 2 || (i === 2 && r.score >= top - 0.1)).slice(0, 3);

  const results: FitResult[] = shown.map(({ profile, score: s }, i) => {
    const matched = prefs
      .filter((p) => closeness(p, profile) >= 0.75)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
    const considerations = prefs
      .filter((p) => p.weight >= 1.5 && closeness(p, profile) < 0.5)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 2)
      .map(
        (p) =>
          profile.tradeoffs[p.dim] ??
          `On ${phraseFor(p)}, ${profile.name} may differ from what you described, so it is worth comparing in person.`,
      );
    return {
      slug: profile.slug,
      name: profile.name,
      rank: (i + 1) as 1 | 2 | 3,
      score: s,
      explanation: explain(profile, i + 1, matched),
      matches: matched.map(phraseFor),
      considerations,
    };
  });

  const water = asArray(answers.water)[0];
  const priorities = asArray(answers.priorities);
  const waterPriority =
    water === 'waterfront' || water === 'nearby' || priorities.includes('waterfront') || asArray(answers.recreation)[0] === 'lakes';

  return {
    results,
    waterPriority,
    showRockfordLakes: results[0]?.slug === 'rockford' && waterPriority,
  };
}

/** Which required questions are still unanswered? */
export function missingRequired(answers: Answers, questions: FitQuestion[] = fitQuestions): FitQuestion[] {
  return questions.filter((q) => q.required && asArray(answers[q.id]).length === 0);
}

/**
 * Query parameters handed to /home-search/. Contains preference selections only,
 * never personal information.
 */
export function toSearchParams(answers: Answers, outcome: FitOutcome, questions: FitQuestion[] = fitQuestions): URLSearchParams {
  const params = new URLSearchParams();
  params.set('from', 'fit');
  params.set('fit_primary', outcome.results[0]?.slug ?? '');
  const secondary = outcome.results.slice(1).map((r) => r.slug);
  if (secondary.length) params.set('fit_secondary', secondary.join(','));
  for (const q of questions) {
    const values = asArray(answers[q.id]);
    if (values.length) params.set(q.formField, values.join(','));
  }
  return params;
}
