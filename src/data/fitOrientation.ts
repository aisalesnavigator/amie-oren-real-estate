/**
 * Result content for "Find Your West Michigan Fit", one block per community.
 *
 *  - reasons:   why a matched preference fits THIS community (shown under "Why it fits").
 *  - know:      neutral, buyer-oriented orientation facts ("What I’d want you to know").
 *  - tradeoffs: shown when a strongly stated preference fits this community less well.
 *  - tour:      Amie’s first-person "If I were showing you the area…": a general orientation plus
 *               one personalized stop chosen from the visitor's strongest preferences.
 *
 * FACT DISCIPLINE: place names and factual statements are sourced in docs/LOCATION_FIT_SOURCES.md.
 * Do not add lake depths, acreage, boating rules, public-access claims or trail connections unless they
 * are verified from an authoritative source. Lake-specific boating designations are deliberately NOT
 * stated; the copy talks about comparing lakes instead.
 *
 * FAIR HOUSING: property, setting and lifestyle only. No school, safety/crime, demographic,
 * household-type or other protected-class language (tests scan this file).
 */
import type { Dimension } from './locationFit';

/** Personalized tour stops are keyed by a dimension, or by a specific water type. */
export type StopKey = Dimension | 'all_sports' | 'quiet_lake' | 'riverfront' | 'near_water' | 'any_water';

export interface CommunityOrientation {
  slug: string;
  reasons: Partial<Record<Dimension, string>>;
  know: string[];
  tradeoffs: Partial<Record<Dimension, string>>;
  tour: {
    base: string;
    stops: Partial<Record<StopKey, string>>;
    /** Used when none of the visitor's strongest preferences has a specific stop. */
    fallback: string;
  };
}

const driveStop = (place: string) =>
  `Since the drive matters to you, I’d also have us drive from ${place} toward downtown Grand Rapids at the time of day you’d actually make that trip, so you can judge it for yourself.`;

