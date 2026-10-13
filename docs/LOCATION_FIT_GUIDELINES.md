# Location Fit Guidelines ("Find Your West Michigan Fit")

Page: `/find-your-fit/` · Configuration: `src/data/locationFit.ts` · Engine: `src/utils/fit.ts` · UI script: `src/scripts/find-fit.ts`

## What the tool does

Page: `/find-your-fit/`. It asks **six or seven** short questions about **home and lifestyle preferences** and suggests **two or three** of the five communities (Rockford, Ada, East Grand Rapids, Cascade, Forest Hills) as places to explore first, "based on what you told me."

| # | Question (`formField`) | Notes |
|---|---|---|
| 1 | What matters most to you? Choose up to three (`top_priorities`) | Strongest signal (weight 3). Drives branching. |
| 2 | What kind of water setting are you most drawn to? (`water_type`) | **Branch:** shown only if water is a top priority. All-sports lake, quieter inland lake, riverfront, near water, open. |
| 3 | Which setting feels most like home to you? (`setting`) | Village, connected neighborhood, larger lot, wooded, lake-centered, flexible (each with a visible hint). |
| 4 | What kind of home are you most drawn to? (`home_preference`) | Character vs. traditional vs. newer/updated vs. move-in ready. |
| 5 | Trade a shorter drive for setting, space or water? (`drive_tradeoff`) | The **only** Grand Rapids proximity question. Measures willingness to trade drive time; never implies a community lacks access. |
| 6 | How much property care are you comfortable with? (`property_care`) | Actual ownership burden, including waterfront upkeep. |
| 7 | What would be hardest to give up? (`hardest_to_give_up`) | Modest extra signal **and** the tie-breaker. |

Concepts kept deliberately distinct: **newer/updated** (age, style, renovation state) vs. **move-in ready** (willingness to take on projects) vs. **lower maintenance** (ongoing property burden).

- Deterministic, runs entirely in the browser, sends nothing while a visitor answers. No name, email or phone before results.
- Progress counts only the questions actually shown ("Question 2 of 7" with the water branch, "of 6" without). Back retraces the questions the visitor saw; removing water from Q1 clears the water answer.
- Each result card has: the community and fit position; **Why it fits** (2-4 items, each quoting one of the visitor's answers); **What I'd want you to know** (relevant tradeoffs first, then neutral orientation facts); **If I were showing you the area...** (Amie's first-person orientation plus one personalized stop); a guide link; and **Send me homes that fit {Community}**. No percentages or scores are shown.
- If Rockford is among the leading results and lake water (not river-only) is a priority, a block links to the Rockford-area lakes.
- Answer text must be plain language with visible hints where useful (no tooltips). Do not use "close-in" in user-facing text; tests check for it.

## What it intentionally does not do

- It does not rank communities as better or worse, and it does not say where anyone "belongs."
- It is not an algorithm or AI, and the site never calls it a quiz or a scientific instrument.
- It does not ask about, infer, or use protected characteristics or their proxies.

## How the matching works

1. Each answer maps to **preferences** `{ dimension, target 0..1, weight }` (`src/data/locationFit.ts`).
2. Each community has a **profile**: a 0..1 value per dimension.
3. Preferences on the same dimension are merged; a community's score is the weighted average of `1 - |target - value|`.
4. **One dimension per concept.** Walkability (`village`), privacy (`space`) and Grand Rapids proximity (`proximity`) are each measured once, so a community can't win by being counted several times for the same trait. This is what previously over-rewarded East Grand Rapids.
5. **Water is split by type:** `lakeDepth` (a deep, varied inland-lake market), `allSports`, `quietLake`, `river`, `nearWater`, and `waterGeneral` (when no type is given). Rockford is strong on lake types; East Grand Rapids is strong on "near water" (Reeds Lake) but low on lake-market depth; Ada and Cascade are strong on river; Forest Hills is not a waterfront market.
6. Q7 adds a modest weight (1.5; water uses the chosen water type at half weight) and breaks near-ties (within 0.01) toward the community strongest on what the visitor would hate to give up.
7. The top two are always shown; a third only when within 0.06 of the leader.
8. Result copy comes from `src/data/fitOrientation.ts` (reasons, orientation facts, tradeoffs, tour base and personalized stops). The personalized stop is chosen from, in order: the Q7 answer, the water type, Q1 priorities, the setting, and a shortest-drive preference. At most one water-related tradeoff appears per card.

Every factual statement in result copy is sourced in `docs/LOCATION_FIT_SOURCES.md`.

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

- `tests/unit/fit.spec.ts` scans the Location Fit questions, profiles, all result content in `fitOrientation.ts`, the source files themselves (outside guardrail comments), and generated results for 120 answer combinations for prohibited terms. It also checks five personas (lake, walkable/character, wooded/privacy, river, village + space). A failing test means a prohibited word was added; fix the wording rather than the list.
- Community pages still say to confirm school boundaries "directly with the district" only where a name like Forest Hills depends on it. They contain no school quality or ranking claims. Keep it that way.

## How to edit safely

- **Change weights or profile values:** edit `communityProfiles` (traits) or `fitQuestions[].options[].prefs` (answer targets and weights) in `src/data/locationFit.ts`, then run `npm test`; the persona tests show whether the directional behavior still holds.
- **Change result wording or Amie's recommendations:** edit `src/data/fitOrientation.ts`. Add a personalized stop by keying it to a dimension (e.g. `nature`) or a water type (e.g. `riverfront`). Verify any new place or fact and add it to `docs/LOCATION_FIT_SOURCES.md`.
- **Add a community:** add it to `src/data/communities.ts`, a full profile (every dimension) in `communityProfiles`, and an entry in `fitOrientation`. Tests check all three.
- **Change a question:** keep answers about preferences, keep `formField` names stable (Amie sees them in Formspree emails), and keep a non-judgmental option such as "Flexible" or "Open." A branch uses `showIf`.
- **Add a dimension:** add it to the `Dimension` type, the `dimensions` list, and every profile.
- Never describe a community as suited to a particular demographic group, and never state lake acreage, depths, boating rules or public access unless verified from an authoritative source.
- Re-read this file before any edit.
