# Content Guide

## Brand voice

Concise, warm, intelligent, experienced, calm, confident, highly personal, thoughtful, practical.

Show quality through what Amie actually does (prepares, coordinates, communicates, follows through) rather than through adjectives. Never use "white-glove service." Avoid: "Find Your Dream Home," "Your Local Real Estate Expert," "Unlock Your Home's Potential," "Luxury Living Starts Here," "Making Dreams Come True," "unparalleled," "elite," "world-class," "premier Realtor," "top producer," unless factual evidence later supports a claim.

Central line: **Real estate guidance for the moments that matter.** A transaction is usually part of a larger life moment; Amie helps clients through the whole move.

## First-person voice (V2)

Service and brand pages speak as Amie ("When I work with a seller..."). Keep third person (or neutral voice) for metadata, structured data, legal text, client testimonials, and educational Insights articles where it aids clarity. Do not force first person into reference facts, and do not turn every paragraph into an opinion: pair neutral information with a short practical "from me" note.

Approved claims about Amie: more than 15 years in real estate; seven years living on Lake Bella Vista; the last eight years living on Silver Lake; has helped many clients buy and sell lakefront homes in Rockford and the surrounding area. Do not invent a start year, volume, rankings, or awards.

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
