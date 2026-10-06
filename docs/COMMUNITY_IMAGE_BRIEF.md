# Community & Lake Image Brief

## Current status

**No place photography has been added.** Every community and lake image is currently a branded placeholder (a soft gradient with a line motif and a caption describing the intended photograph). No suitable image could be confirmed as owned, commercially licensed, public domain, or appropriately Creative Commons licensed from within this build, and images were not taken from search results. Rights discipline came first.

The site is ready for photography: drop an image and register its rights, and the placeholder is replaced automatically.

## How to add a licensed photo

1. Save the image as `src/assets/places/<slug>.jpg` (or `.jpeg`, `.png`, `.webp`). Slugs: `rockford`, `ada`, `east-grand-rapids`, `cascade`, `forest-hills`, `bostwick-lake`, `silver-lake`, `lake-bella-vista`, `myers-lake`, `brower-lake`.
2. Add an entry to `src/data/placeImages.ts` with `alt`, `credit`, `license` and (if applicable) `sourceUrl`.
3. Run `npm run build`. **An image appears only if both the file and its rights entry exist.** A credit line is shown on the photo.

Acceptable sources: photos taken by or for Amie, commercially licensed stock or commissioned photography, public domain, or Creative Commons licenses that allow this use (note any attribution or share-alike terms). Do not use images from Google Images, social media, or MLS/brokerage listing photos without written permission.

Technical: landscape, at least 2000 px wide, sRGB, no text or logos. Hero crops are about 5:4; lake cards 16:10, so keep the subject near the center.

## Shot list

| Place | Recommended subject | Orientation | Ideal time / light | Composition | What makes it locally recognizable | Used on | Status | Source / license |
|---|---|---|---|---|---|---|---|---|
| Rockford (community) | A Rockford-area lake at golden hour with a dock and shoreline | Landscape | Early morning or the hour before sunset | Water in the lower third, dock leading in, soft sky | A lake shoreline Amie can identify by name; avoid anonymous "lake" stock | Rockford hero, community cards, Waterfront | Placeholder | none |
| Silver Lake | Shoreline and dock at sunrise | Landscape | Sunrise, calm water | Low angle along the dock, horizon centered | Distinct shoreline and tree line of Silver Lake itself | Rockford lakes hub (hero card) | Placeholder | none |
| Lake Bella Vista | Water view from the shore, cottage or dock in frame | Landscape | Golden hour | Shoreline curve with a home or boathouse in the distance | Lake outline and homes along the shore | Rockford lakes hub | Placeholder | none |
| Bostwick Lake | Open water with shoreline | Landscape | Morning | Wide, water-led composition | Recognizable bay or shoreline of Bostwick Lake | Rockford lakes hub | Placeholder | none |
| Myers Lake | Shoreline or dock | Landscape | Golden hour | Dock leading into the lake | Recognizable shoreline of Myers Lake | Rockford lakes hub | Placeholder | none |
| Brower Lake | Shoreline or dock | Landscape | Golden hour | Water-led composition | Recognizable shoreline of Brower Lake | Rockford lakes hub | Placeholder | none |
| Ada | Ada Village main street or a river view at the village | Landscape | Late afternoon, soft light | Street or river with the village's recognizable buildings or bridge | Ada Village storefronts or the Thornapple/Grand River setting; verify the subject is clearly Ada | Ada hero, cards | Placeholder | none |
| East Grand Rapids | Reeds Lake with the shoreline or Gaslight Village streetscape | Landscape | Golden hour | Lake with the path or village storefronts | Reeds Lake or Gaslight Village are unmistakable | EGR hero, cards | Placeholder | none |
| Cascade | A distinctive Cascade-area landmark or setting (to be chosen with Amie, such as a recognizable park, river crossing, or village corner) | Landscape | Soft daylight | Wide establishing shot of the chosen place | Must be clearly identifiable as Cascade; avoid generic suburban streets | Cascade hero, cards | Placeholder | none |
| Forest Hills | A distinctive Forest Hills-area setting (to be chosen with Amie, such as a recognizable trail, park, or tree-lined road) | Landscape | Fall color or soft light | Establishing shot of a place locals would recognize | Must be locally identifiable; avoid generic wooded stock | Forest Hills hero, cards | Placeholder | none |

## Notes for the photographer

- Prefer place and lifestyle over houses; no identifiable people without a signed release.
- Avoid private homes unless the owner has granted written permission.
- A single strong image per place is enough to start; vertical crops are not needed.
- Record the license or release for every image in `src/data/placeImages.ts`.
