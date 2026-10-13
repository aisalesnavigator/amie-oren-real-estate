/**
 * "Find Your West Michigan Fit": questions, branching, and community profiles.
 *
 * HOW IT WORKS (deterministic, local, explainable; no AI or network calls):
 *  - Each answer contributes PREFERENCES: { dim, target (0..1), weight }.
 *  - Each community has a PROFILE: a 0..1 value per dimension (how strongly that trait characterizes it).
 *  - Preferences on the same dimension are merged, then a community's score is the weighted average of
 *    (1 - |target - value|). Question 1 (top priorities) carries the most weight; question 7 is a
 *    tie-breaker plus a modest extra signal.
 *  - Each concept is measured by ONE dimension (water types are split, but walkability, privacy and
 *    Grand Rapids proximity each appear once), so no community wins by being counted twice.
 *
 * Result copy (reasons, orientation, "If I were showing you the area…") lives in
 * src/data/fitOrientation.ts. Sources for factual statements: docs/LOCATION_FIT_SOURCES.md.
 *
 * FAIR HOUSING BOUNDARY: property and lifestyle preferences only. Never add questions, answers,
 * dimensions or text about protected characteristics or their proxies (age, family status, children,
 * schools, religion, race, ethnicity, national origin, sex/gender, disability, crime/safety perceptions,
 * demographics). See docs/LOCATION_FIT_GUIDELINES.md. A test scans this file and fitOrientation.ts.
 *
 * Profile values are editorial judgments for Amie to review. Change them freely.
 */

export type Dimension =
  /** Depth and variety of the inland-lake waterfront market (several lakes to choose among). */
  | 'lakeDepth'
  /** Lakes where boating is a central part of lake life. */
  | 'allSports'
  /** Quieter inland-lake settings. */
  | 'quietLake'
  /** River frontage and river-oriented settings. */
  | 'river'
  /** Enjoying water nearby (parks, trails, public access) without owning waterfront. */
  | 'nearWater'
  /** Overall water presence, used when no water type is specified. */
  | 'waterGeneral'
  /** Walkable restaurants, coffee, and a recognizable town center. */
  | 'village'
  /** Connected, neighborhood-style streets. */
  | 'connected'
  /** Larger lots and privacy. */
  | 'space'
  /** Trails, woods, and natural surroundings. */
  | 'nature'
  /** Older homes with architectural character. */
  | 'character'
  /** Newer or recently updated homes (age/style/renovation state). */
  | 'updated'
  /** Move-in-ready options (willingness to take on projects). Mostly a search filter. */
  | 'turnkey'
  /** Lower ongoing property burden available (smaller lots, simpler properties). */
  | 'lowCare'
  /** A shorter, easier drive to central Grand Rapids. */
  | 'proximity';

export const dimensions: Dimension[] = [
  'lakeDepth', 'allSports', 'quietLake', 'river', 'nearWater', 'waterGeneral', 'village', 'connected',
  'space', 'nature', 'character', 'updated', 'turnkey', 'lowCare', 'proximity',
];

export interface Preference {
  dim: Dimension;
  /** 0..1: where on the dimension the visitor's preference sits. */
  target: number;
  /** Importance. Q1 priorities = 3; branch = 3; setting = 2; others smaller. */
  weight: number;
}

export interface FitOption {
  value: string;
  label: string;
  hint?: string;
  prefs: Preference[];
  /** Q7 only: use the visitor's chosen water type (scaled) instead of `prefs`, when one exists. */
  useWaterType?: boolean;
  /** Q7 only: the dimension used to break near-ties. */
  tieBreak?: Dimension;
}

export interface FitQuestion {
  id: string;
  /** Name of the hidden field sent with the saved-search request. Keep stable. */
  formField: string;
  prompt: string;
  /** Short label used in the saved-search summary Amie receives. */
  summaryLabel: string;
  help?: string;
  type: 'single' | 'multi';
  /** For multi: maximum number of choices. */
  max?: number;
  required: boolean;
  /** Branching: show this question only when another answer includes a value. */
  showIf?: { question: string; includes: string };
  options: FitOption[];
}

const p = (dim: Dimension, target: number, weight: number): Preference => ({ dim, target, weight });

/** Weight multiplier applied to the water-type preferences when Q7 says water is hardest to give up. */
export const TIE_BREAK_WATER_SCALE = 0.5;

