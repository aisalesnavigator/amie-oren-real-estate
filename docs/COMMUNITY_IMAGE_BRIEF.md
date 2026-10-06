# Community & Lake Image Brief

## Current status (V3 refinement pass)

**No place photography is embedded yet.** Every community and lake image is still the designed placeholder (a soft gradient with a line motif and a caption describing the intended photograph).

Amie asked for richer local identity on community and lake pages. The V3 pass researched candidates, but **no image could be both verified and obtained**:

- The build environment's network policy blocked the photo libraries and the municipal/association sites (`commons.wikimedia.org`, `unsplash.com`, `pexels.com`, and the township, city and lake-association websites). Image files could not be downloaded and license pages could not be read.
- Candidate URLs below were found through web search only. **Their licenses, attribution terms and exact subjects are unverified.** Nothing was hotlinked or embedded.

Rule applied: *research freely, publish carefully.* Where rights are unclear, the image is recorded here for human approval and the placeholder stays. Strong placeholders were not swapped for weak imagery.

### Fastest route to real photography

1. **Amie's own photos.** She lives on Silver Lake and previously lived on Lake Bella Vista; a handful of her own sunrise, dock and shoreline photos would be the most authentic and rights-clean option for the Rockford hero and the lake hub.
2. A person opens each candidate below, confirms the license on the file page (Commons shows it under "Licensing"), checks the subject really is the named place, and approves or rejects it.
3. For anything that needs permission (lake associations, photographers), ask in writing and keep the reply.

## How to add a licensed photo

1. Save the image as `src/assets/places/<slug>.jpg` (or `.jpeg`, `.png`, `.webp`). Slugs: `rockford`, `ada`, `east-grand-rapids`, `cascade`, `forest-hills`, `bostwick-lake`, `silver-lake`, `lake-bella-vista`, `myers-lake`, `brower-lake`.
2. Add an entry to `src/data/placeImages.ts` with `alt`, `credit`, `license` and `sourceUrl`.
3. Run `npm run build`. **An image appears only if both the file and its rights entry exist.** A credit line is shown on the photo. Astro generates the responsive WebP sizes; the placeholder layout and aspect ratios are unchanged.

Acceptable sources: photos taken by or for Amie, commercially licensed stock or commissioned photography, public domain, Creative Commons licenses that allow this use (record attribution and any share-alike terms), Unsplash/Pexels (record photographer and page URL), or official municipal/tourism sources that explicitly permit reuse. Do not use Google Images, social media, or MLS/brokerage listing photos without written permission.

Technical: landscape, at least 2000 px wide, sRGB, no text or logos. Hero crops are about 5:4; lake cards 16:10, so keep the subject near the center. No identifiable people without a release; avoid private homes without written owner permission.

Placement intent (keep the site restrained, one strong image per place, never reuse the same photo): community hero areas, the Rockford lakes hub (one per lake), and the waterfront hub "Lake life, firsthand" panel.

## Shot list

