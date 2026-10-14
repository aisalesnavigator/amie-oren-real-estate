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

// Pages that are intentionally noindex in a production build, and nothing else: the review form, the thank-you page,
// the 404 page, and demonstration Insights articles whose frontmatter still says `noindex: true` (not yet reviewed).
const intentionalNoindex = new Set(['/review/', '/thank-you/', '/404.html']);
const insightsDir = 'src/content/insights';
if (existsSync(insightsDir)) {
  for (const f of readdirSync(insightsDir).filter((n) => /\.mdx?$/.test(n))) {
    if (/^noindex:\s*true\s*$/m.test(readFileSync(join(insightsDir, f), 'utf8'))) {
      intentionalNoindex.add(`/insights/${f.replace(/\.mdx?$/, '')}/`);
    }
  }
}

const required = [
  '/', '/selling/', '/buying/', '/communities/', '/communities/rockford/', '/communities/ada/',
  '/communities/east-grand-rapids/', '/communities/cascade/', '/communities/forest-hills/', '/waterfront/',
  '/about/', '/insights/', '/client-experiences/', '/review/', '/refer/', '/contact/', '/properties/',
  '/privacy/', '/thank-you/', '/404.html', '/find-your-fit/', '/home-search/', '/waterfront/rockford-lakes/',
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

// All JSON-LD text of a page (used to assert that no Review / AggregateRating structured data is emitted).
const m1 = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');

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

  if (/"@type"\s*:\s*"(Review|AggregateRating|Rating)"/.test(m1(html))) fail(`${url}: Review/Rating structured data must not be generated`);

  const sampleVisible = /Illustrative draft|ILLUSTRATIVE SAMPLE/.test(html);
  if (!reviewBuild && sampleVisible) fail(`${url}: review-only sample content present in a production build`);
  if (reviewBuild && !/name="robots" content="noindex/.test(html)) fail(`${url}: review build must be noindex`);

  // Production must be public: no review banner, and noindex only on intentionally excluded pages.
  if (!reviewBuild) {
    if (/review-mode-banner|Design-review build/.test(html)) fail(`${url}: design-review banner present in a production build`);
    const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
    if (noindex && !intentionalNoindex.has(url)) fail(`${url}: unexpected noindex in a production build`);
  }
}

// Forms must submit to the endpoint with the right hidden identifier.
const formChecks = [
  ['/contact/', 'contact'],
  ['/review/', 'client_review'],
  ['/refer/', 'referral'],
  ['/home-search/', 'location_fit_search'],
];
for (const [url, type] of formChecks) {
  const html = readFileSync(join(DIST, url, 'index.html'), 'utf8');
  if (!html.includes(`name="form_type" value="${type}"`)) fail(`${url}: missing form_type=${type}`);
  if (!html.includes('name="_gotcha"')) fail(`${url}: missing honeypot`);
  if (!/<form[^>]+method="post"/.test(html)) fail(`${url}: form is not a POST form`);
  if (!/action="(https:\/\/formspree\.io\/f\/[^"]+|mailto:[^"]+)"/.test(html)) fail(`${url}: form has no working action`);
}

// Review gating: every quote on the production site must be a verified client review. Review-only samples
// and the retired "illustrative" examples must never appear.
if (!reviewBuild) {
  for (const page of ['client-experiences/index.html', 'index.html']) {
    const html = readFileSync(join(DIST, page), 'utf8');
    const quotes = (html.match(/<blockquote/g) ?? []).length;
    const kinds = [...html.matchAll(/data-review-kind="([a-z]+)"/g)].map((m) => m[1]);
    if (quotes !== kinds.length) fail(`/${page}: a quote is missing its review kind marker`);
    if (kinds.some((k) => k !== 'verified')) fail(`/${page}: non-verified review content in a production build`);
  }
  const ce = readFileSync(join(DIST, 'client-experiences', 'index.html'), 'utf8');
  if (!/data-review-kind="verified"/.test(ce)) fail('/client-experiences/: no approved reviews rendered');
  for (const file of pages) {
    if (/Illustrative client experience|Illustrative examples shown/.test(readFileSync(file, 'utf8'))) {
      fail(`${toUrl(file)}: retired illustrative-example content present`);
    }
  }
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
