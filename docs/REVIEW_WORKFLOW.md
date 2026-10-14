# Review Workflow

Reviews are always moderated. A submission can never publish itself.

## Flow

1. **Amie sends a client to `/review/`** (for example `https://<domain>/review/`). See `REVIEW_REQUEST_TEMPLATES.md`.
2. **The client submits the form.** It posts to the configured endpoint (`PUBLIC_REVIEW_FORM_ENDPOINT`, falling back to `PUBLIC_FORM_ENDPOINT`) with `form_type=client_review`. If no endpoint is configured, the page explains that the review can be emailed to Amieoren@yahoo.com.
3. **Amie receives a notification** from the form provider (currently Formspree). The subject begins "New client review submitted (unpublished - needs verification)".
4. **The review stays unpublished.** Nothing in the site reads form submissions.
5. **Verify and confirm permission.** Confirm the person was a real client and that they agreed to publish (the form includes a required permission checkbox; confirm by email if anything is unclear). Respect the display-name choice they selected.
6. **Add the review to `src/content/reviews/`** (below).
7. **Rebuild and deploy.** The review appears on `/client-experiences/` and in the homepage section.

## Adding a review manually

Create `src/content/reviews/<short-name>.md`:

```markdown
---
clientName: 'Full Name (internal; never shown)'
displayName: 'Jane D.'
community: 'Ada'
experienceType: 'seller'   # seller | buyer | waterfront | move-up | downsizing | referral | other
reviewText: 'The review text, lightly edited only with the client approval.'
source: 'Direct client submission'
submittedDate: 2026-10-15
publishedDate: 2026-10-20
verified: true
permissionToPublish: true
featured: false
draft: false
---
```

A review renders in production only if `verified: true`, `permissionToPublish: true`, `draft: false`, and `sample` is not set. Do not edit review text for substance without the client's approval. Never publish the client's email.

Aggregate ratings, star counts, and review-count structured data are intentionally not output. Do not add them unless a legitimate rating system exists.

## Published reviews and how they display

Three approved client reviews were published in October 2026 (`src/content/reviews/client-*.md`). They replaced the temporary illustrative examples, which were deleted along with the review-only `sample-*.md` files. The `illustrative` flag no longer exists in the schema.

- **Attribution:** add an `attribution` field with the exact label the client approved (e.g. `'Seller · West Michigan'`). When it is set, the card shows only that label: no name, initials, rating or other detail. Without it, the card falls back to `displayName` plus the experience type and community.
- **`clientName`** is internal and never shown. Use the client's name only if they approved it; otherwise `'Withheld (on file with Amie Oren)'`.
- **Homepage:** the homepage shows up to two reviews marked `featured: true`, with a link to `/client-experiences/`. If none is featured, it shows the most recent approved reviews.
- **Client Experiences page:** every approved review, newest first (reviews published together keep file order). The first is shown as a full-width lead quote.
- No Review, AggregateRating or rating structured data is generated. `npm run verify` fails if any appears, or if any quote in production is not a verified review.

## Review-only sample reviews and review mode

Review mode still supports design-review content marked `sample: true` (none exists today; the old `sample-*.md` files were deleted when real reviews were published). Such entries:

- render only in the dev server or in a deliberate `npm run build:review` build;
- carry the visible label "Illustrative draft - replace with verified client review";
- when included, **review mode** also shows the "Design-review build" banner and forces `noindex` on every page;
- are excluded from `npm run build` and checked by `npm run verify`, which fails if sample text, the review banner, or an unexpected `noindex` appears in a production build.

**Review mode is a build mode, not an environment variable.** `npm run build:review` runs `astro build --mode review`; `npm run build` always runs in `production` mode, so no host setting, `.env` file or `PUBLIC_*` variable can turn the banner or `noindex` on. (Until October 2026 a `PUBLIC_SHOW_SAMPLE_REVIEWS` variable did this; it was removed.) `build:review` also refuses to run on Netlify. `netlify.toml` pins the host's build command to `npm run build`.

Intentional `noindex` pages in production: `/review/`, `/thank-you/`, `/404`, and any Insights article whose frontmatter says `noindex: true`. They are also kept out of the sitemap.
