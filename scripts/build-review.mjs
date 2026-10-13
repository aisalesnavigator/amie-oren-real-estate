// Design-review build: includes clearly-marked ILLUSTRATIVE sample reviews, shows the review banner and forces noindex.
// Review mode is a build MODE (`astro build --mode review`), not an environment variable, so it cannot be switched
// on by a host setting or a stray PUBLIC_* variable. Never deploy the output of this script. Use `npm run build`
// for anything public.
import { spawnSync } from 'node:child_process';

// Fail loudly if a hosting build is ever pointed at this command, rather than silently publishing a noindex site.
if (process.env.NETLIFY === 'true' && process.env.ALLOW_REVIEW_BUILD !== 'true') {
  console.error('[build:review] Refusing to run on Netlify: this build is noindex and shows review banners. Use `npm run build`.');
  process.exit(1);
}

const run = (args) => spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env }).status ?? 1;

const status =
  run(['node_modules/astro/bin/astro.mjs', 'build', '--mode', 'review']) || run(['scripts/verify-dist.mjs', '--review']);
console.log('\n[build:review] This build contains illustrative sample reviews. Do NOT publish it.');
process.exit(status);
