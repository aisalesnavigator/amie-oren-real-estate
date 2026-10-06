# Amie Oren Real Estate Professional

Static marketing site for Amie Oren (Five Star Real Estate), built with **Astro + TypeScript**. Output is plain static HTML/CSS with a few tiny inline scripts (mobile menu, form enhancement), so it can be hosted anywhere: Netlify, Cloudflare Pages, GitHub Pages, Vercel, or any static host.

Requires Node 22.12+ (developed on Node 24).

## Local development

```bash
npm install
npm run dev        # http://localhost:4321 (illustrative sample reviews are visible in dev only)
npm run build      # production build into dist/
npm run preview    # serve dist/ locally at http://localhost:4321
```

Other commands:

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | `astro check` (TypeScript + Astro diagnostics) |
| `npm run lint` | ESLint |
| `npm run verify` | Checks `dist/` after a build: routes exist, internal links resolve, unique titles, JSON-LD is valid and invents nothing, forms are POST with identifiers, no sample reviews, no tracking code |
| `npm test` | Playwright: unit tests for the fit engine and fair-housing guardrails, plus browser tests on desktop, tablet and mobile (needs a build first; first run: `npx playwright install chromium`) |
| `npm run check` | Everything above in order |
| `npm run build:review` | Design-review build **with** illustrative sample reviews (noindex). Never publish this. |

## Static deployment

Build with `npm run build` and publish the `dist/` directory. Set `PUBLIC_SITE_URL` in the host's build environment (for example `https://amieorenrealestate.com`). No server, adapter, or host-specific configuration is required. Redirect `404` handling: `dist/404.html` is generated, and most static hosts use it automatically.

## Where things live

```
src/
  assets/amie/  Amie photography (the only copy)
  assets/places/ licensed community/lake photography (see docs/COMMUNITY_IMAGE_BRIEF.md)
  components/   reusable UI (header, footer, forms, cards, article parts, SEO, JSON-LD)
  config/       site.ts (business info + form endpoints), nav.ts, siteUrl.ts
  content/
    insights/   Insights articles (Markdown)
    reviews/    client reviews (Markdown frontmatter) - see docs/REVIEW_WORKFLOW.md
  data/         communities.ts, lakes.ts, locationFit.ts, placeImages.ts
  layouts/      BaseLayout, InsightArticle
  pages/        routes (communities/[slug].astro is the reusable community template)
  scripts/      forms.ts (progressive enhancement for forms)
  styles/       global.css (design tokens and primitives)
  utils/        reviews, insights, schema (JSON-LD), url helpers
docs/                 guides and checklists
```

### Images

Amie's photography lives in one place: `src/assets/amie/` (`amie-headshot.png`, `amie-portrait.png`, `amie-lifestyle-wide.png`). Astro generates responsive, compressed WebP/JPEG sizes from them at build time, so the large originals are not shipped to visitors. To replace a photo, overwrite the file (keep the filename or update the import). Usage: lifestyle-wide = homepage hero and social card; portrait = About and homepage "Meet Amie"; headshot = contact, review, referral and article author modules. Gradient "photography to come" slots (`ImageSlot.astro`) stand in for future community, property and waterfront photography.

## Changing business information

Edit `src/config/site.ts`. Optional values (phone, office, license, legal notice, social profiles, review links) are `undefined`/empty until real information exists. Anything you set appears automatically in the footer, contact page, and structured data. Never add unverified details. The navigation is in `src/config/nav.ts`.

## Forms

All three forms (Contact, Leave a Review, Refer Someone) are standard HTML `POST` forms. The endpoint is centralized in `src/config/site.ts`:

- `PUBLIC_FORM_ENDPOINT` unset: uses the current Formspree form (`https://formspree.io/f/mnpnylyj`).
- `PUBLIC_FORM_ENDPOINT=<url>`: posts to that URL.
- `PUBLIC_FORM_ENDPOINT=` (set but empty): online submission is off; each form clearly says so and prepares an email to `Amieoren@yahoo.com` instead.
- `PUBLIC_REVIEW_FORM_ENDPOINT` optionally sends reviews to a separate form; otherwise reviews use the main endpoint.

Each form submits a hidden `form_type` (`contact`, `client_review`, `referral`), a hidden `_subject`, and a honeypot field (`_gotcha`). Without JavaScript the browser posts straight to the endpoint. With JavaScript the site adds accessible validation, a sending state, an inline error message with an email fallback, and a redirect to `/thank-you/`.

## Changing the domain

Set `PUBLIC_SITE_URL` (no trailing slash). It drives canonical URLs, Open Graph URLs, the sitemap, RSS, `robots.txt`, and JSON-LD. The default in `src/config/siteUrl.ts` is `https://amieorenrealestate.com`.

## Adding a community

Add an entry to `src/data/communities.ts` (it follows the `Community` interface) and the page appears at `/communities/<slug>/` with a card on the index. Add it to `site.serviceAreas` in `src/config/site.ts` if it should show in the footer and structured data. Keep content qualitative unless a verified, sourced fact is supplied. See `docs/CONTENT_GUIDE.md`.

## Adding an Insights article

Add a Markdown file to `src/content/insights/`. Required frontmatter: `title`, `description`, `publishedDate`, `summary` (the short answer shown at the top). Optional: `updatedDate`, `reviewedBy` (set only when someone has really reviewed it), `community`, `topics`, `intent`, `heroImage`, `sources`, `faq`, `relatedContent`, `noindex`, `draft`. `draft: true` hides an article entirely. `noindex: true` publishes it but keeps it out of search, the sitemap, and RSS. The three demonstration articles are `noindex` until Amie reviews them (remove `noindex` and add `reviewedBy` when ready).

