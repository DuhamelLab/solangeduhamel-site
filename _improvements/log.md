# Improvement log

Every idea ever proposed by the weekly improvement panel, with its status. The weekly agent reads this file and must NOT re-propose anything listed here (including declined/deferred items) unless circumstances changed — in which case it must say what changed.

This folder starts with an underscore, so GitHub Pages does not publish it.

| Date | # | Title | Status |
|---|---|---|---|
| 2026-11-13 | 1 | Make hash navigation behave like real navigation (Back button, title, focus, main landmark) | implemented (2026-11-13) |
| 2026-11-13 | 2 | Guard the weekly bot: data.js validator in CI, render try/catch, computed counts, link check, documented schema | implemented (CI workflow pending GitHub "workflow" permission; no branch protection) (2026-11-13) |
| 2026-11-13 | 3 | Content accuracy pass: fix contradictions, remove the Analytics placeholder, date the metrics | implemented (Fulbright years left as-is: awarded 2025, held 2026) (2026-11-13) |
| 2026-11-13 | 4 | Fix the LCP path and rebuild the hero for phones (one hero PR) | implemented (responsive recompressed images instead of PI-approved hand crops) (2026-11-13) |
| 2026-11-13 | 5 | Replace the invalid JSON-LD with one valid static @graph (Person + WebSite) | implemented (2026-11-13) |
| 2026-11-13 | 6 | Rebuild tabs, the mobile menu and expanders on correct ARIA patterns | implemented (2026-11-13) |
| 2026-11-13 | 7 | Accessibility and typography baseline: 12px text floor, focus styles, tap targets, one breakpoint, inline-style cleanup | implemented (inline styles kept; CSP allows inline styles) (2026-11-13) |
| 2026-11-13 | 8 | Recruiting clarity: accurate openings status, a 'before you email' checklist, mailto links | implemented (2026-11-13) |
| 2026-11-13 | 9 | Present the phosphorus figure as a proper captioned figure plate | implemented (2026-11-13) |
| 2026-11-13 | 10 | Main-thread diet: render pages lazily, slim the scroll handler, respect reduced motion, stop the portrait cycle | implemented (portraits still cycle, but pause for reduced motion and hidden tabs; profile-3 kept) (2026-11-13) |
| 2026-11-13 | 11 | Escape all data.js and Crossref strings, move the inline script to js/app.js, then add a meta CSP | implemented (style-src allows unsafe-inline) (2026-11-13) |
| 2026-11-13 | 12 | Derive 'Latest Work' from pubs and delete the duplicated latestItems array | implemented (2026-11-13) |
| 2026-11-13 | 13 | Move the Crossref 'now published' check into the weekly bot (zero runtime third-party calls) | implemented (2026-11-13) |
| 2026-11-13 | 14 | Combined, shareable publication filters with accent-insensitive search | implemented (2026-11-13) |
| 2026-11-13 | 15 | 'Selected publications' with one-line significance statements written by the PI | implemented — mechanism only; appears when the PI adds key:true + why to papers (2026-11-13) |
| 2026-11-13 | 16 | Year-grouped publication list (CV-style), with a print stylesheet | implemented (2026-11-13) |
| 2026-11-13 | 17 | Self-host variable WOFF2 fonts and drop the third-party Google Fonts requests | implemented (no size-adjust fallback metrics) (2026-11-13) |
| 2026-11-13 | 18 | Accessible single-series publication histogram with year buttons | implemented (2026-11-13) |
| 2026-11-13 | 19 | Link research projects to their awards, papers and datasets | implemented — award IDs linked; paper/dataset outcome links await PI mapping (2026-11-13) |
| 2026-11-13 | 20 | Open-access 'Free to read' links precomputed weekly into data.js | implemented (2026-11-13) |
| 2026-11-13 | — | E11 Offline-capable PWA with service worker | declined/deferred by panel |
| 2026-11-13 | — | E3 Pre-rendered section URLs via a GitHub Action build and deploy-pages | declined/deferred by panel |
| 2026-11-13 | — | S7 Field-sites world map (inline SVG with pins and cruise tracks) | declined/deferred by panel |
| 2026-11-13 | — | D10 Agent-drawn scientific SVG illustrations for the highlight cards | declined/deferred by panel |
| 2026-11-13 | — | D1 Six-hue research-theme colour system | declined/deferred by panel |
| 2026-11-13 | — | D12 parts 2 and 5: scroll-driven section reveals and a pointer-tracked 'bioluminescent' glow | declined/deferred by panel |
| 2026-11-13 | — | D8 View Transitions and the sliding nav-underline morph | declined/deferred by panel |
| 2026-11-13 | — | D9 full-height Cormorant 34px menu sheet, stagger animation and scroll-snap tab row | declined/deferred by panel |
| 2026-11-13 | — | D11 SVG 'lab lineage' tenure timeline with monogram discs | declined/deferred by panel |
| 2026-11-13 | — | S9 automatic trainee underlining by surname-prefix matching (and replacing the manual 'student' tag) | declined/deferred by panel |
| 2026-11-13 | — | D2 phase 2: switching list titles from Cormorant to sans-serif | declined/deferred by panel |
| 2026-11-13 | — | S1 per-row Cite popovers, RIS export and COinS spans | declined/deferred by panel |
| 2026-11-13 | — | S5 news array and bot-generated Atom feed | declined/deferred by panel |
| 2026-11-13 | — | S12(4) bot-maintained <noscript> publication list inside index.html | declined/deferred by panel |
| 2026-11-13 | — | E10 optional automated Google Scholar metrics refresh | declined/deferred by panel |
| 2026-11-13 | — | S11 bot expansion of BCO-DMO and ReDATA aggregates into about 35 DataCite entries | declined/deferred by panel |
| 2026-11-13 | — | S10 print-resolution press JPGs and repo-hosted CV PDF | declined/deferred by panel |
| 2026-11-13 | — | E12(a) GoatCounter analytics | declined/deferred by panel |
