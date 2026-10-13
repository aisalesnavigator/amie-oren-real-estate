/**
 * Review mode is the local "design review" build: it shows review-only sample content, adds the
 * "Design-review build" banner and forces `noindex` on every page. It must NEVER be active in a public build.
 *
 * It is a build MODE, not an environment variable: only `npm run build:review` (which runs
 * `astro build --mode review`) or the dev server can turn it on. `npm run build` always runs in
 * the `production` mode, so no host setting, `.env` file or stray `PUBLIC_*` variable can switch it on.
 */
export function isReviewMode(env: { DEV?: boolean; MODE?: string }): boolean {
  return env.DEV === true || env.MODE === 'review';
}