## Adding approved reviews

See `docs/REVIEW_WORKFLOW.md`. In short: add a Markdown file to `src/content/reviews/` with `verified: true`, `permissionToPublish: true`, `draft: false` (and no `sample`). Only reviews meeting all three conditions render in production. The `sample-*.md` files are illustrative; they render only under `npm run dev` or `npm run build:review`, are labeled on-page, and can never appear in `npm run build`.

## Content architecture and SEO/AEO

Pages set unique titles/descriptions, canonical URLs, Open Graph and Twitter cards. The sitemap (`/sitemap-index.xml`), `robots.txt`, and Insights RSS (`/rss.xml`) are generated. JSON-LD includes `WebSite`, `RealEstateAgent`, `Person`, `Article`, `BreadcrumbList`, and `FAQPage` (only where the FAQ is visibly shown). It never includes ratings, review counts, price ranges, awards, credentials, addresses, or licenses.

There is no analytics, advertising, tracking, or CRM code in this build.

## V2 features

Voice: the site speaks in Amie's first person ("I help my clients..."). Metadata, structured data, legal text, and testimonials stay neutral. Experience is stated as "more than 15 years" (no invented start year).

### Find Your West Michigan Fit (`/find-your-fit/`)

A short, client-side-only guided set of questions that suggests two or three communities. Nothing is collected or sent while answering; results are not gated. Logic is deterministic and editable in `src/data/locationFit.ts`; the engine is `src/utils/fit.ts`. **Read `docs/LOCATION_FIT_GUIDELINES.md` before editing** (fair-housing boundaries).

- **Change location weights:** edit the numbers in `communityProfiles` (how strongly each community has each trait) or `fitQuestions[].options[].prefs` (target and weight of an answer).
- **Add a community:** add it to `src/data/communities.ts`, add a full profile to `communityProfiles`, and (optionally) to `site.serviceAreas`. Tests verify the profile.
- **Change a question:** edit `fitQuestions`; keep `formField` names stable because they are the field names Amie sees in submissions.

### Saved search (`/home-search/`)

Posts to the same Formspree endpoint as the other forms with `form_type=location_fit_search`. It is **not automated**: the request arrives by email and Amie creates the saved search by hand in her own listing system. Query parameters prefill the form (whitelisted): `community`, `lake`, or the full fit result from the Find Your Fit page.

**Processing a request:** open the Formspree email. Look at name/email/phone, communities and lakes, waterfront, price range, bedrooms/bathrooms, timing and notes. When the request came from Find Your Fit it also includes `search_source`, `fit_primary`, `fit_secondary`, the raw answers (`water_priority`, `walkability`, `privacy_preference`, `home_character`, `maintenance`, `gr_access`, `recreation`, `setting`, `priorities`) and a readable `fit_summary`. Create the saved search, then reply personally.

**Verify Formspree data:** submit a test from each of `/home-search/`, `/home-search/?community=rockford&lake=silver-lake` and a completed `/find-your-fit/` result, then confirm the email shows `form_type = location_fit_search` and the expected fields.

### Rockford lakes (`/waterfront/rockford-lakes/`)

One hub page built from `src/data/lakes.ts` (Bostwick, Silver, Lake Bella Vista, Myers, Brower). **Add a lake:** add an entry using `build(...)`; it gets a section, jump link, saved-search CTA (`/home-search/?community=rockford&lake=<slug>`) and a checkbox on the saved-search form automatically. **Add verified facts** only through `verifiedFacts` (each needs a source). The data deliberately contains no depths, acreage, frontage, designations, rules, taxes, values, or inventory numbers.

### V3 refinements

- About page: the empty “Background” placeholder was removed; the page ends with the principles and the conversation CTA.
- Lake-residency wording: About, `/waterfront/`, the Rockford community page and the Rockford lakes hub introduction say *“Over the last 15 years, I’ve lived on both Lake Bella Vista and Silver Lake.”* Exact years remain only in the individual Lake Bella Vista and Silver Lake sections (`src/data/lakes.ts`).
- Location Fit: “Close-in and connected” became “Closer to Grand Rapids and everyday amenities”, with visible plain-language hints on the setting question. Logic and field values are unchanged.
- Community resources: each community page has a “Want to explore on your own?” list driven by `src/data/communityResources.ts` (external links open in a new tab with `rel="noopener noreferrer"`). See `docs/CONTENT_GUIDE.md`.
- Photography: candidates are documented but none is embedded yet (see below).

### Photography

Four owner-supplied lake photos (two for Silver Lake, two for Lake Bella Vista) appear only in the Rockford lake drill-down sections. Every other place still shows a designed placeholder until a licensed photo is added. To add one, save `src/assets/places/<place-slug>-<subject>.jpg` and register it in `src/data/placeImages.ts` (a `primary` photo, plus optional `secondary` photos for lakes); both are required for an image to appear. See `docs/COMMUNITY_IMAGE_BRIEF.md` for the shot list, rights status and process.

### Waterfront gallery (`/waterfront/`)

A reusable carousel fed by `src/data/waterfrontGallery.ts`; photos live in `src/assets/waterfront/`. It is empty by design (designed placeholders show) and adapts to 0, 1-2, or 3+ approved photos. It is deliberately separate from the lake-section photos. Details in `docs/COMMUNITY_IMAGE_BRIEF.md`.