| Location | Recommended subject | Orientation | Ideal composition | Lighting / time | What makes it locally recognizable | Intended page / use | Candidate source (unverified) | License / usage status | Embedded? |
|---|---|---|---|---|---|---|---|---|---|
| Rockford (community) | A Rockford-area lake with a dock and shoreline; alternative: downtown Rockford and the Rogue River dam area | Landscape | Water in the lower third, dock leading in, soft sky | Early morning or the hour before sunset | A shoreline Amie can identify by name; avoid anonymous "lake" stock | `/communities/rockford/` hero, community cards, `/waterfront/` panel | Commons category for browsing: https://commons.wikimedia.org/wiki/Category:Lakes_of_Michigan (no specific Rockford file confirmed) | Unknown. Needs human review | No. Placeholder |
| Silver Lake | Shoreline and dock at sunrise | Landscape | Low angle along the dock, horizon centered | Sunrise, calm water | Distinct shoreline and tree line of Silver Lake itself | `/waterfront/rockford-lakes/#silver-lake` | Aerial set by a commercial photographer: https://www.lakes-of-michigan.com/Photo-List/Silver-Lake-in-Rockford-Michigan-Aerial-Photos/n-CfmVwL ; lake association: https://www.silverlakecannon.com/lake.html | **Rights reserved presumed.** Permission required before any use | No. Placeholder. Best: Amie's own photo |
| Lake Bella Vista | Water view from the shore, cottage or dock in frame | Landscape | Shoreline curve with a home or boathouse in the distance | Golden hour | Lake outline and homes along the shore | `/waterfront/rockford-lakes/#lake-bella-vista` | Wikipedia article (check its images and their Commons licenses): https://en.wikipedia.org/wiki/Lake_Bella_Vista_(Michigan) | Unknown. Needs human review | No. Placeholder. Best: Amie's own photo |
| Bostwick Lake | Open water with shoreline | Landscape | Wide, water-led composition | Morning | Recognizable bay or shoreline of Bostwick Lake | `/waterfront/rockford-lakes/#bostwick-lake` | Lake association: https://www.bostwicklake.org/about/ (any photos there are the association's) | Unknown. Permission required if used | No. Placeholder |
| Myers Lake | Shoreline or dock | Landscape | Dock leading into the lake | Golden hour | Recognizable shoreline of Myers Lake | `/waterfront/rockford-lakes/#myers-lake` | None found | n/a | No. Placeholder |
| Brower Lake | Shoreline or dock | Landscape | Water-led composition | Golden hour | Recognizable shoreline of Brower Lake | `/waterfront/rockford-lakes/#brower-lake` | None found | n/a | No. Placeholder |
| Ada | Ada Village main street, the Covered Bridge area, or the Thornapple River at the village | Landscape | Street or river with the village's recognizable buildings or bridge | Late afternoon, soft light | Ada Village storefronts, the Covered Bridge, the Thornapple/Grand River setting; confirm the subject is clearly Ada | `/communities/ada/` hero, cards | https://commons.wikimedia.org/wiki/File:Ada_Michigan_ThornappleRiver_Dam_DSCN9695.JPG ; https://commons.wikimedia.org/wiki/File:Ada_MI_GrandRiver_DSCN9684.JPG (river/dam views, not the Covered Bridge) | Unverified. Commons file pages state the license; not read from this environment | No. Placeholder. Covered Bridge Park is recently completed, so new photography is likely better than archive images |
| East Grand Rapids | Reeds Lake with the shoreline or trail, or the Gaslight Village streetscape | Landscape | Lake with the path or village storefronts | Golden hour | Reeds Lake or Gaslight Village are unmistakable | `/communities/east-grand-rapids/` hero, cards | https://commons.wikimedia.org/wiki/Category:Reeds_Lake_(Michigan) ; https://commons.wikimedia.org/wiki/Category:East_Grand_Rapids,_Michigan ; https://commons.wikimedia.org/wiki/File:East_Grand_Rapids.jpg (many Reeds Lake items are historic postcards, which may be public domain but look dated) | Unverified. Needs per-file review. A search of Unsplash for "Reeds Lake" returned only unrelated reed-plant photos | No. Placeholder |
| Cascade | Thornapple River at Cascade, e.g. the Cascade Dam as seen from Leslie E. Tassell Park, or a recognizable Cascade park | Landscape | Wide establishing shot of the river and park | Soft daylight | The Thornapple River dam and park are specific to Cascade; avoid generic suburban streets | `/communities/cascade/` hero, cards | https://commons.wikimedia.org/wiki/Category:Cascade_Dam,_Thornapple_River_(Michigan) ; https://commons.wikimedia.org/wiki/File:Cascade_Dam_Thornapple_River_Fish_StoryDSCN0090.JPG ; https://commons.wikimedia.org/wiki/Category:Cascade_Township,_Michigan ; Flickr: https://www.flickr.com/photos/courthouselover/50365257531 | Unverified. Flickr license not confirmed | No. Placeholder |
| Forest Hills | A recognizable trail or park in the area, e.g. Seidman Park or Cascade Peace Park | Landscape | Establishing shot of a place locals would recognize | Fall color or soft light | Must be locally identifiable; avoid generic wooded stock | `/communities/forest-hills/` hero, cards | A Seidman Park panorama (2018) was reported in a Commons search; the file URL was not captured. Browse: https://commons.wikimedia.org/wiki/Category:Thornapple_River_(Michigan) | Unverified. Needs human review | No. Placeholder |

## Notes for the photographer

- Prefer place and lifestyle over houses; no identifiable people without a signed release.
- Avoid private homes unless the owner has granted written permission.
- A single strong image per place is enough to start; vertical crops are not needed.
- Record the license or release for every image in `src/data/placeImages.ts`.

## Unresolved image approvals

All ten places above are unresolved. Nothing has been approved for publication.
