# Content Guide

## Brand voice

Concise, warm, intelligent, experienced, calm, confident, highly personal, thoughtful, practical.

Show quality through what Amie actually does (prepares, coordinates, communicates, follows through) rather than through adjectives. Never use "white-glove service." Avoid: "Find Your Dream Home," "Your Local Real Estate Expert," "Unlock Your Home's Potential," "Luxury Living Starts Here," "Making Dreams Come True," "unparalleled," "elite," "world-class," "premier Realtor," "top producer," unless factual evidence later supports a claim.

Central line: **Real estate guidance for the moments that matter.** A transaction is usually part of a larger life moment; Amie helps clients through the whole move.

## First-person voice (V2)

Service and brand pages speak as Amie ("When I work with a seller..."). Keep third person (or neutral voice) for metadata, structured data, legal text, client testimonials, and educational Insights articles where it aids clarity. Do not force first person into reference facts, and do not turn every paragraph into an opinion: pair neutral information with a short practical "from me" note.

Approved claims about Amie: more than 15 years in real estate; over the last 15 years she has lived on both Lake Bella Vista and Silver Lake; she has helped many clients buy and sell lakefront homes in Rockford and the surrounding area. Do not invent a start year, volume, rankings, or awards.

**Lake-residency wording (V3):** high-level pages (About, `/waterfront/`, the Rockford overview and community page, the Rockford lakes hub introduction) use the broad statement *“Over the last 15 years, I’ve lived on both Lake Bella Vista and Silver Lake.”* Do not repeat it across other community pages. The exact history (seven years on Lake Bella Vista; the last eight years on Silver Lake) is reserved for the individual Lake Bella Vista and Silver Lake sections in `src/data/lakes.ts`, where it is relevant because she lived there. `tests/e2e/v3.spec.ts` enforces this.

**About page (V3):** the empty “Background” placeholder (career history, designations, community involvement, education) was removed at Amie’s request. Do not add a résumé-style block back unless Amie supplies verified content and asks for it.

**Early-awareness language (waterfront):** say that some opportunities begin through conversations before a sign goes up, that Amie often has context and relationships that help her stay close to what may be changing, and that she cannot promise a property before it reaches the market. Never say or imply exclusive or off-market inventory, getting homes before others, always knowing what is coming, or guaranteed pre-MLS access.

## Fair housing in copy

Do not describe communities as suited to any demographic group, and do not discuss school quality, safety/crime, or demographics. Describe property, setting, and lifestyle. See `docs/LOCATION_FIT_GUIDELINES.md`.

## Factual discipline

Do not publish any of the following unless it is verified and (where relevant) sourced:

- sales volume, rankings, awards, market-share claims
- years of experience beyond the approved “more than 15 years”, transaction counts, certifications, designations
- client names or reviews that are not verified and approved
- actual listings, property prices, current market statistics
- school rankings, taxes, demographics, crime statistics, commute times

If a fact is not supplied, write durable, qualitative guidance instead. Demonstration content must be clearly marked as such.

## Source discipline

- Every statistic needs a named, linked source in the article's `sources` list, with the date it was retrieved or published.
- Prefer primary sources (government agencies, school districts, MLS-derived reports Amie is licensed to use).
- Link to the organization's relevant page, and verify the link works.
- Regulatory topics (shoreline, wetlands, floodplain, disclosure, legal/tax): explain what to ask and who to ask, and point to the governmental authority or qualified professional. Do not give legal or environmental advice.
- An article without statistics should say so, which the Sources section does automatically.

## AEO structure for informational pages

1. Title that is the question (or a clear statement of the topic).
2. `summary`: the direct answer in two or three sentences. It renders as the "short answer" at the top.
3. Logical `h2` sections with plain-language explanations; no keyword stuffing.
4. Practical lists where they help scanning.
5. `faq` entries only for real questions, answered briefly. They produce visible FAQs and matching `FAQPage` JSON-LD.
6. `sources` and `relatedContent` (internal links to service, community, and related articles).
7. Author and review status appear automatically. Set `reviewedBy`/`reviewedDate` only when a real review occurred; use `updatedDate` when content changes.
8. Do not create dozens of thin geography pages. Add a community page only when there is useful, decision-oriented content for it.

