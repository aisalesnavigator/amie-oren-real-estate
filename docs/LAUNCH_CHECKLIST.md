# Launch Checklist

Items that need real-world input or verification before the site is public. Analytics, CRM, and MLS integrations are **not** required to launch.

## Domain and configuration
- [ ] Confirm ownership of the final domain (expected: `amieorenrealestate.com`).
- [ ] Set `PUBLIC_SITE_URL` in the hosting build environment.
- [ ] Choose a host and connect the repository (the site is host-independent).
- [ ] Confirm the form endpoint (`PUBLIC_FORM_ENDPOINT`, currently Formspree `mnpnylyj`) and send a real test of each form: Contact, Review, Referral. Confirm notifications reach Amieoren@yahoo.com and `form_type` appears.
- [ ] Decide whether reviews use a separate endpoint (`PUBLIC_REVIEW_FORM_ENDPOINT`).
- [ ] Confirm whether Formspree should redirect to `/thank-you/` after non-JavaScript submissions (optional; set in the Formspree form settings).

## Business information (`src/config/site.ts`)
- [ ] Phone number and preferred contact presentation.
- [ ] Office information, if it should be shown.
- [ ] License information (do not invent).
- [ ] Brokerage-required wording, logos, and disclosures from Five Star Real Estate (`legalNotice` slot in the footer).
- [ ] Fair-housing language and state-required disclosures, confirmed with the brokerage.
- [ ] Social profiles, if desired (`socialProfiles`).
- [ ] Third-party review profile links, if desired (`reviewLinks`).

## Content
- [ ] Amie to read every page of copy for accuracy and tone.
- [ ] Verify the factual geography statements on the five community pages (Rockford, Ada, East Grand Rapids, Cascade, Forest Hills), especially the Forest Hills description.
- [ ] About page: supply verified career history, designations, community involvement, credentials (placeholder blocks are marked "To be added").
- [ ] Review the three demonstration Insights articles; add `reviewedBy`/`reviewedDate` and remove `noindex` when approved, or replace them. The Forest Hills Public Schools source was removed because it could not be verified; add vetted sources where useful. The remaining sources (michigan.gov/egle, legislature.mi.gov) were reachable but are general landing pages; replace with specific pages if desired.
- [ ] Collect real client reviews; delete or leave out the `sample-*.md` files.
- [ ] Decide the final wording of any "Properties" content.

## V2 additions
- [ ] Amie to confirm the personal facts used in first person (more than 15 years; 7 years on Lake Bella Vista; last 8 years on Silver Lake; helped many clients with lakefront homes) and the exact wording of the early-awareness language.
- [ ] Review the Location Fit community profiles in `src/data/locationFit.ts` (numeric traits and "worth weighing" notes) for accuracy and fairness, and read `docs/LOCATION_FIT_GUIDELINES.md`.
- [ ] Add lake-specific, verified facts and Amie's own notes to Bostwick, Myers, and Brower (Silver and Bella Vista have only her residency facts). Nothing lake-specific is stated yet.
- [ ] Source and license place photography (`docs/COMMUNITY_IMAGE_BRIEF.md`). All community and lake images are placeholders.
- [ ] Send a real test of each form, including `/home-search/` (`form_type=location_fit_search`) and a Find Your Fit round trip, and confirm the fields arrive.
- [ ] Decide the saved-search workflow on Amie's side (who monitors the Formspree inbox, expected reply time).
- [ ] Re-check the privacy page wording about the saved-search form with the brokerage.

## Assets
- [ ] Community, waterfront, and property photography (owned or licensed) to replace the gradient image slots.
- [ ] Additional Amie photography, if desired.
- [ ] Favicon and logo: `public/favicon.svg` is a simple placeholder monogram; consider a branded logo, PNG/ICO/Apple touch icons, and a dedicated social share image.
- [ ] To replace an Amie photo, overwrite the file in `src/assets/amie/` (the single source).

## Decisions
- [ ] Property search / featured listings approach (the `/properties/` page says "coming soon" until then).
- [ ] Privacy review: have the privacy page checked against the brokerage's requirements and the form provider's terms.

## Before going live
- [ ] `npm run check` passes on the final build.
- [ ] Confirm `npm run build` (not `build:review`) is what is deployed.
- [ ] Confirm production pages show no "Illustrative draft" content.
- [ ] Submit the sitemap (`/sitemap-index.xml`) when ready (optional; no verification code is installed).
