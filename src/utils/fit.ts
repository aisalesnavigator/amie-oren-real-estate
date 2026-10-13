import {
  communityProfiles,
  fitQuestions,
  TIE_BREAK_WATER_SCALE,
  type CommunityProfile,
  type Dimension,
  type FitQuestion,
  type Preference,
} from '../data/locationFit';
import { fitOrientation, type StopKey } from '../data/fitOrientation';

/** Answers keyed by question id. Single = one option value; multi = array of option values. */
export type Answers = Record<string, string | string[] | undefined>;

/** A preference plus where it came from, so explanations can quote the visitor's own answers. */
export interface SourcedPreference extends Preference {
  sources: { question: string; value: string; label: string; weight: number }[];
}

export interface WhyItem {
  /** The visitor's own answer this is based on. */
  lead: string;
  /** Why that answer fits this community. */
  text: string;
}

export interface FitResult {
  slug: string;
  name: string;
  rank: 1 | 2 | 3;
  position: 'Strongest fit' | 'Also worth exploring';
  /** Internal score (0..1). Never shown to visitors: it would imply false precision. */
  score: number;
  /** One-sentence summary built from the visitor's answers. */
  explanation: string;
  /** "Why it fits": 2–4 items tied to specific answers. */
  why: WhyItem[];
  /** "What I’d want you to know": relevant tradeoffs first, then orientation facts. */
  know: string[];
  /** "If I were showing you the area…": general orientation + a personalized stop. */
  tour: string;
  /** Which personalized stop was chosen (for transparency and tests). */
  tourStop: StopKey | null;
}

export interface FitOutcome {
  results: FitResult[];
  /** Water was a top priority or the hardest thing to give up. */
  waterPriority: boolean;
  waterType?: string;
  /** Rockford is among the leading results and lake water (not river-only) is a priority. */
  showRockfordLakes: boolean;
}

const asArray = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []);
const first = (answers: Answers, id: string): string | undefined => asArray(answers[id])[0];

/** Questions the visitor actually sees, given their answers so far (branching). */
export function visibleQuestions(answers: Answers, questions: FitQuestion[] = fitQuestions): FitQuestion[] {
  return questions.filter((q) => !q.showIf || asArray(answers[q.showIf.question]).includes(q.showIf.includes));
}

/** Required visible questions still unanswered. */
export function missingRequired(answers: Answers, questions: FitQuestion[] = fitQuestions): FitQuestion[] {
  return visibleQuestions(answers, questions).filter((q) => q.required && asArray(answers[q.id]).length === 0);
}

/** Answers limited to visible questions and allowed counts (drops a stale water answer, for example). */
export function cleanAnswers(answers: Answers, questions: FitQuestion[] = fitQuestions): Answers {
  const out: Answers = {};
  for (const q of visibleQuestions(answers, questions)) {
    const values = asArray(answers[q.id])
      .filter((v) => q.options.some((o) => o.value === v))
      .slice(0, q.type === 'multi' ? (q.max ?? 3) : 1);
    if (values.length) out[q.id] = q.type === 'multi' ? values : values[0];
  }
  return out;
}

/** Collect every preference implied by the visitor's (cleaned) answers, merged per dimension. */
export function collectPreferences(raw: Answers, questions: FitQuestion[] = fitQuestions): SourcedPreference[] {
  const answers = cleanAnswers(raw, questions);
  const waterTypeQ = questions.find((q) => q.id === 'water_type');
  const waterTypeOption = waterTypeQ?.options.find((o) => o.value === first(answers, 'water_type'));
  const items: { pref: Preference; question: string; value: string; label: string }[] = [];

  for (const q of visibleQuestions(answers, questions)) {
    for (const value of asArray(answers[q.id])) {
      const option = q.options.find((o) => o.value === value)!;
      let prefs = option.prefs;
      if (option.useWaterType && waterTypeOption) {
        prefs = waterTypeOption.prefs.map((pr) => ({ ...pr, weight: pr.weight * TIE_BREAK_WATER_SCALE }));
      }
      // A water priority without a water type (should not happen in the UI) falls back to general water.
      if (q.id === 'priorities' && value === 'water' && !waterTypeOption) prefs = [{ dim: 'waterGeneral', target: 1, weight: 3 }];
      for (const pref of prefs) items.push({ pref, question: q.id, value, label: option.label });
    }
  }

  const map = new Map<Dimension, SourcedPreference>();
  for (const { pref, question, value, label } of items) {
    const cur = map.get(pref.dim) ?? { dim: pref.dim, target: 0, weight: 0, sources: [] };
    const totalTarget = cur.target * cur.weight + pref.target * pref.weight;
    cur.weight += pref.weight;
    cur.target = totalTarget / cur.weight;
    cur.sources.push({ question, value, label, weight: pref.weight });
    map.set(pref.dim, cur);
  }
  for (const pref of map.values()) pref.sources.sort((a, b) => b.weight - a.weight);
  return [...map.values()];
}