export const fitQuestions: FitQuestion[] = [
  {
    id: 'priorities',
    formField: 'top_priorities',
    prompt: 'What matters most to you?',
    summaryLabel: 'Top priorities',
    help: 'Choose up to three.',
    type: 'multi',
    max: 3,
    required: true,
    options: [
      { value: 'water', label: 'Waterfront or water access', prefs: [] /* refined by the water-setting question */ },
      { value: 'walkable', label: 'Walkable restaurants, coffee, and town-center feel', prefs: [p('village', 1, 3)] },
      { value: 'privacy', label: 'Larger lot and privacy', prefs: [p('space', 1, 3)] },
      { value: 'character', label: 'Architectural character', prefs: [p('character', 1, 3)] },
      { value: 'updated', label: 'Newer or updated home', prefs: [p('updated', 1, 3)] },
      {
        value: 'move_in_ready',
        label: 'Move-in ready / minimal projects',
        hint: 'How much work you want to take on when you move in.',
        prefs: [p('turnkey', 1, 1.5)],
      },
      {
        value: 'low_maintenance',
        label: 'Lower-maintenance property',
        hint: 'Less ongoing yard, grounds, and property care over time.',
        prefs: [p('lowCare', 1, 3)],
      },
      { value: 'short_drive', label: 'Shorter drive to Grand Rapids', prefs: [p('proximity', 1, 3)] },
      { value: 'nature', label: 'Trails, woods, and natural surroundings', prefs: [p('nature', 1, 3)] },
    ],
  },
  {
    id: 'water_type',
    formField: 'water_type',
    prompt: 'What kind of water setting are you most drawn to?',
    summaryLabel: 'Water setting',
    type: 'single',
    required: true,
    showIf: { question: 'priorities', includes: 'water' },
    options: [
      { value: 'all_sports', label: 'All-sports lake / boating', prefs: [p('allSports', 1, 3), p('lakeDepth', 1, 1)] },
      { value: 'quiet_lake', label: 'Quieter inland lake', prefs: [p('quietLake', 1, 3), p('lakeDepth', 1, 1)] },
      { value: 'riverfront', label: 'Riverfront', prefs: [p('river', 1, 3)] },
      { value: 'near_water', label: 'Near water, but not necessarily on it', prefs: [p('nearWater', 1, 3)] },
      { value: 'any_water', label: 'Open to any of these', prefs: [p('waterGeneral', 1, 3)] },
    ],
  },
  {
    id: 'setting',
    formField: 'setting',
    prompt: 'Which setting feels most like home to you?',
    summaryLabel: 'Setting',
    type: 'single',
    required: true,
    options: [
      { value: 'village', label: 'Walkable village or town-center', hint: 'Shops and dining within an easy walk.', prefs: [p('village', 1, 2)] },
      { value: 'connected', label: 'Connected neighborhood', hint: 'Sidewalks, neighbors, and streets that link together.', prefs: [p('connected', 1, 2)] },
      { value: 'larger_lot', label: 'Larger lot with some privacy', hint: 'More room between you and the next home.', prefs: [p('space', 1, 2)] },
      { value: 'wooded', label: 'Wooded and private', hint: 'Trees, quiet, and natural surroundings.', prefs: [p('nature', 1, 2), p('space', 1, 1)] },
      { value: 'lake', label: 'Lake-centered', hint: 'Daily life organized around the water.', prefs: [p('lakeDepth', 1, 2)] },
      { value: 'flexible', label: 'Flexible', prefs: [] },
    ],
  },
  {
    id: 'home',
    formField: 'home_preference',
    prompt: 'What kind of home are you most drawn to?',
    summaryLabel: 'Home preference',
    type: 'single',
    required: true,
    options: [
      { value: 'older_character', label: 'Older home with architectural character', prefs: [p('character', 1, 1.5)] },
      { value: 'traditional', label: 'Established, traditional home', prefs: [p('character', 0.6, 1)] },
      { value: 'updated', label: 'Newer or recently updated home', prefs: [p('updated', 1, 1.5)] },
      { value: 'move_in_ready', label: 'Move-in ready with minimal projects', prefs: [p('turnkey', 1, 1)] },
      { value: 'open', label: 'I’m open to different styles and conditions', prefs: [] },
    ],
  },
  {
    id: 'drive',
    formField: 'drive_tradeoff',
    prompt: 'How much are you willing to trade a shorter drive to Grand Rapids for the right setting, space, or water?',
    summaryLabel: 'Drive to Grand Rapids',
    type: 'single',
    required: true,
    options: [
      { value: 'shortest', label: 'I prefer the shortest, easiest drive possible', prefs: [p('proximity', 1, 2.5)] },
      { value: 'moderate', label: 'A moderate drive is fine', prefs: [p('proximity', 0.6, 1)] },
      { value: 'farther', label: 'I’m happy to drive farther for the right property or setting', prefs: [p('proximity', 0.25, 0.75)] },
      { value: 'not_deciding', label: 'Not a deciding factor', prefs: [] },
    ],
  },
  {
    id: 'care',
    formField: 'property_care',
    prompt: 'How much property care are you comfortable taking on?',
    summaryLabel: 'Property care',
    type: 'single',
    required: true,
    options: [
      { value: 'easy', label: 'I want something easy to maintain', prefs: [p('lowCare', 1, 2)] },
      { value: 'typical', label: 'A typical yard and normal upkeep are fine', prefs: [p('lowCare', 0.55, 0.75)] },
      { value: 'larger_lot', label: 'I’m comfortable with a larger lot or wooded property', prefs: [p('space', 1, 0.75), p('nature', 1, 0.5)] },
      {
        value: 'waterfront',
        label: 'I’m comfortable with waterfront upkeep like shoreline, dock, or seawall care',
        prefs: [p('lakeDepth', 1, 0.75)],
      },
      { value: 'flexible', label: 'Flexible', prefs: [] },
    ],
  },
  {
    id: 'give_up',
    formField: 'hardest_to_give_up',
    prompt: 'What would be hardest for you to give up?',
    summaryLabel: 'Hardest to give up',
    type: 'single',
    required: true,
    options: [
      { value: 'water', label: 'Being on or very near the water', prefs: [p('waterGeneral', 1, 1.5)], useWaterType: true, tieBreak: 'waterGeneral' },
      { value: 'walkable', label: 'Walking to restaurants, coffee, and a town center', prefs: [p('village', 1, 1.5)], tieBreak: 'village' },
      { value: 'privacy', label: 'Privacy and room around the home', prefs: [p('space', 1, 1.5)], tieBreak: 'space' },
      { value: 'character', label: 'Architectural character', prefs: [p('character', 1, 1.5)], tieBreak: 'character' },
      { value: 'short_drive', label: 'A shorter drive to Grand Rapids', prefs: [p('proximity', 1, 1.5)], tieBreak: 'proximity' },
      { value: 'nature', label: 'Trails, woods, and natural surroundings', prefs: [p('nature', 1, 1.5)], tieBreak: 'nature' },
    ],
  },
];

