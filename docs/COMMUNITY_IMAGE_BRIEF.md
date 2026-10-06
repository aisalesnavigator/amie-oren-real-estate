# Community & Lake Image Brief

## Current status (V3 refinement pass)

**Four owner-supplied photos are embedded, in the Rockford lake drill-down only** (`/waterfront/rockford-lakes/`):

| File (`src/assets/places/`) | Displayed caption | Lake section | Role |
|---|---|---|---|
| `silver-lake-rainbow-reflection.jpg` | **Silver Lake Sunrise** | Silver Lake | Primary (5:4 frame) |
| `silver-lake-sunset-reflection.jpg` | **Silver Lake Sunset** | Silver Lake | Secondary (16:10) |
| `lake-bella-vista-sunrise-reflection.jpg` | **Lake Bella Vista Sunrise** | Lake Bella Vista | Primary (16:10) |
| `lake-bella-vista-sunset-reflection.jpg` | **Lake Bella Vista Sunset** | Lake Bella Vista | Secondary (16:10) |

The Silver Lake rainbow photo is treated as the Silver Lake Sunrise image for now. Files are never renamed or duplicated to get a caption: the visible caption is derived from the place and the `moment` field in the register.

### Photography convention: one sunrise and one sunset per featured lake

The long-term goal is a consistent collection of real lake life, not a miscellaneous gallery: for every featured lake, one **sunrise** and one **sunset** photo (Silver Lake, Lake Bella Vista, Bostwick Lake, Myers Lake, Brower Lake, and any lake added later). Sunrise is the lake's primary photo and sunset its secondary. A unit test allows at most one of each per lake.

### Caption treatment

Every photo is shown as `<figure>` with the image first and a caption beneath it: the descriptive caption ("Silver Lake Sunrise") in the serif face, then a much smaller, quiet, sentence-case credit line ("Photo: Amie Oren Real Estate") in the muted text color. The credit is no longer an uppercase badge on the image. Both come from one shared component (`PhotoCaption.astro`), so the lake sections and the gallery always match. The credit never replaces the image's alt text, which describes the scene; a test checks that alt differs from the caption.

