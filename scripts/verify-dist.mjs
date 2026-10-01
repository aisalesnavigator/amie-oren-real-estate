// Post-build verification of the static output in dist/. No dependencies.
//   node scripts/verify-dist.mjs            (production expectations)
//   node scripts/verify-dist.mjs --review   (design-review build: samples expected + noindex)
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
const reviewBuild = process.argv.includes('--review');
const errors = [];
const fail = (msg) => errors.push(msg);

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const toUrl = (file) => '/' + file.slice(DIST.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '');

const required = [
  '/', '/selling/', '/buying/', '/communities/', '/communities/rockford/', '/communities/ada/',
  '/communities/east-grand-rapids/', '/communities/cascade/', '/communities/forest-hills/', '/waterfront/',
  '/about/', '/insights/', '/client-experiences/', '/review/', '/refer/', '/contact/', '/properties/',
  '/privacy/', '/thank-you/', '/404.html',
];
const urls = new Set(pages.map(toUrl).concat(pages.map((f) => '/' + f.slice(DIST.length + 1).replace(/\\/g, '/'))));
for (const r of required) if (!urls.has(r)) fail(`Missing route: ${r}`);
for (const r of ['/robots.txt', '/rss.xml', '/sitemap-index.xml', '/favicon.svg']) {
  if (!existsSync(join(DIST, r))) fail(`Missing file: ${r}`);
}

const resolves = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return true;
  const target = join(DIST, clean);
  if (clean.endsWith('/')) return existsSync(join(target, 'index.html'));
  return existsSync(target) || existsSync(join(target, 'index.html'));
};

const titles = new Map();
let linkCount = 0;
for (const file of pages) {
  const url = toUrl(file);
  const html = readFileSync(file, 'utf8');

  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const ref = m[1];
    if (!ref.startsWith('/') || ref.startsWith('//')) continue;
    linkCount++;
    if (!resolves(ref)) fail(`${url}: broken internal reference ${ref}`);
  }

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!title) fail(`${url}: missing <title>`);
  if (!desc) fail(`${url}: missing meta description`);
  if (!canonical) fail(`${url}: missing canonical`);
  if (title) {
    if (titles.has(title)) fail(`${url}: duplicate title with ${titles.get(title)}`);
    titles.set(title, url);
  }
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(`${url}: expected exactly one <h1>`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      fail(`${url}: invalid JSON-LD`);
    }
    if (/aggregateRating|reviewCount|ratingValue|priceRange|"address"|"license"|"award"/.test(m[1])) {
      fail(`${url}: JSON-LD contains a field that must not be invented`);
    }
  }

  const sampleVisible = /Illustrative draft|ILLUSTRATIVE SAMPLE/.test(html);
  if (!reviewBuild && sampleVisible) fail(`${url}: illustrative sample content present in a production build`);
  if (reviewBuild && !/name="robots" content="noindex/.test(html)) fail(`${url}: review build must be noindex`);
}

// Forms must submit to the endpoint with the right hidden identifier.
const formChecks = [
  ['/contact/', 'contact'],
  ['/review/', 'client_review'],
  ['/refer/', 'referral'],
];
for (const [url, type] of formChecks) {
  const html = readFileSync(join(DIST, url, 'index.html'), 'utf8');
  if (!html.includes(`name="form_type" value="${type}"`)) fail(`${url}: missing form_type=${type}`);
  if (!html.includes('name="_gotcha"')) fail(`${url}: missing honeypot`);
  if (!/<form[^>]+method="post"/.test(html)) fail(`${url}: form is not a POST form`);
  if (!/action="(https:\/\/formspree\.io\/f\/[^"]+|mailto:[^"]+)"/.test(html)) fail(`${url}: form has no working action`);
}

// Review gating: the production client-experiences page must not list any review text.
if (!reviewBuild) {
  const html = readFileSync(join(DIST, 'client-experiences', 'index.html'), 'utf8');
  if (/<blockquote/.test(html)) fail('/client-experiences/: unexpected review content in production build');
}

// No analytics / tracking code.
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  if (/googletagmanager|google-analytics|gtag\(|clarity\.ms|connect\.facebook|fbq\(/i.test(html)) {
    fail(`${toUrl(file)}: tracking code found`);
  }
}

const jsFiles = files.filter((f) => extname(f) === '.js');
const jsBytes = jsFiles.reduce((n, f) => n + statSync(f).size, 0);

if (errors.length) {
  console.error(`\nverify-dist FAILED (${errors.length}):`);
  for (const e of errors) console.error(' - ' + e);
  process.exit(1);
}
console.log(`verify-dist OK: ${pages.length} pages, ${linkCount} internal references resolved, ${jsFiles.length} JS files (${(jsBytes / 1024).toFixed(1)} KB total).`);
