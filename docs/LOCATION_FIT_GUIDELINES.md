# Location Fit Guidelines ("Find Your West Michigan Fit")

Page: `/find-your-fit/` · Configuration: `src/data/locationFit.ts` · Engine: `src/utils/fit.ts` · UI script: `src/scripts/find-fit.ts`

## What the tool does

It asks nine short questions about **home and lifestyle preferences** (water, village access, lot and privacy, housing character, upkeep, Grand Rapids access, everyday recreation, setting, and optional priorities) and suggests **two or three** of the five communities (Rockford, Ada, East Grand Rapids, Cascade, Forest Hills) as places to explore first.

- It is deterministic, runs entirely in the browser, and sends nothing while a visitor answers.
- No name, email, or phone is requested before results. Value comes first; the saved-search request comes after.
- Results are presented as "Strongest fit" and "Also worth exploring", with explanations written from the visitor's own answers, honest "worth weighing" considerations, and a link to the full community page. It never shows percentages or scores.
- If Rockford leads and water is a stated priority, a block links to the Rockford-area lakes.

## What it intentionally does not do

- It does not rank communities as better or worse, and it does not say where anyone "belongs."
- It is not an algorithm or AI, and the site never calls it a quiz or a scientific instrument.
- It does not ask about, infer, or use protected characteristics or their proxies.

## How the matching works

1. Each answer maps to one or more **preferences** `{ dimension, target 0..1, weight }`.
2. Each community has a **profile**: a 0..1 value for each dimension (for example how strongly water or walkable village access characterize the area).
3. A community's score is the weighted average of `1 - |target - profileValue|`. Preferences on the same dimension are merged first.
4. The top two are always shown; a third is shown only when it scores within 0.10 of the leader. Ties resolve by the community order in `communityProfiles`.
5. Explanations come from the preferences a community matches closely; considerations come from strongly stated preferences it matches poorly (using the community's own `tradeoffs` text where provided).

Everything is inspectable in `src/data/locationFit.ts`. Profile values are editorial judgments for Amie to review.

## Fair-housing boundary (do not cross)

Real estate professionals must avoid steering. The tool therefore uses **property and lifestyle preferences only**.

Never add questions, answer options, dimension labels, explanations, or community profile text about:

- race, ethnicity, national origin, religion
- sex or gender
- disability
- familial status, children, marital status, "families," "empty nesters," "young" or "retiring" buyers, age
- school quality, rankings, or "good schools"
- crime or safety perceptions
- neighborhood demographics or composition
- places of worship or other proxies for the above

A visitor's life stage can shape what they want from a property. Ask about the preference directly instead: "How much indoor/outdoor space do you want?" not "Do you have kids?"; "How important is lower-maintenance living?" not "Are you retiring?"

Why these inputs are excluded: they are protected characteristics (or common proxies for them) under fair-housing law, and steering buyers toward or away from areas on those bases is prohibited, even when well-intentioned. The tool must work equally well for people of every age and household type.

## Guardrails in the repository

- `tests/unit/fit.spec.ts` scans the entire Location Fit configuration (questions, answers, dimension labels, community profile text) and generated explanations for prohibited terms. A failing test means a prohibited word was added; fix the wording rather than the list.
- Community pages still say to confirm school boundaries "directly with the district" only where a name like Forest Hills depends on it. They contain no school quality or ranking claims. Keep it that way.

## How to edit safely

- **Change weights or profile values:** edit numbers in `communityProfiles` (profiles) or `fitQuestions[].options[].prefs` (answer weights). Re-run `npm test`.
- **Add a community:** add it to `src/data/communities.ts`, add a profile (all 11 dimensions) in `communityProfiles`, then run the tests (they check every profile covers every dimension and matches a community).
- **Change a question:** edit `fitQuestions`. Keep answers about preferences, keep `formField` names stable (they are the field names Amie sees in Formspree emails), and keep at least one non-judgmental option such as "Flexible" or "Not important."
- **Add a dimension:** add it to the `Dimension` type, `dimensionLabels`, and every profile.
- Never describe a community as suited to a particular demographic group.
- Re-read this file before any edit.