- **Rights basis:** supplied by the site owner on 2026-10-06 as owned and approved for use on this website. Registered in `src/data/placeImages.ts` (`approval: 'owned-approved'`). The credit reads "Photo: Amie Oren Real Estate"; change `credit` in the register if a different line is preferred (for example the photographer's name).
- **Where they appear:** in their lake drill-down section and, for Silver Lake Sunrise only, as the first photo of the overall `/waterfront/` gallery (owner-approved; it references the same file, no copy). They never appear in the `/waterfront/` hero, the homepage, or community heroes and cards. Tests enforce this. Do not reuse them elsewhere without the owner's approval.
- **Not yet photographed:** Rockford (community), Bostwick Lake, Myers Lake, Brower Lake, Ada, East Grand Rapids, Cascade and Forest Hills still show the designed placeholder.
- **Privacy:** the files carry no EXIF/GPS metadata, and a unit test fails if any image in `src/assets/places/` or `src/assets/waterfront/` has any. Before adding a new photo, strip metadata (for example `sharp(input).rotate().toFile(output)`, which also applies the camera orientation). Astro generates the responsive WebP sizes; the originals are not shipped to visitors.

The remaining candidate research below is unchanged: its URLs came from web search only and **their licenses are unverified**. The build environment could not open Commons, Unsplash, Pexels or the municipal and lake-association sites, so nothing from them is embedded.

Rule applied: *research freely, publish carefully.* Where rights are unclear, the image is recorded here for human approval and the placeholder stays. Strong placeholders are not swapped for weak imagery.

### Fastest route to real photography

1. **Amie's own photos.** She lives on Silver Lake and previously lived on Lake Bella Vista; a handful of her own sunrise, dock and shoreline photos would be the most authentic and rights-clean option for the Rockford hero and the lake hub.
2. A person opens each candidate below, confirms the license on the file page (Commons shows it under "Licensing"), checks the subject really is the named place, and approves or rejects it.
3. For anything that needs permission (lake associations, photographers), ask in writing and keep the reply.

## How to add a licensed photo

1. Save the image as `src/assets/places/<place-slug>-<subject>.jpg` (or `.jpeg`, `.png`, `.webp`), for example `myers-lake-dock-morning.jpg`. Place slugs: `rockford`, `ada`, `east-grand-rapids`, `cascade`, `forest-hills`, `bostwick-lake`, `silver-lake`, `lake-bella-vista`, `myers-lake`, `brower-lake`.
2. Add an entry in `src/data/placeImages.ts`, keyed by the file name without its extension, with `slug`, `role` (`primary` or `secondary`), **`moment`** (`sunrise`, `sunset` or `other`), `alt` (describe the scene, not the caption), `credit`, `license`, `approval` and, if relevant, `sourceUrl`. The caption is derived as "<place name> <Moment>" (set `caption` only to override it). A place has one `primary` photo (used by community heroes and cards, or the lake's lead image) and any number of `secondary` photos (lake drill-down sections only).
3. Run `npm run build`. **An image appears only if both the file and its rights entry exist** (a test also fails if a file has no entry). A lake with a primary and a secondary photo shows both stacked on desktop and as a swipe strip on phones and tablets.

**Adding "Bostwick Lake Sunrise":** save `src/assets/places/bostwick-lake-sunrise.jpg` and add `'bostwick-lake-sunrise': { slug: 'bostwick-lake', role: 'primary', moment: 'sunrise', alt: '...', ...ownedApproved }`. Add the sunset the same way with `role: 'secondary'`, `moment: 'sunset'`. No component or carousel code changes.

Acceptable sources: photos taken by or for Amie, commercially licensed stock or commissioned photography, public domain, Creative Commons licenses that allow this use (record attribution and any share-alike terms), Unsplash/Pexels (record photographer and page URL), or official municipal/tourism sources that explicitly permit reuse. Do not use Google Images, social media, or MLS/brokerage listing photos without written permission.

Technical: landscape, at least 2000 px wide, sRGB, no text or logos. Hero crops are about 5:4; lake cards 16:10, so keep the subject near the center. No identifiable people without a release; avoid private homes without written owner permission.

Placement intent (keep the site restrained, never reuse the same photo): community hero areas, and the lake drill-down sections of the Rockford lakes hub. The overall `/waterfront/` gallery (below) is a separate, broader collection fed from `src/data/waterfrontGallery.ts`.

## Shot list

| Location | Recommended subject | Orientation | Ideal composition | Lighting / time | What makes it locally recognizable | Intended page / use | Candidate source (unverified) | License / usage status | Embedded? |
|---|---|---|---|---|---|---|---|---|---|
| Rockford (community) | A Rockford-area lake with a dock and shoreline; alternative: downtown Rockford and the Rogue River dam area | Landscape | Water in the lower third, dock leading in, soft sky | Early morning or the hour before sunset | A shoreline Amie can identify by name; avoid anonymous "lake" stock | `/communities/rockford/` hero, community cards, `/waterfront/` panel | Commons category for browsing: https://commons.wikimedia.org/wiki/Category:Lakes_of_Michigan (no specific Rockford file confirmed) | Unknown. Needs human review | No. Placeholder |
| Silver Lake | **Embedded (2).** Rainbow + sunset reflections (owner photos); more welcome: shoreline and dock at sunrise | Landscape | Low angle along the dock, horizon centered | Sunrise, calm water | Distinct shoreline and tree line of Silver Lake itself | `/waterfront/rockford-lakes/#silver-lake` | Owner-supplied (see status table). Other sources seen, not used: aerial set by a commercial photographer https://www.lakes-of-michigan.com/Photo-List/Silver-Lake-in-Rockford-Michigan-Aerial-Photos/n-CfmVwL (rights reserved presumed); lake association https://www.silverlakecannon.com/lake.html | Owned by the site owner; approved for this website | **Yes**, 2 photos |
| Lake Bella Vista | **Embedded (2).** Sunrise + sunset reflections (owner photos); more welcome: water view with a cottage or dock in frame | Landscape | Shoreline curve with a home or boathouse in the distance | Golden hour | Lake outline and homes along the shore | `/waterfront/rockford-lakes/#lake-bella-vista` | Wikipedia article (check its images and their Commons licenses): https://en.wikipedia.org/wiki/Lake_Bella_Vista_(Michigan) | Owned by the site owner; approved for this website (owner-supplied photos replace the research candidate) | **Yes**, 2 photos |
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

Silver Lake and Lake Bella Vista are resolved by the owner-supplied photos. The other eight places (Rockford community, Bostwick Lake, Myers Lake, Brower Lake, Ada, East Grand Rapids, Cascade, Forest Hills) are unresolved; nothing else has been approved for publication.

## Overall `/waterfront/` gallery

A reusable, data-driven carousel on `/waterfront/`, fed by `src/data/waterfrontGallery.ts`. It is a broader collection that grows over time and is separate from the lake sections. Today it holds one real photo, **Silver Lake Sunrise** (featured, first), followed by two designed "photography to come" placeholders.

- **No maximum.** Every approved entry becomes a slide; "Photo X of N", Previous/Next, the arrow keys and Home/End all derive from the slide count (checked with a temporary 12-photo gallery). Three is only a presentation threshold: below three real photos the carousel is padded with placeholders (each real photo replaces the next placeholder); from three up, only real photos show.
- **Add a photo already in the register** (no file copy): `{ id: 'bella-vista-sunset', placePhoto: 'lake-bella-vista-sunset-reflection', status: 'owned-approved' }`. Caption, alt, credit and moment are inherited.
- **Add a gallery-only photo:** save it in `src/assets/waterfront/` and add `{ id, file, lake, moment, alt, credit, status }`, optionally `featured: true` (shown first) or a `caption` override. The caption is derived as "<lake> <Moment>".
- `status` is `owned-approved`, `licensed-approved`, or `pending-approval` (kept in the file but never shown). An approved entry whose file is missing is skipped and reported as a build warning.
- **Do not add the other three lake-section photos here without explicit approval.** A test allows only the approved Silver Lake Sunrise reference.
- **Practical notes as it grows:** only the first image loads eagerly and the rest lazy-load; each photo generates three WebP sizes (roughly 10-50 KB each), so even dozens of photos add little weight; the gallery crops every photo to 3:2 from the center, so portrait photos lose their top and bottom (use landscape photos where possible).