export interface CommunityProfile {
  slug: string;
  name: string;
  values: Record<Dimension, number>;
}

/**
 * Profiles. Rationale for the main distinctions (see docs/LOCATION_FIT_SOURCES.md):
 *  - Rockford: several Rockford-area lakes to choose among (deep, varied lake market), a walkable
 *    downtown on the Rogue River, the White Pine Trail, larger lots; a longer drive to the city.
 *  - Ada: a compact walkable village where the Thornapple meets the Grand River, larger wooded lots,
 *    township parks and preserves. Water here means rivers, not inland lakes.
 *  - East Grand Rapids: walkable Gaslight Village, connected neighborhoods, older architecture, the
 *    shortest drive to the city. One lake (Reeds Lake): strong for "near water", NOT a broad lake market.
 *  - Cascade: Thornapple River, township pathways and parks, a balance of access and space; no single
 *    village center on the scale of Ada or Gaslight Village.
 *  - Forest Hills: larger wooded lots, natural areas and trails, space; water and walkable centers are
 *    not defining features.
 */
export const communityProfiles: CommunityProfile[] = [
  {
    slug: 'rockford',
    name: 'Rockford',
    values: {
      lakeDepth: 1, allSports: 0.9, quietLake: 0.9, river: 0.55, nearWater: 0.9, waterGeneral: 1,
      village: 0.7, connected: 0.5, space: 0.8, nature: 0.85, character: 0.45, updated: 0.65,
      turnkey: 0.6, lowCare: 0.4, proximity: 0.3,
    },
  },
  {
    slug: 'ada',
    name: 'Ada',
    values: {
      lakeDepth: 0.15, allSports: 0.1, quietLake: 0.15, river: 0.9, nearWater: 0.75, waterGeneral: 0.55,
      village: 0.85, connected: 0.45, space: 0.85, nature: 0.85, character: 0.5, updated: 0.7,
      turnkey: 0.65, lowCare: 0.35, proximity: 0.55,
    },
  },
  {
    slug: 'east-grand-rapids',
    name: 'East Grand Rapids',
    values: {
      lakeDepth: 0.2, allSports: 0.35, quietLake: 0.45, river: 0, nearWater: 0.85, waterGeneral: 0.6,
      village: 1, connected: 0.95, space: 0.2, nature: 0.35, character: 0.9, updated: 0.45,
      turnkey: 0.45, lowCare: 0.6, proximity: 1,
    },
  },
  {
    slug: 'cascade',
    name: 'Cascade',
    values: {
      lakeDepth: 0.1, allSports: 0.1, quietLake: 0.1, river: 0.8, nearWater: 0.6, waterGeneral: 0.45,
      village: 0.45, connected: 0.65, space: 0.65, nature: 0.65, character: 0.4, updated: 0.65,
      turnkey: 0.6, lowCare: 0.55, proximity: 0.75,
    },
  },
  {
    slug: 'forest-hills',
    name: 'Forest Hills',
    values: {
      lakeDepth: 0.05, allSports: 0.05, quietLake: 0.1, river: 0.35, nearWater: 0.4, waterGeneral: 0.3,
      village: 0.2, connected: 0.55, space: 0.9, nature: 0.9, character: 0.35, updated: 0.75,
      turnkey: 0.65, lowCare: 0.4, proximity: 0.55,
    },
  },
];
