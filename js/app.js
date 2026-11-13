/* ===== SOLANGE DUHAMEL — SITE SCRIPT =====
   No build step. Content lives in js/data.js; this file renders it.
   Pages: #home #research #publications #team #opportunities #data
   Publications deep links: #publications?tag=astrobiology&q=hadland&year=2025&pub=<id>
*/
/* Collect the data declared in js/data.js (top-level consts are shared between classic scripts). */
var SITE_DATA = {
  pubs: typeof pubs !== 'undefined' ? pubs : [], preprints: typeof preprints !== 'undefined' ? preprints : [],
  bookChapters: typeof bookChapters !== 'undefined' ? bookChapters : [], outreach: typeof outreach !== 'undefined' ? outreach : [],
  datasets: typeof datasets !== 'undefined' ? datasets : [], media: typeof media !== 'undefined' ? media : [],
  activeProjects: typeof activeProjects !== 'undefined' ? activeProjects : [], completedProjects: typeof completedProjects !== 'undefined' ? completedProjects : [],
  openings: typeof openings !== 'undefined' ? openings : [], metrics: typeof metrics !== 'undefined' ? metrics : null,
  lastUpdated: typeof lastUpdated !== 'undefined' ? lastUpdated : '', openingsReviewed: typeof openingsReviewed !== 'undefined' ? openingsReviewed : ''
};
(function (S) {
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ESC[c]);
const safeUrl = u => { u = String(u || ''); return /^(https?:\/\/|mailto:|#)/i.test(u) ? esc(u) : '#'; };
const rich = v => esc(v).replace(/\*([^*]+)\*/g, '<i>$1</i>'); /* *species* -> italics */
const norm = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ext = (href, html, cls) => `<a href="${safeUrl(href)}" target="_blank" rel="noopener noreferrer"${cls ? ` class="${cls}"` : ''}>${html}</a>`;
const list = v => Array.isArray(v) ? v : [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtDate = (iso, withDay) => { const [y, m, d] = String(iso).split('-').map(Number); return y ? (withDay && d ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${y}`) : ''; };
const ME = /(Duhamel, S\.|S\. Duhamel|Duhamel S\.?)/g;
function highlightAuthor(a) { return rich(a).replace(ME, '<strong class="me">$1</strong>'); }
const pubs = list(S.pubs), preprints = list(S.preprints), bookChapters = list(S.bookChapters),
  outreach = list(S.outreach), datasets = list(S.datasets), media = list(S.media),
  activeProjects = list(S.activeProjects), completedProjects = list(S.completedProjects),
  openings = list(S.openings);
const metrics = S.metrics, lastUpdated = S.lastUpdated, openingsReviewed = S.openingsReviewed;

/* Render a section without letting one bad entry blank the page */
function safely(fn, elId) {
  try { fn(); } catch (err) {
    console.error(err);
    const el = elId && document.getElementById(elId);
    if (el) el.innerHTML = '<p class="load-error">This list could not be loaded right now. Please see ' +
      ext('https://orcid.org/0000-0002-8435-4695', 'ORCID') + ' or ' +
      ext('https://scholar.google.com/citations?user=GpkraS0AAAAJ', 'Google Scholar') + '.</p>';
  }
}

/* ---------- routing ---------- */
const TITLES = {
  home: 'Solange Duhamel — Marine Microbiology, Biogeochemistry, and Astrobiology',
  research: 'Research — Solange Duhamel', publications: 'Publications — Solange Duhamel',
  team: 'Team — Solange Duhamel', opportunities: 'Opportunities — Solange Duhamel',
  data: 'Data and Resources — Solange Duhamel'
};
const RENDER = {
  home: [[renderLatest, 'latest-grid']],
  research: [[renderResearch, 'active-projects']],
  publications: [[renderPubSummary], [renderSelected, 'selected-pubs'], [initPubs, 'pub-list'],
    [renderPreprints, 'pub-preprints-list'], [renderBookChapters, 'pub-bookchapters-list'], [renderOutreach, 'pub-outreach-list']],
  opportunities: [[renderOpenings, 'openings-status']],
  data: [[renderDatasets, 'datasets-list'], [renderMedia, 'media-list']],
  team: []
};
const rendered = new Set();
let currentPage = null;

function parseHash() {
  const raw = decodeURIComponent(location.hash.slice(1));
  const i = raw.indexOf('?');
  const page = i < 0 ? raw : raw.slice(0, i);
  return { page: TITLES[page] ? page : 'home', params: new URLSearchParams(i < 0 ? '' : raw.slice(i + 1)) };
}

function route() {
  const { page, params } = parseHash();
  if (!rendered.has(page)) { rendered.add(page); (RENDER[page] || []).forEach(([fn, id]) => safely(fn, id)); }
  const changed = page !== currentPage;
  if (changed) {
    $$('.page').forEach(p => { p.style.display = p.id === 'page-' + page ? 'block' : 'none'; });
    $$('[data-page]').forEach(l => {
      const on = l.dataset.page === page;
      l.classList.toggle('active', on);
      if (on && !l.classList.contains('nav-logo') && !l.classList.contains('footer-link')) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
    });
    document.title = TITLES[page];
    closeMenu(false);
    if (currentPage !== null) {
      window.scrollTo(0, 0);
      const h = $('#page-' + page + ' h1');
      if (h) h.focus({ preventScroll: true });
    }
    currentPage = page;
    cacheParallax();
    onScroll();
  }
  if (page === 'publications') applyPubParams(params);
}

/* Links: plain href="#page" + hashchange gives working Back/Forward.
   Only special-case the skip link and in-page "open tab" links. */
document.addEventListener('click', e => {
  const skip = e.target.closest('.skip-link');
  if (skip) { e.preventDefault(); const h = $('#page-' + currentPage + ' h1') || $('#main-content'); h.focus(); h.scrollIntoView(); return; }
  const go = e.target.closest('[data-goto-tab]');
  if (go) { e.preventDefault(); const t = document.getElementById(go.dataset.gotoTab); if (t) { t.click(); t.focus(); } return; }
  const link = e.target.closest('a[data-page]');
  if (link && link.getAttribute('href') === '#' + currentPage) { e.preventDefault(); closeMenu(false); window.scrollTo(0, 0); }
});
window.addEventListener('hashchange', route);

/* ---------- mobile menu ---------- */
const burger = $('#hamburger'), menu = $('#mobile-menu');
function openMenu() { menu.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu'); const a = $('a', menu); if (a) a.focus(); }
function closeMenu(returnFocus) {
  if (!menu || !menu.classList.contains('open')) return;
  menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
  if (returnFocus) burger.focus();
}
if (burger && menu) {
  burger.addEventListener('click', () => (menu.classList.contains('open') ? closeMenu(true) : openMenu()));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(true); });
  document.addEventListener('click', e => { if (menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu(false); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(false); });
}

/* ---------- scroll: progress bar, back-to-top, hero parallax ---------- */
const bar = $('#progress-bar'), toTop = $('#back-to-top');
let parallaxEls = [], ticking = false;
function cacheParallax() { parallaxEls = reduceMotion.matches ? [] : $$('#page-' + currentPage + ' .hero-bg'); }
function onScroll() {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${h > 0 ? Math.min(y / h, 1) : 0})`;
    if (toTop) toTop.classList.toggle('visible', y > 400);
    for (const el of parallaxEls) el.style.transform = `translate3d(0,${Math.round(y * 0.3)}px,0)`;
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
reduceMotion.addEventListener && reduceMotion.addEventListener('change', () => { $$('.hero-bg').forEach(el => { el.style.transform = ''; }); cacheParallax(); });
if (toTop) toTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' }); const h = $('#page-' + currentPage + ' h1'); if (h) h.focus({ preventScroll: true }); });

/* ---------- portraits: gentle cycle, off for reduced motion / hidden tab ---------- */
const PORTRAITS = ['images/profile-1.webp', 'images/profile-2.webp', 'images/profile-3.webp', 'images/profile-4.webp'];
let portraitIdx = 0;
setInterval(() => {
  if (reduceMotion.matches || document.hidden) return;
  portraitIdx = (portraitIdx + 1) % PORTRAITS.length;
  $$('#hero-portrait img, #about-portrait img').forEach(img => {
    img.style.opacity = '0';
    setTimeout(() => { img.src = PORTRAITS[portraitIdx]; img.style.opacity = '1'; }, 400);
  });
}, 20000);

/* ---------- tabs (WAI-ARIA tabs pattern, one implementation for all) ---------- */
function initTablist(listEl, panelFor, manual) {
  if (!listEl) return;
  const tabs = $$('[role="tab"]', listEl);
  function select(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab, panel = panelFor(t);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('active', on);
      if (panel) { panel.hidden = !on; panel.classList.toggle('active', on); }
    });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    const panel = panelFor(t);
    if (!t.id) t.id = listEl.id + '-tab-' + i;
    if (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', t.id); panel.tabIndex = 0; t.setAttribute('aria-controls', panel.id); }
    t.addEventListener('click', () => select(t, false));
    t.addEventListener('keydown', e => {
      let n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') n = tabs[0];
      else if (e.key === 'End') n = tabs[tabs.length - 1];
      if (!n) return;
      e.preventDefault();
      if (manual) n.focus(); else select(n, true);
    });
  });
  select(tabs.find(t => t.classList.contains('active')) || tabs[0], false);
}
initTablist($('#pub-tabs'), t => document.getElementById('pub-panel-' + t.dataset.pubtab), true);
initTablist($('#team-tabs'), t => document.getElementById('team-' + t.dataset.tab));
initTablist($('#oppo-tabs'), t => document.getElementById('panel-' + t.dataset.tab));
initTablist($('#data-tabs'), t => document.getElementById('tab-' + t.dataset.tab));

/* ---------- Home: latest work, derived from pubs ---------- */
function journalName(j) { return String(j || '').split(',')[0].trim(); }
function renderLatest() {
  const g = $('#latest-grid'); if (!g) return;
  const items = pubs.filter(p => p.feature).concat(pubs.filter(p => !p.feature).sort((a, b) => (b.n || 0) - (a.n || 0))).slice(0, 6);
  g.innerHTML = items.map(p => `<article class="latest-card"><div class="lc-source">${esc(journalName(p.j))}, ${esc(p.y)}</div>` +
    `<h3 class="lc-title">${p.doi ? ext('https://doi.org/' + p.doi, rich(p.short || p.t), 'stretched') : rich(p.short || p.t)}</h3>` +
    `<div class="lc-authors">${highlightAuthor(p.a)}</div></article>`).join('');
  const more = $('#latest-more'); if (more) more.textContent = `All ${pubs.length} publications →`;
}

/* ---------- Research ---------- */
function awardLink(p) {
  if (!p.award) return '';
  const m = /^NSF (\d{7})$/.exec(p.award);
  const url = p.awardUrl || (m ? 'https://www.nsf.gov/awardsearch/show-award/?AWD_ID=' + m[1] : '');
  return ' &middot; ' + (url ? ext(url, esc(p.award) + ' ↗', 'award-link') : `<span class="award-id">${esc(p.award)}</span>`);
}
function renderResearch() {
  const card = p => {
    const badge = p.role === 'PI' ? 'pi' : (p.role === 'Co-PI' || p.role === 'Co-I') ? 'coi' : 'collab';
    return `<article class="research-card"><h3>${rich(p.t)}<span class="role-badge ${badge}">${esc(p.role)}</span></h3>` +
      `<div class="rc-role">${esc(p.funder)} &middot; ${esc(p.years)}${awardLink(p)}</div><p>${rich(p.desc)}</p></article>`;
  };
  $('#active-projects').innerHTML = activeProjects.map(card).join('');
  $('#completed-projects').innerHTML = completedProjects.map(card).join('');
}

/* ---------- Publications ---------- */
const TAG_LABEL = { first: 'First author', student: 'Student led', phosphorus: 'Phosphorus', astrobiology: 'Astrobiology', mixotrophy: 'Mixotrophy', marine: 'Marine', methods: 'Methods', invited: 'Invited' };
const pubId = p => 'pub-' + (p.doi ? p.doi.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'n' + p.n);
const pubText = pubs.map(p => norm([p.t, p.a, p.j, p.y].join(' ')));
const state = { tag: 'all', q: '', year: null, oa: false };
let writeTimer = null, pubsReady = false;

function renderPubSummary() {
  const el = $('#pub-summary'); if (!el) return;
  const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;
  el.textContent = `${n(pubs.length, 'peer-reviewed article', 'peer-reviewed articles')}, ${n(preprints.length, 'preprint', 'preprints')}, ${n(bookChapters.length, 'book chapter', 'book chapters')}, and ${n(outreach.length, 'outreach article', 'outreach articles')}.`;
}

function renderSelected() {
  const wrap = $('#selected-pubs'); if (!wrap) return;
  const sel = pubs.filter(p => p.key && p.why);
  wrap.hidden = !sel.length;
  if (!sel.length) return;
  $('#selected-list', wrap).innerHTML = sel.map(p => `<article class="selected-card"><h3>${p.doi ? ext('https://doi.org/' + p.doi, rich(p.t)) : rich(p.t)}</h3>` +
    `<p class="sel-meta">${esc(journalName(p.j))}, ${esc(p.y)}</p><p class="sel-why">${rich(p.why)}</p></article>`).join('');
}

function renderMetrics() {
  const box = $('#scholar-metrics'); if (!box) return;
  const fresh = metrics && metrics.asOf && (Date.now() - new Date(metrics.asOf).getTime()) < 365 * 864e5;
  if (!fresh) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `<div class="scholar-metric"><span class="metric-value">${Number(metrics.citations).toLocaleString('en-US')}</span><span class="metric-label">Citations</span></div>` +
    `<div class="scholar-metric"><span class="metric-value">${esc(metrics.h)}</span><span class="metric-label">h-index</span></div>` +
    `<div class="scholar-metric"><span class="metric-value">${esc(metrics.i10)}</span><span class="metric-label">i10-index</span></div>` +
    `<p class="metrics-asof">${esc(metrics.source || 'Google Scholar')}, as of ${esc(fmtDate(metrics.asOf))}</p>`;
}

function initPubs() {
  renderMetrics();
  /* chip counts */
  const counts = { all: pubs.length, oa: pubs.filter(p => p.oa).length };
  pubs.forEach(p => list(p.tags).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  $$('#filter-chips .filter-chip[data-filter]').forEach(c => {
    const f = c.dataset.filter, label = c.dataset.label || c.textContent.trim();
    c.dataset.label = label;
    c.innerHTML = `${esc(label)} <span class="chip-count">${counts[f] || 0}</span>`;
    c.addEventListener('click', () => {
      if (f === 'oa') state.oa = !state.oa;
      else state.tag = (state.tag === f && f !== 'all') ? 'all' : f;
      updatePubs(true);
    });
  });
  const search = $('#pub-search');
  search.addEventListener('input', () => {
    state.q = search.value;
    clearTimeout(search._t);
    search._t = setTimeout(() => updatePubs(true), 200);
  });
  $('#year-clear').addEventListener('click', () => { state.year = null; updatePubs(true); });
  const oaNote = $('#oa-summary');
  if (oaNote) oaNote.textContent = `${counts.oa} of ${pubs.length} articles have a free-to-read version.`;
  pubsReady = true;
  updatePubs(false);
}

function applyPubParams(params) {
  if (!pubsReady) return;
  state.tag = params.get('tag') || 'all';
  state.q = params.get('q') || '';
  state.year = params.get('year') ? Number(params.get('year')) : null;
  state.oa = params.get('oa') === '1';
  const s = $('#pub-search'); if (s && s.value !== state.q) s.value = state.q;
  updatePubs(false);
  const target = params.get('pub');
  if (target) {
    const el = document.getElementById(target);
    if (el) { el.classList.add('pub-target'); el.scrollIntoView({ block: 'center' }); setTimeout(() => el.classList.remove('pub-target'), 4000); }
  }
}

function filtered(ignoreYear) {
  const q = norm(state.q).trim();
  return pubs.filter((p, i) =>
    (state.tag === 'all' || list(p.tags).includes(state.tag)) &&
    (!state.oa || p.oa) &&
    (!q || pubText[i].includes(q)) &&
    (ignoreYear || !state.year || p.y === state.year));
}

function markTitle(t) {
  const html = rich(t), q = state.q.trim();
  if (q.length < 2) return html;
  const re = new RegExp('(' + esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
  return html.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, text) => tag || text.replace(re, '<mark>$1</mark>'));
}

function journalHtml(j) {
  const m = /^(.*?),\s*(.+)$/.exec(String(j || ''));
  return m ? `<i>${esc(m[1])}</i>, <span class="pub-vol">${esc(m[2])}</span>` : `<i>${esc(j)}</i>`;
}

function entry(p) {
  const id = pubId(p);
  const title = p.doi ? ext('https://doi.org/' + p.doi, markTitle(p.t)) : markTitle(p.t);
  const tags = list(p.tags).filter(t => t !== 'invited').map(t => `<span class="pub-tag">${esc(TAG_LABEL[t] || t)}</span>`).join('');
  const invited = list(p.tags).includes('invited') ? '<span class="pub-tag invited">Invited</span>' : '';
  const cofirst = p.cofirst ? '<span class="co-first-mark" title="Co-first author">&#8224;<span class="sr-only"> co-first author</span></span>' : '';
  const oa = p.oa ? ext(p.oa, 'Free to read<span class="sr-only"> (opens a free version)</span>', 'oa-pill') : '';
  return `<article class="pub-entry" id="${id}"><span class="sr-only">${esc(p.y)}. </span>` +
    `<h4 class="pub-title">${title}${cofirst}</h4><div class="pub-authors">${highlightAuthor(p.a)}</div>` +
    `<div class="pub-journal">${journalHtml(p.j)}</div>` +
    `<div class="pub-tags">${tags}${invited}${oa}<a class="pub-permalink" href="#publications?pub=${id}" aria-label="Link to this publication">Link</a></div></article>`;
}

function updatePubs(writeUrl) {
  const base = filtered(true);
  const shown = state.year ? base.filter(p => p.y === state.year) : base;
  /* chips */
  $$('#filter-chips .filter-chip[data-filter]').forEach(c => {
    const f = c.dataset.filter, on = f === 'oa' ? state.oa : f === state.tag;
    c.classList.toggle('active', on); c.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const yc = $('#year-clear');
  yc.hidden = !state.year; yc.innerHTML = state.year ? `Year: ${state.year} <span aria-hidden="true">×</span><span class="sr-only"> (clear year filter)</span>` : '';
  /* grouped list */
  const byYear = new Map();
  shown.forEach(p => { if (!byYear.has(p.y)) byYear.set(p.y, []); byYear.get(p.y).push(p); });
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);
  $('#pub-list').innerHTML = years.length ? years.map(y => `<section class="pub-year-group" aria-labelledby="y-${y}"><h3 class="pub-year-head" id="y-${y}">${y} <span class="pub-year-n">(${byYear.get(y).length})</span></h3>${byYear.get(y).map(entry).join('')}</section>`).join('')
    : '<p class="pub-empty">No publications match these filters.</p>';
  $('#pub-count').textContent = `Showing ${shown.length} of ${pubs.length} publications`;
  renderChart(base);
  if (writeUrl) {
    clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
      const p = new URLSearchParams();
      if (state.tag !== 'all') p.set('tag', state.tag);
      if (state.q.trim()) p.set('q', state.q.trim());
      if (state.year) p.set('year', state.year);
      if (state.oa) p.set('oa', '1');
      const qs = p.toString();
      try { history.replaceState(null, '', '#publications' + (qs ? '?' + qs : '')); } catch (e) { /* ignore */ }
    }, 300);
  }
}

function renderChart(base) {
  const el = $('#pub-chart'); if (!el) return;
  const allYears = pubs.map(p => p.y);
  const minY = Math.min.apply(null, allYears), maxY = Math.max.apply(null, allYears);
  const counts = {}; base.forEach(p => { counts[p.y] = (counts[p.y] || 0) + 1; });
  const maxN = Math.max(1, ...Object.values(counts));
  let peakY = minY; Object.keys(counts).forEach(y => { if (counts[y] > (counts[peakY] || 0)) peakY = Number(y); });
  let bars = '', ticks = '', rows = '';
  for (let y = minY; y <= maxY; y++) {
    const n = counts[y] || 0, h = Math.round((n / maxN) * 100);
    const sel = state.year === y;
    bars += `<button type="button" class="hbar${sel ? ' sel' : ''}" data-year="${y}" aria-pressed="${sel}" aria-label="${y}: ${n} publication${n === 1 ? '' : 's'}"${n ? '' : ' disabled'}><span class="hbar-fill" style="height:${n ? Math.max(h, 4) : 0}%"></span></button>`;
    ticks += `<span class="htick">${y % 5 === 0 ? y : ''}</span>`;
    if (n) rows = `<tr><th scope="row">${y}</th><td>${n}</td></tr>` + rows;
  }
  el.innerHTML = `<div class="hist-head"><span>Publications per year</span><span>peak ${counts[peakY] || 0}</span></div>` +
    `<div class="hist" role="group" aria-label="Publications per year, ${minY}–${maxY}. Select a year to filter.">${bars}</div>` +
    `<div class="hist-ticks" aria-hidden="true">${ticks}</div>` +
    `<details class="hist-table"><summary>Show data table</summary><table><thead><tr><th scope="col">Year</th><th scope="col">Publications</th></tr></thead><tbody>${rows}</tbody></table></details>`;
  $$('.hbar', el).forEach(b => b.addEventListener('click', () => {
    const y = Number(b.dataset.year);
    state.year = state.year === y ? null : y;
    updatePubs(true);
    const again = $(`.hbar[data-year="${y}"]`, el); if (again) again.focus();
  }));
}

function card(o, opts) {
  const href = o.url || (o.doi ? 'https://doi.org/' + o.doi : '');
  const title = href ? ext(href, rich(o.t)) : rich(o.t);
  return `<article class="wp-card"><div class="pub-year">${esc(o.y)}</div><h3>${title}</h3><p>${highlightAuthor(o.a)}<br><i>${esc(o.j)}</i>${opts || ''}</p></article>`;
}
function renderBookChapters() { $('#pub-bookchapters-list').innerHTML = bookChapters.map(b => card(b)).join(''); }
function renderOutreach() { $('#pub-outreach-list').innerHTML = outreach.map(o => card(o, o.lang ? ` &middot; <span class="pub-tag">${esc(o.lang)}</span>` : '')).join(''); }
function renderPreprints() {
  const el = $('#pub-preprints-list');
  const known = new Set(pubs.map(p => String(p.doi || '').toLowerCase()));
  const items = preprints.filter(p => !(p.publishedDoi && known.has(String(p.publishedDoi).toLowerCase())));
  if (!items.length) { el.innerHTML = '<p class="pub-empty">No preprints at the moment.</p>'; return; }
  el.innerHTML = items.map(p => {
    const status = p.publishedDoi ? `<span class="preprint-status"><span class="pub-tag now-pub">Now published</span> ${ext('https://doi.org/' + p.publishedDoi, esc(p.publishedIn || 'Journal version') + ' ↗')}</span>` : '';
    return card({ y: p.y, t: p.t, a: p.a, j: p.j, doi: p.doi }, ` &middot; <span class="pub-tag">Preprint</span>${status}`);
  }).join('');
}

/* ---------- Opportunities ---------- */
function renderOpenings() {
  const el = $('#openings-status'); if (!el) return;
  const open = openings.filter(o => o.status !== 'closed');
  const reviewed = openingsReviewed ? ` <span class="reviewed">(Last reviewed ${esc(fmtDate(openingsReviewed))}.)</span>` : '';
  el.innerHTML = open.length
    ? '<ul class="openings">' + open.map(o => `<li><strong>${esc(o.role)}</strong> — ${rich(o.project)}${o.start ? ', starting ' + esc(o.start) : ''} <span class="pub-tag">${esc(o.status)}</span>${o.link ? ' ' + ext(o.link, 'Details ↗') : ''}</li>`).join('') + '</ul>' + reviewed
    : `There are no advertised positions at this time, but I am always glad to hear from motivated students and postdocs, including those applying for their own fellowships.${reviewed}`;
}

/* ---------- Data & media ---------- */
function renderDatasets() {
  $('#datasets-list').innerHTML = datasets.map(d => `<article class="dataset-card"><h3>${rich(d.t)}</h3><p>${highlightAuthor(d.a)} &middot; ${esc(d.repo)} &middot; ${esc(d.y)}</p>${d.h ? ext(d.h, 'View ↗', 'view-link') : ''}</article>`).join('');
}
function renderMedia() {
  $('#media-list').innerHTML = media.map(m => `<article class="media-card"><div class="media-outlet">${esc(m.o)}</div><h3>${rich(m.t)}</h3>${m.h ? ext(m.h, 'View ↗', 'view-link') : ''}</article>`).join('');
}

/* ---------- footer ---------- */
const upd = $('#site-updated');
if (upd && lastUpdated) upd.textContent = 'Site updated ' + fmtDate(lastUpdated, true);

/* ---------- start ---------- */
route();
})(SITE_DATA);
