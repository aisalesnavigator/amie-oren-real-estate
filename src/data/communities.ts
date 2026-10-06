/**
 * Community pages are durable, qualitative decision resources.
 * Deliberately NO prices, taxes, school rankings, demographics, crime statistics,
 * commute times or market data. Add verified specifics only with a source.
 */
export interface Community {
  slug: string;
  name: string;
  /** Short line for cards. */
  blurb: string;
  /** Title line used in the page hero. */
  headline: string;
  overview: string[];
  housingCharacter: string[];
  lifestyle: string[];
  buyerQuestions: string[];
  sellerQuestions: string[];
  propertyConsiderations: string[];
  related: string[];
  /** First-person note from Amie (her practical perspective, not a statistic). */
  myNote: string;
  /** Caption for the (placeholder) community photography slot. */
  setting: string;
}

export const communities: Community[] = [
  {
    slug: 'rockford',
    name: 'Rockford',
    blurb: 'Rockford-area lake living, with a town center close by.',
    headline: 'Rockford: lake living, with a town center close by.',
    setting: 'Rockford-area lakes and shoreline',
    overview: [
      'Rockford is a town center surrounded by a collection of lakes. Many of the people I work with here are deciding how much of their life they want centered on the water: living on a lake, being a short drive from one, or enjoying the lakes seasonally.',
      'Beyond the water, the area offers a walkable town center, established neighborhoods, and larger parcels a little further out. How those fit together is usually the real decision, more than any single house.',
    ],
    housingCharacter: [
      'Lake homes in the area can range from long-held cottages to substantially updated and newly built homes, and two properties on the same lake can offer very different frontage and settings.',
      'Away from the water you will find established neighborhoods and larger properties. Condition, lot, and how a home will actually be used matter more than the label on the neighborhood.',
    ],
    lifestyle: [
      'Lake life shapes the rhythm of the area: docks, boats, shoreline, and long summer evenings, with a very different feel in the off-season. If you can, spend time here in more than one season.',
      'Over the last 15 years, I’ve lived on both Lake Bella Vista and Silver Lake, so I try to help clients think through what daily life on the water is really like, not just how the view looks in a listing.',
    ],
    buyerQuestions: [
      'How important is being on the water, and what do I actually want to do there?',
      'Would being near a lake, rather than on it, give me what I want?',
      'Do I want a seasonal retreat, a year-round home, or something that does both?',
      'What upkeep comes with the shoreline, dock, and property, and how do I feel about it?',
    ],
    sellerQuestions: [
      'What is the story of the property, whether that is the water, the setting, or the neighborhood?',
      'Which updates would a buyer value, and which would simply be my preference?',
      'How should the shoreline, dock, and outdoor spaces be presented through the seasons?',
      'What is the timing of my next move, and how does it shape the plan for this sale?',
    ],
    propertyConsiderations: [
      'For lake properties: shoreline condition, seawalls, docks, and what access or rights actually come with the home.',
      'Well and septic systems, where applicable, and what documentation exists.',
      'Seasonal versus year-round use, including insulation, heating, and winter access.',
      'Outbuildings, acreage, and how boundaries and access are defined.',
    ],
    related: ['ada', 'cascade'],
    myNote:
      'For buyers considering Rockford, one of the first questions I ask is how important lake access is. The answer changes which part of the area makes sense.',
  },
  {
    slug: 'ada',
    name: 'Ada',
    blurb: 'Village character, river landscapes, and a wide range of homes.',
    headline: 'Ada: village character where the rivers meet.',
    setting: 'Village center, river landscapes, wooded lots',
    overview: [
      'Ada is known for its village center and for the rivers that run through the area. It draws people who want a settled, established feel while staying connected to the greater Grand Rapids area.',
      'The housing here varies widely, from homes near the village to private, wooded, and riverfront settings. Understanding which version of Ada fits your life is the first step.',
    ],
    housingCharacter: [
      'Many buyers and sellers here are thinking about lots, privacy, and views as much as square footage.',
      'Higher-end properties often have features that need to be understood on their own terms: site orientation, landscaping, outdoor living, and the relationship between the home and its setting.',
    ],
    lifestyle: [
      'People often describe wanting a quieter pace without feeling remote. That is a preference worth defining clearly before touring.',
      'Consider the village, the river, and the surrounding roads as part of the property, because they will be part of your routine.',
    ],
    buyerQuestions: [
      'What matters more to me: proximity to the village, or privacy and space?',
      'Is river frontage or river access a priority, and what use do I intend?',
      'What does ongoing care of the lot and landscaping realistically require?',
      'How will this home work in five or ten years?',
    ],
    sellerQuestions: [
      'What is the distinctive story of this property, setting included?',
      'Which seasonal conditions should be reflected in the photography and timing?',
      'Where would preparation have the most influence on buyer confidence?',
      'How should I weigh price against terms, timing, and certainty in an offer?',
    ],
    propertyConsiderations: [
      'Floodplain, drainage, and river-related questions for properties near water, directed to the appropriate professionals and agencies.',
      'Mature trees, grading, and landscaping upkeep.',
      'Well and septic where applicable.',
      'Home age, additions, and the quality of past work.',
    ],
    related: ['forest-hills', 'cascade', 'rockford'],
    myNote:
      "When I'm helping someone compare Ada and Forest Hills, I usually start by asking how much they value being near the village versus having space and privacy.",
  },
  {
    slug: 'east-grand-rapids',
    name: 'East Grand Rapids',
    blurb: 'A lake community close to Grand Rapids, with a strong sense of place.',
    headline: 'East Grand Rapids: close to the city, organized around the lake.',
    setting: 'Lakeside neighborhoods and tree-lined streets',
    overview: [
      'East Grand Rapids is a compact community close to downtown Grand Rapids, with Reeds Lake at its center. Its neighborhoods, lakefront, and village-style shopping area give it a strong identity.',
      'Because the community is small and well defined, buyers who know the area tend to understand a home quickly. Preparation and positioning matter.',
    ],
    housingCharacter: [
      'Older, established homes are a significant part of the story, along with renovations, additions, and rebuilds. Buyers often compare how thoughtfully a home has been updated.',
      'Lots are typically modest, so layout, light, and how a home lives day to day are central.',
    ],
    lifestyle: [
      'Many households are drawn to walkability, the lake, and the character of the neighborhoods.',
      'Think about how much of that community life you expect to use, and how close to it you want to be.',
    ],
    buyerQuestions: [
      'Which streets and pockets fit how I actually want to live?',
      'If the home has been renovated, was the work well executed and documented?',
      'How do the lot, parking, and outdoor space suit my needs?',
      'How does lake proximity or access factor into the decision?',
    ],
    sellerQuestions: [
      'How can I present the home’s updates and history clearly?',
      'What do buyers familiar with the area compare this home against?',
      'Where would selective preparation have the greatest effect?',
      'How do I coordinate the sale with the purchase of my next home?',
    ],
    propertyConsiderations: [
      'Age of the home and major systems, and permits for past renovations.',
      'Lot size, setbacks, and room for future changes.',
      'For lake-adjacent properties, what access or rights actually transfer with the home.',
      'Basement and moisture conditions in older construction.',
    ],
    related: ['forest-hills', 'cascade'],
    myNote:
      "When people tell me they love East Grand Rapids, I ask what they love most: the lake, the village, or being close to the city. Each points to a slightly different search.",
  },
  {
    slug: 'cascade',
    name: 'Cascade',
    blurb: 'Established neighborhoods with space, convenience, and variety.',
    headline: 'Cascade: established neighborhoods with space and variety.',
    setting: 'Established neighborhoods and rolling lots',
    overview: [
      'Cascade offers a broad mix of established neighborhoods, larger lots, and homes at a range of ages and styles, with convenient access to the rest of the Grand Rapids area.',
      'Households often arrive here looking for space and a settled neighborhood feel. The useful question is which specific pocket and property type best fits the life they want next.',
    ],
    housingCharacter: [
      'Expect considerable variety, from mid-century and later neighborhoods to newer builds and more private settings.',
      'Condition and updating history differ significantly from house to house, which makes careful evaluation important.',
    ],
    lifestyle: [
      'Buyers here frequently value a blend of convenience and breathing room.',
      'Visit at different times of day to understand traffic, noise, and neighborhood activity for yourself.',
    ],
    buyerQuestions: [
      'Which neighborhoods fit my priorities for space, privacy, and access?',
      'What updates are already done, and what is likely to come next?',
      'How do outdoor space and the lot match how I plan to use them?',
      'How does this location work for the people in my household?',
    ],
    sellerQuestions: [
      'What distinguishes my home from others buyers will see in the same area?',
      'Which improvements would buyers value, and which are unnecessary?',
      'How should the home be presented to speak to move-up households?',
      'What timeline makes sense for both my sale and my next step?',
    ],
    propertyConsiderations: [
      'Age and condition of roofing, mechanical systems, and windows.',
      'Drainage and grading on larger or sloped lots.',
      'Well and septic where applicable.',
      'The quality and permitting of finished basements and additions.',
    ],
    related: ['forest-hills', 'ada'],
    myNote:
      "With Cascade, I often start by asking how much space and how much convenience each matter, because the neighborhoods vary quite a bit.",
  },
  {
    slug: 'forest-hills',
    name: 'Forest Hills',
    blurb: 'A name that covers a broader area; worth defining carefully.',
    headline: 'Forest Hills: a name that covers more than one kind of place.',
    setting: 'Wooded neighborhoods and larger lots',
    overview: [
      'Forest Hills is commonly used to describe the area associated with the Forest Hills Public Schools district, which includes parts of several nearby communities rather than a single town.',
      'Because the term is used loosely, it helps to be specific about which streets, neighborhoods, and boundaries matter to you. Verify details such as school assignment directly with the district.',
    ],
    housingCharacter: [
      'The housing is varied, from established neighborhoods to larger, more private properties and newer construction.',
      'Move-up households often compare homes on lot, layout, and condition as much as on location.',
    ],
    lifestyle: [
      'Many people are drawn here for space and wooded settings.',
      'Consider daily logistics carefully, since the area spans several communities with different characters.',
    ],
    buyerQuestions: [
      'Which specific neighborhoods match my priorities?',
      'Have I confirmed school boundaries and policies directly with the district?',
      'What lot characteristics matter to me, such as privacy, trees, or grade?',
      'How might this home serve my household as it changes?',
    ],
    sellerQuestions: [
      'How do I describe my home’s specific location clearly to buyers unfamiliar with the area?',
      'What do move-up buyers need to see to feel confident?',
      'Which condition items are most likely to surface during inspection?',
      'How should I plan the timing of my move?',
    ],
    propertyConsiderations: [
      'Exact district and boundary confirmation for any property.',
      'Well and septic where applicable.',
      'Drainage, grading, and tree-related maintenance on wooded lots.',
      'Age and condition of mechanical systems.',
    ],
    related: ['ada', 'cascade', 'east-grand-rapids'],
    myNote:
      "Because “Forest Hills” means different things to different people, I start by getting specific about which streets and neighborhoods someone has in mind.",
  },
];

export const getCommunity = (slug: string): Community | undefined => communities.find((c) => c.slug === slug);