const closeness = (pref: Preference, profile: CommunityProfile): number =>
  1 - Math.abs(pref.target - profile.values[pref.dim]);

function score(prefs: Preference[], profile: CommunityProfile): number {
  const total = prefs.reduce((n, p) => n + p.weight, 0);
  if (total === 0) return 0;
  return prefs.reduce((n, p) => n + p.weight * closeness(p, profile), 0) / total;
}

const WATER_DIMS = new Set<Dimension>(['lakeDepth', 'allSports', 'quietLake', 'river', 'nearWater', 'waterGeneral']);

/** Near-ties (within this margin) are broken by the "hardest to give up" answer. */
const TIE_MARGIN = 0.01;
/** A third community is shown only when it is this close to the leader. */
const THIRD_MARGIN = 0.06;

const priorityStop: Record<string, StopKey> = {
  walkable: 'village',
  privacy: 'space',
  character: 'character',
  updated: 'updated',
  move_in_ready: 'turnkey',
  low_maintenance: 'lowCare',
  short_drive: 'proximity',
  nature: 'nature',
};
const settingStop: Record<string, StopKey> = {
  village: 'village',
  connected: 'connected',
  larger_lot: 'space',
  wooded: 'nature',
  lake: 'any_water',
};

/** Candidate personalized stops, strongest signal first. */
function stopCandidates(answers: Answers, questions: FitQuestion[]): StopKey[] {
  const keys: StopKey[] = [];
  const waterType = first(answers, 'water_type') as StopKey | undefined;
  const giveUp = questions.find((q) => q.id === 'give_up')?.options.find((o) => o.value === first(answers, 'give_up'));
  if (giveUp) keys.push(giveUp.value === 'water' ? (waterType ?? 'any_water') : (giveUp.tieBreak as StopKey));
  for (const value of asArray(answers.priorities)) keys.push(value === 'water' ? (waterType ?? 'any_water') : priorityStop[value]);
  const setting = settingStop[first(answers, 'setting') ?? ''];
  if (setting) keys.push(setting);
  if (first(answers, 'drive') === 'shortest') keys.push('proximity');
  return keys.filter(Boolean);
}

