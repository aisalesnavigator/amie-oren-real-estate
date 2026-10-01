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
| `npm test` | Playwright browser tests (needs a build first; first run: `npx playwright install chromium`) |
| `npm run check` | Everything above in order |
| `npm run build:review` | Design-review build **with** illustrative sample reviews (noindex). Never publish this. |

## Static deployment

Build with `npm run build` and publish the `dist/` directory. Set `PUBLIC_SITE_URL` in the host's build environment (for example `https://amieorenrealestate.com`). No server, adapter, or host-specific configuration is required. Redirect `404` handling: `dist/404.html` is generated, and most static hosts use it automatically.

## Where things live

```
src/
  assets/amie/  Amie photography (the only copy)
  components/   reusable UI (header, footer, forms, cards, article parts, SEO, JSON-LD)
  config/       site.ts (business info + form endpoints), nav.ts, siteUrl.ts
  content/
    insights/   Insights articles (Markdown)
    reviews/    client reviews (Markdown frontmatter) - see docs/REVIEW_WORKFLOW.md
  data/         communities.ts (community page content)
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
