/**
 * "Find Your West Michigan Fit": editable configuration.
 *
 * HOW IT WORKS (deterministic, local, explainable):
 *  - Each answer contributes one or more PREFERENCES: { dim, target (0..1), weight }.
 *  - Each community has a PROFILE: a 0..1 value for every dimension (how strongly that
 *    dimension characterizes the community).
 *  - A community's score is the weighted average of (1 - |target - profileValue|) over all preferences.
 *  - The top 2-3 communities are shown, with explanations generated from the visitor's own answers.
 *
 * FAIR HOUSING BOUNDARY: dimensions and questions describe PROPERTY and LIFESTYLE PREFERENCES only.
 * Never add questions, answers, dimensions, or profile text about protected characteristics or their
 * proxies (age, family status, children, schools, religion, race, ethnicity, national origin, sex/gender,
 * disability, crime/safety perceptions, demographics). See docs/LOCATION_FIT_GUIDELINES.md. A test
 * scans this file for prohibited terms.
 *
 * Profile values are editorial judgments and should be reviewed by Amie. Change them freely, since
 * nothing else depends on the exact numbers.
 */

export type Dimension =
  | 'water'
  | 'village'
  | 'space'
  | 'character'
  | 'upkeep'
  | 'centrality'
  | 'outdoors'
  | 'setting_closein'
  | 'setting_village'
  | 'setting_lake'
  | 'setting_wooded';

export interface Preference {
  dim: Dimension;
  /** 0..1: where on the dimension the visitor's preference sits. */
  target: number;
  /** Importance. ~1 = mild, 2 = clear, 3 = strong. */
  weight: number;
}

export interface FitOption {
  value: string;
  label: string;
  hint?: string;
  prefs: Preference[];
}

export interface FitQuestion {
  id: string;
  /** Name of the hidden field sent with the saved-search request. */
  formField: string;
  prompt: string;
  help?: string;
  type: 'single' | 'multi';
  /** For multi: maximum number of choices. */
  max?: number;
  required: boolean;
  options: FitOption[];
}

export const dimensionLabels: Record<Dimension, { high: string; mid: string; low: string }> = {
  water: {
    high: 'being on or close to the water',
    mid: 'some access to water',
    low: 'not needing to be near water',
  },
  village: {
    high: 'easy access to restaurants, coffee, and a recognizable community center',
    mid: 'a village or town center within reach',
    low: 'more separation from busy centers',
  },
  space: {
    high: 'a larger lot and more privacy',
    mid: 'some room around you',
    low: 'a connected neighborhood',
  },
  character: {
    high: 'older homes with architectural character',
    mid: 'established, traditional homes',
    low: 'newer or updated homes',
  },
  upkeep: {
    high: 'having more property to care for',
    mid: 'moderate upkeep',
    low: 'lower-maintenance living',
  },
  centrality: {
    high: 'convenient access to central Grand Rapids',
    mid: 'reasonable access to central Grand Rapids',
    low: 'trading proximity for setting and space',
  },
  outdoors: {
    high: 'trails and outdoor recreation close at hand',
    mid: 'some access to the outdoors',
    low: 'the home and property itself over nearby recreation',
  },
  setting_closein: { high: 'a close-in, connected setting', mid: 'a close-in, connected setting', low: 'a close-in, connected setting' },
  setting_village: { high: 'a village- or community-centered setting', mid: 'a village- or community-centered setting', low: 'a village- or community-centered setting' },
  setting_lake: { high: 'a lake-centered setting', mid: 'a lake-centered setting', low: 'a lake-centered setting' },
  setting_wooded: { high: 'a wooded, private setting', mid: 'a wooded, private setting', low: 'a wooded, private setting' },
};

const p = (dim: Dimension, target: number, weight: number): Preference => ({ dim, target, weight });

