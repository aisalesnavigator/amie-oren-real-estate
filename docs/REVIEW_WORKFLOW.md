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

## Illustrative client experiences (temporary, public, labeled)

While real client-submitted experiences are being collected, `/client-experiences/` shows three **temporary illustrative examples** so the page has substance. They are **not real testimonials**:

- They live in the same collection as real reviews: `src/content/reviews/illustrative-*.md`, with `illustrative: true`. The schema refuses an illustrative entry that is also marked `verified`, `permissionToPublish` or `sample`, so one can never be mistaken for a real review.
- They carry no name, initials, address, rating or claim of a verified client. Each card shows the quiet label "Illustrative client experience", and the page carries the note "Illustrative examples shown while client-submitted experiences are being collected."
- They appear **only** on `/client-experiences/` (never on the homepage, whose section is for real reviews) and are **never** used in structured data. No Review, AggregateRating or rating markup is generated, and `npm run verify` fails if any appears.
- **To remove one**, delete its file (or set `draft: true`). Delete all three once enough real reviews are published. When real reviews exist they are listed first, and the page text adapts automatically.
- Real reviews are unchanged: the form posts to Formspree, nothing publishes itself, and a review renders only when `verified: true`, `permissionToPublish: true`, `draft: false` (and it is not `sample` or `illustrative`).

## Review-only sample reviews and review mode

Files named `sample-*.md` are design-review content marked `sample: true`. They:

- render only in the dev server or in a deliberate `npm run build:review` build;
- carry the visible label "Illustrative draft - replace with verified client review";
- when included, **review mode** also shows the "Design-review build" banner and forces `noindex` on every page;
- are excluded from `npm run build` and checked by `npm run verify`, which fails if sample text, the review banner, or an unexpected `noindex` appears in a production build.

**Review mode is a build mode, not an environment variable.** `npm run build:review` runs `astro build --mode review`; `npm run build` always runs in `production` mode, so no host setting, `.env` file or `PUBLIC_*` variable can turn the banner or `noindex` on. (Until October 2026 a `PUBLIC_SHOW_SAMPLE_REVIEWS` variable did this; it was removed.) `build:review` also refuses to run on Netlify. `netlify.toml` pins the host's build command to `npm run build`.

Intentional `noindex` pages in production: `/review/`, `/thank-you/`, `/404`, and any Insights article whose frontmatter says `noindex: true`. They are also kept out of the sitemap.