export const fitOrientation: Record<string, CommunityOrientation> = {
  rockford: {
    slug: 'rockford',
    reasons: {
      lakeDepth: 'The Rockford area gives you several lakes to compare, not just one, so you can choose the lake as carefully as the house.',
      allSports: 'Boating is a big part of lake life around Rockford, and the lakes differ enough that comparing them is worth the time.',
      quietLake: 'With several lakes in the area, there is room to find a quieter shoreline rather than settling for whatever is available.',
      nearWater: 'Even off the water, the lakes and the Rogue River are part of everyday life here.',
      waterGeneral: 'Water is woven into the area: a collection of lakes plus the Rogue River through downtown.',
      river: 'The Rogue River runs right through downtown Rockford.',
      village: 'Downtown Rockford is walkable, with shops and restaurants near the river and the dam overlook.',
      space: 'Away from the lakes and downtown, the setting opens up to larger lots and more privacy.',
      nature: 'The White Pine Trail and the Rogue River Nature Trail make the outdoors part of daily life.',
      updated: 'You’ll find a good mix of updated and newer homes, including on the lakes.',
      turnkey: 'Move-in-ready homes do come up here; I’d build that straight into your search.',
    },
    know: [
      'Rockford-area lakes vary a lot: shoreline, activity level, association arrangements and access differ from lake to lake.',
      'Downtown sits along the Rogue River, with the White Pine Trail running through town.',
      'Lakefront homes are a smaller slice of what’s for sale, and good ones can move quickly.',
      'Waterfront ownership comes with its own upkeep: shoreline, docks, and sometimes seawalls.',
    ],
    tradeoffs: {
      proximity: 'The drive to central Grand Rapids is longer than from the communities closest to the city, so test the drives that matter to you.',
      lowCare: 'Lake homes and larger lots usually mean more ongoing care than a compact in-town home.',
      connected: 'Much of the lake and larger-lot living here trades some connectedness for space and water.',
      character: 'Architectural character depends on the specific property here more than on the area as a whole.',
    },
    tour: {
      base: 'I’d first familiarize you with some of the differences between lakes like Lake Bella Vista, Silver Lake and Bostwick Lake: not just the houses, but the shoreline, activity level, neighborhood feel and what day-to-day lake life is actually like. Then I’d spend some time with you downtown so you can see how the lake areas connect with Rockford itself.',
      stops: {
        all_sports: 'Because boating matters to you, I’d spend extra time comparing how activity levels, launch arrangements and lake rules differ, starting with Lake Bella Vista and Bostwick Lake, before we look at a single listing.',
        quiet_lake: 'Because you’d like a quieter lake, I’d show you how different the same afternoon can feel from one lake, or one stretch of shoreline, to the next.',
        any_water: 'Since you’re open on water, I’d show you a few contrasting lake settings side by side so you can feel which one fits.',
        near_water: 'Since being near the water matters more than owning frontage, I’d show you homes a short walk or drive from the lakes and the river.',
        riverfront: 'Because you’re drawn to river settings, I’d also walk the Rogue River through downtown with you, from the dam overlook to Peppler Park.',
        village: 'Because walkability matters to you, I’d start at the dam overlook on Bridge Street and walk downtown with you, so you can feel how the shops, restaurants and river fit together.',
        nature: 'Because trails and natural surroundings matter to you, I’d take you onto the White Pine Trail as it follows the Rogue River north out of town, or the Rogue River Nature Trail boardwalk from Peppler Park.',
        space: 'Because privacy and room matter to you, I’d drive you from the tighter lake and downtown streets out to more wooded, spacious settings, so you can see how quickly the feel changes.',
        proximity: driveStop('the lakes'),
        updated: 'Since an updated home matters to you, I’d point out where newer and recently renovated homes tend to cluster, on and off the water.',
      },
      fallback: 'From there, I’d tailor the rest of the day to the lake or setting that caught your attention.',
    },
  },

  ada: {
    slug: 'ada',
    reasons: {
      river: 'Ada sits where the Thornapple River meets the Grand, so river settings are a real part of the area.',
      nearWater: 'The rivers, the covered bridge and riverside parks keep water close even off the frontage.',
      waterGeneral: 'Water here means rivers rather than lakes, with the Thornapple and the Grand both nearby.',
      village: 'Ada Village is compact and walkable, with shops, restaurants and Legacy Park close together.',
      space: 'Just outside the village, lots get larger and more private.',
      nature: 'Township parks and preserves, plus Kent County’s Seidman Park, put woods and trails close by.',
      updated: 'There’s a healthy mix of newer and updated homes in the surrounding area.',
      turnkey: 'Move-in-ready homes come up here regularly; I’d make that part of your search.',
      proximity: 'The drive to Grand Rapids is moderate, a reasonable balance for the setting.',
    },
    know: [
      'Ada Village is a compact, walkable center near where the Thornapple River meets the Grand River.',
      'Water here means rivers, not inland lakes, so river frontage comes with its own considerations.',
      'Much of the surrounding area is larger-lot and wooded, with township parks and preserves.',
    ],
    tradeoffs: {
      lakeDepth: 'Ada isn’t a lake market. If lake living is the goal, compare Rockford.',
      allSports: 'For a boating lake, Rockford-area lakes are the better comparison.',
      quietLake: 'For a quieter inland lake, Rockford-area lakes are the better comparison.',
      lowCare: 'Larger and wooded lots usually mean more grounds care than a compact home.',
      connected: 'Outside the village, homes tend to be more spread out than in a connected neighborhood.',
      proximity: 'The drive is moderate rather than the shortest; East Grand Rapids is closer in.',
    },
    tour: {
      base: 'I’d start in Ada Village: walk the shops and restaurants and cross the Ada Covered Bridge over the Thornapple River. Then I’d drive you out a few minutes so you can see how quickly the setting changes to larger, wooded lots.',
      stops: {
        riverfront: 'Because river settings appeal to you, I’d show you where the Thornapple meets the Grand and talk through what river frontage really means for a property.',
        near_water: 'Since being near the water matters, I’d show you how the rivers and riverside parks fit into everyday life here.',
        any_water: 'Since you’re open on water, I’d be clear that Ada’s water is river, not lake, and show you what that looks like.',
        all_sports: 'I’d also be honest with you: if a boating lake is the goal, Ada is a river community, and we should compare it with Rockford-area lakes.',
        quiet_lake: 'I’d also be honest with you: if a quiet inland lake is the goal, Ada is a river community, and we should compare it with Rockford-area lakes.',
        nature: 'Because natural surroundings matter to you, I’d take you to Roselle Park along the Grand River, or the trails at Seidman Park.',
        village: 'Because walkability matters to you, I’d spend time in the village itself, including Legacy Park, where concerts are part of the season.',
        space: 'Because privacy matters to you, I’d show you the larger-lot, wooded settings just beyond the village.',
        proximity: driveStop('Ada Village'),
      },
      fallback: 'Then we’d narrow in on whether village life or a more private setting feels like home.',
    },
  },

  'east-grand-rapids': {
    slug: 'east-grand-rapids',
    reasons: {
      village: 'Gaslight Village puts shops, restaurants and coffee within an easy walk.',
      connected: 'The neighborhoods are connected and walkable, built around the lake and the village.',
      character: 'Older homes with architectural character are a defining part of the housing.',
      proximity: 'It offers the shortest, easiest drive to central Grand Rapids of these five.',
      nearWater: 'Reeds Lake, its 4.2-mile trail and the lakefront parks are close at hand.',
      waterGeneral: 'Reeds Lake is at the center of the community, with lakefront parks and a trail around it.',
      lowCare: 'More modest lots can mean less yard to look after.',
      quietLake: 'Reeds Lake is close by, though it’s one lake rather than a choice among several.',
    },
    know: [
      'A compact city built around Reeds Lake and the Gaslight Village business district.',
      'Lake living here means one lake: John Collins Park has the only public boat launch on Reeds Lake, which is very different from choosing among Rockford’s lakes.',
      'Many homes are older, on more modest lots in connected neighborhoods, so renovation history matters.',
    ],
    tradeoffs: {
      space: 'Lots are typically more modest. If more room or privacy matters, compare Ada or Forest Hills.',
      nature: 'Natural areas here are parks and lakeside woods rather than large wooded settings.',
      lakeDepth: 'This is one lake, not a lake market. For several lakes to choose among, compare Rockford.',
      allSports: 'For a boating lake with more options, compare Rockford-area lakes.',
      river: 'East Grand Rapids isn’t a river community. Compare Ada or Cascade for river settings.',
      updated: 'With many older homes, finding newer or fully updated ones narrows the search.',
      turnkey: 'Older homes can mean more projects, so move-in ready narrows the search here.',
    },
    tour: {
      base: 'I’d start in Gaslight Village along Wealthy Street, walk down to Reeds Lake at John Collins Park, and then show you a few of the connected neighborhoods around it. I’d also be clear that lake living here means one lake at the center of a compact city, which is very different from Rockford’s collection of lake environments.',
      stops: {
        village: 'Because walkability matters to you, I’d suggest we come back in the evening and walk Gaslight Village the way you would if you lived here.',
        nature: 'Because you like being outdoors, I’d walk part of the 4.2-mile Reeds Lake Trail with you.',
        near_water: 'Since being near the water matters, I’d take you out on Waterfront Park’s floating boardwalk on the west shore of Reeds Lake.',
        any_water: 'Since water matters to you, I’d take you out on Waterfront Park’s floating boardwalk and talk through what owning near Reeds Lake looks like.',
        all_sports: 'Because boating matters to you, I’d talk honestly about what it looks like on a single lake with one public launch, and compare it with Rockford-area lakes.',
        quiet_lake: 'Since a lake setting matters, I’d talk through how lake living works here, with one lake at the center, before you compare it with Rockford-area lakes.',
        character: 'Because architectural character matters to you, I’d walk you down a few streets where older homes show off the details you’re drawn to.',
        proximity: 'Since the drive matters to you, I’d show you just how short the trip into downtown Grand Rapids is.',
        connected: 'Because a connected neighborhood matters, I’d walk you through a few blocks so you can see how they tie into the village and the lake.',
      },
      fallback: 'From there, we’d focus on the streets and homes that fit what you told me.',
    },
  },

  cascade: {
    slug: 'cascade',
    reasons: {
      river: 'The Thornapple River runs through Cascade, so river-oriented settings are part of the area.',
      nearWater: 'The Thornapple River and township parks keep water nearby.',
      proximity: 'Cascade balances a manageable drive to Grand Rapids with more residential space.',
      connected: 'Established neighborhoods give you a settled, connected feel.',
      space: 'You can find more room than in the communities closest to the city.',
      nature: 'Cascade Peace Park’s trails and about 17 miles of township pathways make getting outside easy.',
      updated: 'There’s a good range of updated and newer homes.',
      turnkey: 'Move-in-ready homes come up regularly; I’d build that into your search.',
      lowCare: 'You can find homes and lots that keep upkeep manageable.',
    },
    know: [
      'Cascade Charter Township sits along the Thornapple River, with about 17 miles of pedestrian pathways and several township parks.',
      'Housing ranges from established neighborhoods to more wooded, residential settings.',
      'There isn’t a single walkable village center on the scale of Ada Village or Gaslight Village.',
    ],
    tradeoffs: {
      village: 'There’s no single walkable center like Gaslight Village or Ada Village. If that matters, compare those.',
      lakeDepth: 'Cascade isn’t a lake market. For lake living, compare Rockford.',
      allSports: 'For a boating lake, Rockford-area lakes are the better comparison.',
      quietLake: 'For a quieter inland lake, Rockford-area lakes are the better comparison.',
      character: 'A concentration of older architectural homes isn’t what defines the area.',
    },
    tour: {
      base: 'I’d start along the Thornapple River near Cascade Road, where the river and the township’s dam shape the area, then show you nearby neighborhoods and how the area balances convenient access with more residential and wooded settings.',
      stops: {
        nature: 'Because natural surroundings matter to you, I’d take you to Cascade Peace Park, which has nearly four miles of trails through hardwood forest.',
        riverfront: 'Because river settings appeal to you, I’d show you river-oriented properties along the Thornapple and what that means for ownership.',
        near_water: 'Since being near the water matters, I’d show you how the river fits into everyday life here.',
        any_water: 'Since you’re open on water, I’d show you how the Thornapple shapes the area, and be clear that Cascade isn’t a lake market.',
        all_sports: 'I’d also be honest that if a boating lake is the goal, we should compare Cascade with Rockford-area lakes.',
        quiet_lake: 'I’d also be honest that if a quiet inland lake is the goal, we should compare Cascade with Rockford-area lakes.',
        village: 'Since walkability matters, I’d show you the township’s pathway network, and we’d talk about how it compares with a true village center.',
        proximity: driveStop('Cascade'),
        space: 'Because privacy matters to you, I’d show you the more wooded, residential pockets alongside the established neighborhoods.',
      },
      fallback: 'From there, we’d narrow in on the neighborhoods that balance access and space the way you want.',
    },
  },

  'forest-hills': {
    slug: 'forest-hills',
    reasons: {
      space: 'Larger lots and room between homes are common.',
      nature: 'Wooded settings and nearby natural areas, including Kent County’s Seidman Park, are a defining feature.',
      updated: 'You’ll find many newer and updated homes.',
      turnkey: 'Move-in-ready homes come up regularly; I’d build that into your search.',
      connected: 'Some neighborhoods have a settled, connected feel even with larger lots.',
      proximity: 'The drive to Grand Rapids is moderate, a fair trade for the space.',
    },
    know: [
      'The name covers a broad area spanning parts of several communities, so I always confirm exactly where a property sits.',
      'Larger, wooded lots are common, which means more grounds and tree care.',
      'Water and walkable town centers aren’t defining features here, though Ada Village and nearby parks are a short drive away.',
    ],
    tradeoffs: {
      village: 'Walkable town centers are a drive away. If walkability is key, compare East Grand Rapids or Ada.',
      lakeDepth: 'Forest Hills isn’t a lake market. For lake living, compare Rockford.',
      allSports: 'For a boating lake, Rockford-area lakes are the better comparison.',
      quietLake: 'For a quieter inland lake, Rockford-area lakes are the better comparison.',
      river: 'River settings aren’t a defining feature. Compare Ada or Cascade.',
      lowCare: 'Larger wooded lots usually mean more grounds work and tree care.',
      character: 'Older architectural homes aren’t what defines most of the area.',
    },
    tour: {
      base: 'Because Forest Hills covers a broad area, I’d start by showing you a few different pockets of wooded, larger-lot neighborhoods so you can see how much they vary.',
      stops: {
        nature: 'Because trails and natural surroundings matter to you, I’d take you to Seidman Park, which Kent County notes has nearly five miles of natural-surface trails.',
        space: 'Because privacy matters to you, I’d show you how lot sizes and tree cover change from one pocket to the next.',
        village: 'Since walkability matters, I’d be honest that town centers are a drive away, and I’d show you Ada Village nearby so you can weigh it.',
        proximity: driveStop('a few of these neighborhoods'),
        updated: 'Since an updated home matters to you, I’d focus on areas where newer and recently updated homes are common.',
      },
      fallback: 'From there, we’d focus on the pockets that match the space and setting you described.',
    },
  },
};