export const fitQuestions: FitQuestion[] = [
  {
    id: 'water',
    formField: 'water_priority',
    prompt: 'How important is being on or close to water?',
    type: 'single',
    required: true,
    options: [
      { value: 'waterfront', label: 'I want waterfront if possible', prefs: [p('water', 1, 3)] },
      { value: 'nearby', label: 'I want water and recreation nearby', prefs: [p('water', 0.8, 2)] },
      { value: 'nice', label: 'It would be nice to have', prefs: [p('water', 0.6, 1)] },
      { value: 'not_important', label: 'Not important', prefs: [] },
    ],
  },
  {
    id: 'village',
    formField: 'walkability',
    prompt: 'How important is it to reach restaurants, coffee, shopping, or a recognizable community center easily?',
    type: 'single',
    required: true,
    options: [
      { value: 'very', label: 'Very important', prefs: [p('village', 1, 3)] },
      { value: 'somewhat', label: 'Somewhat important', prefs: [p('village', 0.7, 2)] },
      { value: 'not_deciding', label: 'Not a deciding factor', prefs: [] },
      { value: 'separation', label: 'I prefer more separation and privacy', prefs: [p('village', 0.1, 2)] },
    ],
  },
  {
    id: 'lot',
    formField: 'privacy_preference',
    prompt: 'Which feels more appealing?',
    type: 'single',
    required: true,
    options: [
      { value: 'connected', label: 'A connected neighborhood', prefs: [p('space', 0.15, 2)] },
      { value: 'some_room', label: 'Some room around me', prefs: [p('space', 0.5, 2)] },
      { value: 'large', label: 'A larger lot and privacy', prefs: [p('space', 1, 3)] },
      { value: 'flexible', label: 'Flexible', prefs: [] },
    ],
  },
  {
    id: 'character',
    formField: 'home_character',
    prompt: 'Which housing direction appeals most?',
    type: 'single',
    required: true,
    options: [
      { value: 'older', label: 'Older homes with architectural character', prefs: [p('character', 1, 2)] },
      { value: 'traditional', label: 'Established, traditional homes', prefs: [p('character', 0.55, 2)] },
      { value: 'newer', label: 'Newer or updated homes', prefs: [p('character', 0, 2)] },
      { value: 'open', label: 'I’m open to different styles', prefs: [] },
    ],
  },
  {
    id: 'maintenance',
    formField: 'maintenance',
    prompt: 'How involved do you want to be with the property itself?',
    type: 'single',
    required: true,
    options: [
      { value: 'low', label: 'Lower maintenance matters a lot', prefs: [p('upkeep', 0, 3)] },
      { value: 'moderate', label: 'Moderate upkeep is fine', prefs: [p('upkeep', 0.5, 1.5)] },
      { value: 'more_property', label: 'I enjoy having more property', prefs: [p('upkeep', 1, 2)] },
      { value: 'flexible', label: 'Flexible', prefs: [] },
    ],
  },
  {
    id: 'access',
    formField: 'gr_access',
    prompt: 'How important is convenient access to central Grand Rapids?',
    type: 'single',
    required: true,
    options: [
      { value: 'very', label: 'Very important', prefs: [p('centrality', 1, 3)] },
      { value: 'helpful', label: 'Helpful', prefs: [p('centrality', 0.7, 2)] },
      { value: 'minor', label: 'Not a major concern', prefs: [] },
      { value: 'trade', label: 'I’m comfortable trading proximity for setting and space', prefs: [p('centrality', 0.2, 1.5)] },
    ],
  },
  {
    id: 'recreation',
    formField: 'recreation',
    prompt: 'Which kind of access matters most to your everyday life?',
    type: 'single',
    required: true,
    options: [
      { value: 'lakes', label: 'Lakes and water', prefs: [p('water', 1, 2), p('outdoors', 0.8, 1)] },
      { value: 'trails', label: 'Trails and the outdoors', prefs: [p('outdoors', 1, 2.5)] },
      { value: 'walkable', label: 'Walkable amenities', prefs: [p('village', 1, 2)] },
      { value: 'property', label: 'The home and property itself matter more', prefs: [p('space', 0.7, 1), p('outdoors', 0.2, 1)] },
    ],
  },
  {
    id: 'setting',
    formField: 'setting',
    prompt: 'Which setting sounds most appealing?',
    type: 'single',
    required: true,
    options: [
      { value: 'close_in', label: 'Close-in and connected', prefs: [p('setting_closein', 1, 2)] },
      { value: 'village', label: 'Village- or community-centered', prefs: [p('setting_village', 1, 2)] },
      { value: 'lake', label: 'Lake-centered', prefs: [p('setting_lake', 1, 2)] },
      { value: 'wooded', label: 'Wooded and private', prefs: [p('setting_wooded', 1, 2)] },
      { value: 'flexible', label: 'Flexible', prefs: [] },
    ],
  },
  {
    id: 'priorities',
    formField: 'priorities',
    prompt: 'Optional: choose up to three priorities that matter most.',
    help: 'You can skip this one.',
    type: 'multi',
    max: 3,
    required: false,
    options: [
      { value: 'waterfront', label: 'Waterfront', prefs: [p('water', 1, 1.5)] },
      { value: 'walkability', label: 'Walkability', prefs: [p('village', 1, 1.5)] },
      { value: 'larger_lot', label: 'A larger lot', prefs: [p('space', 1, 1.5)] },
      { value: 'architectural_character', label: 'Architectural character', prefs: [p('character', 1, 1.5)] },
      { value: 'newer_construction', label: 'Newer construction', prefs: [p('character', 0, 1.5)] },
      { value: 'privacy', label: 'Privacy', prefs: [p('space', 1, 1.5), p('village', 0.1, 0.5)] },
      { value: 'outdoor_recreation', label: 'Outdoor recreation', prefs: [p('outdoors', 1, 1.5)] },
      { value: 'lower_maintenance', label: 'Lower maintenance', prefs: [p('upkeep', 0, 1.5)] },
      { value: 'convenient_access', label: 'Convenient Grand Rapids access', prefs: [p('centrality', 1, 1.5)] },
    ],
  },
];

