# solangeduhamel.com

Personal academic website of Dr. Solange Duhamel, served by GitHub Pages from the `main` branch (no build step).

| File | What it holds |
|---|---|
| `index.html` | Page structure for all six sections |
| `js/data.js` | **All content lists** — publications, preprints, projects, datasets, media, openings, metrics. The field list is documented at the top of the file. |
| `js/app.js` | Renders the content, routing, tabs, filters |
| `css/style.css`, `css/fonts.css` | Styles and self-hosted fonts (`fonts/`) |
| `_improvements/` | Weekly review-panel proposals and the improvement log (not published) |

## Weekly updates
A scheduled agent checks ORCID and Crossref every Monday and opens one pull request with publication updates and 10 vetted improvement proposals. Nothing goes live until the pull request is merged.

## Automatic checks
Every pull request runs `scripts/validate-data.mjs` (GitHub Actions → "Check site data"). If it fails, the pull request page shows a red ✗ — open "Details" to see a plain-language list such as `pubs[3] (n=70): unknown tag "phosphorous"`. Fix those lines in `js/data.js` (or ask Claude to) before merging. A separate link check reports broken links but never blocks a merge.

Run locally: `node scripts/validate-data.mjs`

## Fonts
Cormorant and Plus Jakarta Sans (SIL Open Font License), variable WOFF2, latin + latin-ext subsets from Google Fonts, self-hosted for privacy.