## Style notes

- Sentences are short and direct; prefer concrete nouns and verbs.
- Use "Amie" in third person on the site. The first person is reserved for forms (e.g., consent text).
- Headings are sentence case. One `h1` per page.
- Alt text describes the image meaningfully; decorative placeholders are marked as placeholders.

## Community resource links (V3)

Each community page ends its guidance with a short “Want to explore on your own?” list (2-4 links), in Amie’s voice. All links live in one file, `src/data/communityResources.ts`, so they are easy to review and change.

- **Allowed:** official city, village and township sites; county parks; official downtown or business associations; chambers of commerce; state agencies; recognized conservation nonprofits.
- **Not allowed:** real-estate portals, lead-generation sites, generic directories, review sites, social-media pages, school or school-ranking links, or anything about crime/safety or demographics.
- Links open in a new tab with `rel="noopener noreferrer"` and a visually hidden “(opens in a new tab)” note. A line says the sites are independent and Amie is not affiliated.
- Descriptions are neutral and say only what the destination offers (no hours, rules or facts that belong to the other site).
- `tests/unit/resources.spec.ts` checks count, https, uniqueness, blocked host types and demographic language.
- **Before launch a person must click every link** (see `docs/LAUNCH_CHECKLIST.md`). The V3 build environment could not open these sites, so URLs came from search results only.

| Community | Link | Run by | URL |
|---|---|---|---|
| Rockford | City of Rockford | City of Rockford | https://www.rockford.mi.us/ |
| Rockford | Rockford parks and trails | City of Rockford | https://www.rockford.mi.us/community/visitors/parks___trails.php |
| Rockford | Rockford Area Chamber of Commerce | Rockford Area Chamber of Commerce | https://www.rockfordmichamber.com/ |
| Rockford | Michigan boating and public access | Michigan Department of Natural Resources | https://www.michigan.gov/dnr/things-to-do/boating |
| Ada | Ada Village | Discover Ada | https://www.adavillage.com/ |
| Ada | Covered Bridge Park | Ada Township | https://www.adamichigan.org/departments/parks_recreation_land_preservation/parks_directory/covered_bridge_park.php |
| Ada | Chief Hazy Cloud Park | Kent County Parks | https://www.kentcountymi.gov/Facilities/Facility/Details/Chief-Hazy-Cloud-Park-4 |
| Ada | Ada Township Parks, Recreation & Land Preservation | Ada Township | https://www.adamichigan.org/departments/parks_recreation_land_preservation/index.php |
| East Grand Rapids | Parks, Trails & Reeds Lake | City of East Grand Rapids | https://www.eastgrmi.gov/170/Parks-Trails-Reeds-Lake |
| East Grand Rapids | Gaslight Village | City of East Grand Rapids | https://www.eastgrmi.gov/95/Gaslight-Village |
| East Grand Rapids | Go Gaslight | Gaslight Village Business Association | https://gogaslight.com/ |
| Cascade | Pedestrian pathways | Cascade Charter Township | https://www.cascadetwp.com/community/parks/pedestrian-pathways |
| Cascade | Cascade Peace Park | Land Conservancy of West Michigan | https://naturenearby.org/portfolio_page/explore/cascade-peace-park/ |
| Cascade | Cascade Township Parks | Cascade Charter Township | https://www.cascadetwp.com/community/parks/ |
| Forest Hills | Seidman Park | Kent County Parks | https://www.kentcountymi.gov/Facilities/Facility/Details/Seidman-Park-58 |
| Forest Hills | Ada Township Parks, Recreation & Land Preservation | Ada Township | https://www.adamichigan.org/departments/parks_recreation_land_preservation/index.php |
| Forest Hills | Cascade Township Parks | Cascade Charter Township | https://www.cascadetwp.com/community/parks/ |

Forest Hills uses a custom intro explaining that “Forest Hills” spans several communities, and deliberately has no school-district link.

Optional extra for Rockford, not added to keep the page centered on lake living: the Rockford Area Museum (https://www.rockfordmuseum.org/museum). The Rockford lake link is the statewide DNR boating page; no lake-specific public-access source was found for the five lakes.