export interface CommunityProfile {
  slug: string;
  name: string;
  values: Record<Dimension, number>;
  /** Neutral, property- and setting-focused notes shown when a stated preference fits less well. */
  tradeoffs: Partial<Record<Dimension, string>>;
}

export const communityProfiles: CommunityProfile[] = [
  {
    slug: 'rockford',
    name: 'Rockford',
    values: {
      water: 1, village: 0.55, space: 0.75, character: 0.45, upkeep: 0.8, centrality: 0.3, outdoors: 0.9,
      setting_closein: 0.1, setting_village: 0.55, setting_lake: 1, setting_wooded: 0.7,
    },
    tradeoffs: {
      centrality: 'Day-to-day access to central Grand Rapids is less immediate than in the close-in communities, so it is worth testing the drives that matter to you.',
      upkeep: 'Lake properties and larger lots usually come with more upkeep (shoreline, docks, grounds) than a compact in-town home.',
      space: 'Lakefront and larger properties often trade some connectedness for room and privacy. If you want a tightly connected neighborhood, compare it with East Grand Rapids.',
      character: 'Housing here varies widely, so architectural character depends on the specific property rather than the area.',
      setting_closein: 'The feel here is lake-and-town rather than close-in city living.',
    },
  },
  {
    slug: 'ada',
    name: 'Ada',
    values: {
      water: 0.5, village: 0.8, space: 0.8, character: 0.6, upkeep: 0.7, centrality: 0.55, outdoors: 0.75,
      setting_closein: 0.3, setting_village: 0.9, setting_lake: 0.3, setting_wooded: 0.75,
    },
    tradeoffs: {
      water: 'Water here is more about rivers than the inland-lake lifestyle. If lake living is central, compare Rockford.',
      setting_lake: 'Ada is more village-and-river than lake-centered. For a lake-centered setting, compare Rockford.',
      upkeep: 'Larger, wooded, or river-adjacent properties can involve more care than a compact home.',
      space: 'If you prefer a tightly connected neighborhood, compare East Grand Rapids.',
      centrality: 'Access to central Grand Rapids is reasonable but less immediate than in the closest-in communities.',
    },
  },
  {
    slug: 'east-grand-rapids',
    name: 'East Grand Rapids',
    values: {
      water: 0.8, village: 0.95, space: 0.2, character: 0.85, upkeep: 0.35, centrality: 0.95, outdoors: 0.55,
      setting_closein: 1, setting_village: 0.8, setting_lake: 0.75, setting_wooded: 0.2,
    },
    tradeoffs: {
      space: 'Lots are typically more modest here. If larger lots or maximum privacy become more important, you may also want to compare Ada or Forest Hills.',
      setting_wooded: 'The setting is close-in and connected rather than wooded and private.',
      upkeep: 'Older homes can bring their own maintenance considerations even on smaller lots.',
      outdoors: 'Outdoor recreation here centers on the lake and nearby parks more than on large natural areas.',
      centrality: 'East Grand Rapids is among the closest-in of these areas, so if you are happy to trade proximity for more space or a different setting, other communities may offer more of that.',
    },
  },
  {
    slug: 'cascade',
    name: 'Cascade',
    values: {
      water: 0.3, village: 0.3, space: 0.6, character: 0.4, upkeep: 0.55, centrality: 0.65, outdoors: 0.55,
      setting_closein: 0.5, setting_village: 0.25, setting_lake: 0.15, setting_wooded: 0.55,
    },
    tradeoffs: {
      water: 'Cascade is not centered on lake living. If water access is a major priority, compare Rockford.',
      village: 'Cascade has a less distinct walkable center than Ada or East Grand Rapids.',
      setting_lake: 'Cascade is not centered on lake living. For a lake-centered setting, compare Rockford.',
      character: 'Housing varies, but a strong concentration of older architectural character is not what defines the area.',
    },
  },
  {
    slug: 'forest-hills',
    name: 'Forest Hills',
    values: {
      water: 0.25, village: 0.25, space: 0.85, character: 0.45, upkeep: 0.7, centrality: 0.55, outdoors: 0.7,
      setting_closein: 0.3, setting_village: 0.2, setting_lake: 0.1, setting_wooded: 0.95,
    },
    tradeoffs: {
      water: 'Water access is not a defining feature here. If it matters a lot, compare Rockford.',
      setting_lake: 'Forest Hills is not lake-centered. For a lake-centered setting, compare Rockford.',
      village: 'The area spans several communities rather than a single walkable center. If walkability is key, compare East Grand Rapids or Ada.',
      upkeep: 'Larger wooded lots usually mean more grounds work and tree care.',
    },
  },
];
