// Validates js/data.js before it reaches the live site.
// Run locally:  node scripts/validate-data.mjs
// Runs automatically on every pull request (.github/workflows/validate.yml).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import vm from 'node:vm';

const errors = [], warnings = [];
const src = readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');
let D;
try {
  // Top-level const declarations are not visible on the vm context, so return them explicitly.
  D = vm.runInNewContext(src + '\n;({pubs,preprints,bookChapters,outreach,datasets,media,activeProjects,completedProjects,openings,openingsReviewed,metrics,lastUpdated})', {}, { timeout: 2000 });
} catch (e) {
  console.error('✗ js/data.js does not run: ' + e.message);
  process.exit(1);
}

const thisYear = new Date().getUTCFullYear();
const TAGS = new Set(['first', 'student', 'phosphorus', 'astrobiology', 'mixotrophy', 'marine', 'methods', 'invited']);
const DOI = /^10\.\d{4,9}\/\S+$/;
const HTTPS = /^https:\/\/\S+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const isArr = (name) => { if (!Array.isArray(D[name])) { err(name, 'must be an array'); return false; } return true; };
const nonEmpty = (o, k, where) => { if (typeof o[k] !== 'string' || !o[k].trim()) err(where, `"${k}" must be non-empty text`); };
const year = (o, where) => { if (!Number.isInteger(o.y) || o.y < 1990 || o.y > thisYear + 1) err(where, `"y" must be a year between 1990 and ${thisYear + 1}`); };
const url = (v, where, k) => { if (v != null && v !== '' && !HTTPS.test(v)) err(where, `"${k}" must be an https:// link`); };

const seenDoi = new Map();
const doi = (o, where, required) => {
  if (o.doi == null || o.doi === '') { if (required) err(where, '"doi" is missing'); return; }
  if (/doi\.org/i.test(o.doi)) err(where, '"doi" must be the bare DOI (no https://doi.org/)');
  else if (!DOI.test(o.doi)) err(where, `"doi" looks wrong: ${o.doi}`);
  const k = o.doi.toLowerCase();
  if (seenDoi.has(k)) err(where, `duplicate DOI ${o.doi} (also in ${seenDoi.get(k)})`); else seenDoi.set(k, where);
};

if (isArr('pubs')) {
  const ns = new Set();
  D.pubs.forEach((p, i) => {
    const w = `pubs[${i}] (n=${p.n})`;
    if (!Number.isInteger(p.n)) err(w, '"n" must be a whole number'); else if (ns.has(p.n)) err(w, 'duplicate "n"'); else ns.add(p.n);
    year(p, w); nonEmpty(p, 't', w); nonEmpty(p, 'a', w); nonEmpty(p, 'j', w); doi(p, w, false);
    if (!Array.isArray(p.tags)) err(w, '"tags" must be a list, e.g. tags:["phosphorus"]');
    else p.tags.forEach(t => { if (!TAGS.has(t)) err(w, `unknown tag "${t}" (allowed: ${[...TAGS].join(', ')})`); });
    url(p.oa, w, 'oa');
    if (p.why != null && typeof p.why !== 'string') err(w, '"why" must be text');
    if (p.key && !p.why) warn(w, '"key" is set but "why" is empty, so it will not appear in Selected publications');
  });
  for (let i = 1; i < D.pubs.length; i++) if (D.pubs[i].n > D.pubs[i - 1].n) warn(`pubs[${i}]`, 'list is not newest-first by "n"');
}
if (isArr('preprints')) D.preprints.forEach((p, i) => { const w = `preprints[${i}]`; year(p, w); nonEmpty(p, 't', w); nonEmpty(p, 'a', w); doi(p, w, true); if (p.publishedDoi && !DOI.test(p.publishedDoi)) err(w, '"publishedDoi" looks wrong'); });
if (isArr('bookChapters')) D.bookChapters.forEach((p, i) => { const w = `bookChapters[${i}]`; year(p, w); nonEmpty(p, 't', w); nonEmpty(p, 'a', w); doi(p, w, false); });
if (isArr('outreach')) D.outreach.forEach((p, i) => { const w = `outreach[${i}]`; year(p, w); nonEmpty(p, 't', w); url(p.url, w, 'url'); });
if (isArr('datasets')) D.datasets.forEach((p, i) => { const w = `datasets[${i}]`; year(p, w); nonEmpty(p, 't', w); url(p.h, w, 'h'); });
if (isArr('media')) D.media.forEach((p, i) => { const w = `media[${i}]`; nonEmpty(p, 'o', w); nonEmpty(p, 't', w); url(p.h, w, 'h'); });
for (const k of ['activeProjects', 'completedProjects']) if (isArr(k)) D[k].forEach((p, i) => { const w = `${k}[${i}]`; nonEmpty(p, 't', w); nonEmpty(p, 'role', w); nonEmpty(p, 'years', w); url(p.awardUrl, w, 'awardUrl'); });
if (isArr('openings')) D.openings.forEach((o, i) => { const w = `openings[${i}]`; nonEmpty(o, 'role', w); if (!['open', 'rolling', 'closed'].includes(o.status)) err(w, '"status" must be open, rolling or closed'); url(o.link, w, 'link'); });

const ageDays = d => (Date.now() - new Date(d).getTime()) / 864e5;
if (!DATE.test(D.lastUpdated || '')) err('lastUpdated', 'must be a date like "2026-11-13"');
if (!DATE.test(D.openingsReviewed || '')) err('openingsReviewed', 'must be a date like "2026-11-13"');
else if (ageDays(D.openingsReviewed) > 90) warn('openingsReviewed', 'openings have not been reviewed for more than 90 days');
if (!D.metrics || !DATE.test(D.metrics.asOf || '')) err('metrics', 'needs asOf like "2026-04-14"');
else if (ageDays(D.metrics.asOf) > 180) warn('metrics', `Google Scholar numbers are ${Math.round(ageDays(D.metrics.asOf))} days old (hidden on the site after 365)`);

// Image budget: no single image over 250 KB
const imgDir = new URL('../images/', import.meta.url);
const walk = dir => readdirSync(dir).flatMap(f => { const p = new URL(f, dir); return statSync(p).isDirectory() ? walk(new URL(f + '/', dir)) : [[f, statSync(p).size]]; });
walk(imgDir).forEach(([f, size]) => { if (/\.(webp|jpe?g|png|avif)$/i.test(f) && size > 250 * 1024) err('images/' + f, `${Math.round(size / 1024)} KB is over the 250 KB budget`); });

warnings.forEach(w => console.log('⚠ ' + w));
if (errors.length) { errors.forEach(e => console.error('✗ ' + e)); console.error(`\n${errors.length} problem(s) found in js/data.js`); process.exit(1); }
console.log(`✓ js/data.js is valid: ${D.pubs.length} articles, ${D.preprints.length} preprints, ${D.datasets.length} datasets.`);
