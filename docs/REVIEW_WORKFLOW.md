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

## Sample reviews

Files named `sample-*.md` are illustrative design content marked `sample: true`. They:

- render only in `npm run dev` or in a deliberate `npm run build:review` build;
- carry the visible label "Illustrative draft - replace with verified client review";
- force `noindex` and show a "Design-review build" banner when included;
- are excluded from `npm run build` and checked by `npm run verify`, which fails if sample text appears in a production build.

Delete the sample files before launch if you prefer; the site works without them.
