/**
 * "Want to explore on your own?" links, one short list per community page.
 *
 * Centralized so every outbound link can be reviewed and updated in one place.
 *
 * SELECTION RULES
 *  - Only official or clearly authoritative sources: city/village/township sites, county parks,
 *    official downtown or business associations, chambers of commerce, state agencies, and
 *    recognized conservation nonprofits.
 *  - No real-estate portals, lead-generation sites, generic directories or review sites.
 *  - Roughly 2-4 links per community. Neutral, property- and place-focused descriptions only:
 *    no demographic, school, crime/safety or "best for" language (see docs/LOCATION_FIT_GUIDELINES.md).
 *  - Descriptions say what the destination offers; they make no claims about hours, rules or facts
 *    that live on the other site.
 *
 * LINK HEALTH: these URLs were identified through web search on 2026-10-06 and have NOT yet been
 * opened and clicked through by a person (the build environment could not fetch them). See the
 * "Community resource links" checklist in docs/LAUNCH_CHECKLIST.md before launch.
 */
export interface ResourceLink {
  label: string;
  href: string;
  /** Who runs the destination, shown as a small source line. */
  source: string;
  /** One neutral sentence on what the visitor will find. */
  description: string;
}

export interface CommunityResourceSet {
  /** Optional replacement for the default lead-in sentence. */
  intro?: string;
  links: ResourceLink[];
}

export const defaultResourceIntro =
  'I’ve included a few local resources below if you’d like to get a feel for the community directly.';

const kentCountySeidman: ResourceLink = {
  label: 'Seidman Park',
  href: 'https://www.kentcountymi.gov/Facilities/Facility/Details/Seidman-Park-58',
  source: 'Kent County Parks',
  description: 'Wooded, natural-surface trails and open landscapes managed by Kent County Parks.',
};

const adaTownshipParks: ResourceLink = {
  label: 'Ada Township Parks, Recreation & Land Preservation',
  href: 'https://www.adamichigan.org/departments/parks_recreation_land_preservation/index.php',
  source: 'Ada Township',
  description: 'The township’s parks, trails and preserved natural areas.',
};

const cascadeTownshipParks: ResourceLink = {
  label: 'Cascade Township Parks',
  href: 'https://www.cascadetwp.com/community/parks/',
  source: 'Cascade Charter Township',
  description: 'Township parks and facilities.',
};

export const communityResources: Record<string, CommunityResourceSet> = {
  rockford: {
    links: [
      {
        label: 'City of Rockford',
        href: 'https://www.rockford.mi.us/',
        source: 'City of Rockford',
        description: 'City services, notices and community information.',
      },
      {
        label: 'Rockford parks and trails',
        href: 'https://www.rockford.mi.us/community/visitors/parks___trails.php',
        source: 'City of Rockford',
        description: 'The city’s overview of Rockford’s parks and trails.',
      },
      {
        label: 'Rockford Area Chamber of Commerce',
        href: 'https://www.rockfordmichamber.com/',
        source: 'Rockford Area Chamber of Commerce',
        description: 'Local businesses, events and community information.',
      },
      {
        label: 'Michigan boating and public access',
        href: 'https://www.michigan.gov/dnr/things-to-do/boating',
        source: 'Michigan Department of Natural Resources',
        description: 'The state’s boating information, including how to find public boating access on Michigan lakes.',
      },
    ],
  },
  ada: {
    links: [
      {
        label: 'Ada Village',
        href: 'https://www.adavillage.com/',
        source: 'Discover Ada',
        description: 'Shops, restaurants and events in Ada Village.',
      },
      adaTownshipParks,
      {
        label: 'Covered Bridge Park',
        href: 'https://www.adamichigan.org/departments/parks_recreation_land_preservation/parks_directory/covered_bridge_park.php',
        source: 'Ada Township',
        description: 'The township’s page for Covered Bridge Park along the Thornapple River.',
      },
      {
        label: 'Chief Hazy Cloud Park',
        href: 'https://www.kentcountymi.gov/Facilities/Facility/Details/Chief-Hazy-Cloud-Park-4',
        source: 'Kent County Parks',
        description: 'Grand River frontage, woods and trails managed by Kent County Parks.',
      },
    ],
  },
  'east-grand-rapids': {
    links: [
      {
        label: 'Parks, Trails & Reeds Lake',
        href: 'https://www.eastgrmi.gov/170/Parks-Trails-Reeds-Lake',
        source: 'City of East Grand Rapids',
        description: 'The city’s guide to its parks, the Reeds Lake Trail and the lake.',
      },
      {
        label: 'Gaslight Village',
        href: 'https://www.eastgrmi.gov/95/Gaslight-Village',
        source: 'City of East Grand Rapids',
        description: 'The city’s overview of the village-style shopping and dining district.',
      },
      {
        label: 'Go Gaslight',
        href: 'https://gogaslight.com/',
        source: 'Gaslight Village Business Association',
        description: 'The business association’s member directory and events.',
      },
    ],
  },
  cascade: {
    links: [
      cascadeTownshipParks,
      {
        label: 'Pedestrian pathways',
        href: 'https://www.cascadetwp.com/community/parks/pedestrian-pathways',
        source: 'Cascade Charter Township',
        description: 'The township’s pathway routes for walking and biking.',
      },
      {
        label: 'Cascade Peace Park',
        href: 'https://naturenearby.org/portfolio_page/explore/cascade-peace-park/',
        source: 'Land Conservancy of West Michigan',
        description: 'Woodland trails and natural areas, as described by the Land Conservancy of West Michigan.',
      },
    ],
  },
  'forest-hills': {
    intro:
      'Because “Forest Hills” spans several communities, I’ve pointed to local governments and county parks so you can explore the areas that matter to you directly.',
    links: [kentCountySeidman, adaTownshipParks, cascadeTownshipParks],
  },
};

export const getCommunityResources = (slug: string): CommunityResourceSet | undefined => communityResources[slug];