function buildResult(
  profile: CommunityProfile,
  rank: number,
  s: number,
  prefs: SourcedPreference[],
  answers: Answers,
  questions: FitQuestion[],
): FitResult {
  const content = fitOrientation[profile.slug];
  const byWeight = [...prefs].sort((a, b) => b.weight - a.weight);

  // Why it fits: preferences this community matches well, most important first, each tied to an answer.
  const pick = (threshold: number) =>
    byWeight.filter((p) => closeness(p, profile) >= threshold && content.reasons[p.dim] && p.target >= 0.5);
  let matched = pick(0.7);
  if (matched.length < 2) matched = pick(0.55);
  const why: WhyItem[] = matched.slice(0, 4).map((p) => ({ lead: p.sources[0].label, text: content.reasons[p.dim]! }));

  // What I'd want you to know: tradeoffs for strongly stated preferences it fits less well, then facts.
  // At most one water-related tradeoff, so a card never repeats the same caveat in different words.
  let waterTradeoffUsed = false;
  const tradeoffs = byWeight
    .filter((p) => p.weight >= 1.5 && closeness(p, profile) < 0.5 && content.tradeoffs[p.dim])
    .filter((p) => {
      if (!WATER_DIMS.has(p.dim)) return true;
      if (waterTradeoffUsed) return false;
      return (waterTradeoffUsed = true);
    })
    .slice(0, 2)
    .map((p) => content.tradeoffs[p.dim]!);
  const know = [...tradeoffs, ...content.know].slice(0, 4);

  // If I were showing you the area: general orientation + the first personalized stop this area has.
  const stop = stopCandidates(answers, questions).find((k) => content.tour.stops[k]) ?? null;
  const tour = `${content.tour.base} ${stop ? content.tour.stops[stop] : content.tour.fallback}`;

  const leads = why.slice(0, 2).map((w) => `“${w.lead.toLowerCase()}”`);
  const explanation =
    leads.length === 0
      ? `${profile.name} is worth exploring alongside the others, since it offers a distinct combination of setting and housing.`
      : rank === 1
        ? `${profile.name} rises to the top because of what you told me: ${leads.join(' and ')}.`
        : `${profile.name} is also worth exploring because of ${leads.join(' and ')}.`;

  return {
    slug: profile.slug,
    name: profile.name,
    rank: rank as 1 | 2 | 3,
    position: rank === 1 ? 'Strongest fit' : 'Also worth exploring',
    score: s,
    explanation,
    why,
    know,
    tour,
    tourStop: stop,
  };
}

export function computeFit(
  raw: Answers,
  profiles: CommunityProfile[] = communityProfiles,
  questions: FitQuestion[] = fitQuestions,
): FitOutcome {
  const answers = cleanAnswers(raw, questions);
  const prefs = collectPreferences(answers, questions);
  const tieDim = questions.find((q) => q.id === 'give_up')?.options.find((o) => o.value === first(answers, 'give_up'))?.tieBreak;

  const ranked = profiles
    .map((profile, index) => ({ profile, index, score: score(prefs, profile) }))
    .sort((a, b) => {
      if (Math.abs(b.score - a.score) >= TIE_MARGIN) return b.score - a.score;
      // Deterministic tie-break: what the visitor said would be hardest to give up, then configured order.
      const t = tieDim ? b.profile.values[tieDim] - a.profile.values[tieDim] : 0;
      return t || b.score - a.score || a.index - b.index;
    });

  const top = ranked[0]?.score ?? 0;
  const shown = ranked.filter((r, i) => i < 2 || (i === 2 && r.score >= top - THIRD_MARGIN)).slice(0, 3);
  const results = shown.map((r, i) => buildResult(r.profile, i + 1, r.score, prefs, answers, questions));

  const waterType = first(answers, 'water_type');
  const waterPriority = asArray(answers.priorities).includes('water') || first(answers, 'give_up') === 'water';
  const rockfordLeading = results.slice(0, 2).some((r) => r.slug === 'rockford');

  return {
    results,
    waterPriority,
    waterType,
    showRockfordLakes: rockfordLeading && waterPriority && waterType !== 'riverfront',
  };
}

/**
 * Query parameters handed to /home-search/. Preference selections and results only, never personal
 * information. `selected` is the community whose card CTA was used.
 */
export function toSearchParams(
  raw: Answers,
  outcome: FitOutcome,
  selected?: string,
  questions: FitQuestion[] = fitQuestions,
): URLSearchParams {
  const answers = cleanAnswers(raw, questions);
  const params = new URLSearchParams();
  params.set('from', 'fit');
  params.set('fit_primary', outcome.results[0]?.slug ?? '');
  const secondary = outcome.results.slice(1).map((r) => r.slug);
  if (secondary.length) params.set('fit_secondary', secondary.join(','));
  if (selected) params.set('selected', selected);
  for (const q of visibleQuestions(answers, questions)) {
    const values = asArray(answers[q.id]);
    if (values.length) params.set(q.formField, values.join(','));
  }
  return params;
}
