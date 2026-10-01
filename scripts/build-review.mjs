// Design-review build: includes clearly-marked ILLUSTRATIVE sample reviews and forces noindex.
// Never deploy the output of this script. Use `npm run build` for anything public.
import { spawnSync } from 'node:child_process';

const env = { ...process.env, PUBLIC_SHOW_SAMPLE_REVIEWS: 'true' };
const run = (args) =>
  spawnSync(process.execPath, args, { stdio: 'inherit', env }).status ?? 1;

const status = run(['node_modules/astro/bin/astro.mjs', 'build']) || run(['scripts/verify-dist.mjs', '--review']);
console.log('\n[build:review] This build contains illustrative sample reviews. Do NOT publish it.');
process.exit(status);
