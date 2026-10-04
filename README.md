# RoutsCinema — Netflix-style TMDB Browser

Portfolio-grade Netflix clone powered by **TMDB REST APIs**. Cinematic hero billboard, genre rails, details + trailer modal, search, and My List.

![Stack](https://img.shields.io/badge/Vite-5-646CFF) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TMDB](https://img.shields.io/badge/TMDB-REST-01B4E4)

## Quick start

```bash
cp .env.example .env   # add VITE_TMDB_KEY from https://www.themoviedb.org/settings/api
npm install
npm run dev            # http://localhost:3000 with /api/tmdb proxy
```

> The old key `b9605fd8…` was exposed in git history — **rotate it** in TMDB dashboard before deploying.

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Vite dev + TMDB proxy |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview prod build |
| `npm run lint` | ESLint (must be clean) |
| `npm test` | Vitest (must pass) |

## Governance

* Read **`AGENTS.md`** before any change.
* UI/UX/a11y/SEO/perf/security decisions: load **`.opencode/skills/super-senior-frontend/SKILL.md`** first.
* Checklists: `references/tmdb-endpoints.md`, `references/a11y-seo-checklist.md`.

## TMDB

* Central client `src/lib/tmdb.js` (axios 1.x, 10s timeout, AbortController, typed missing-key/401/404/429/502-reset errors; missing key short-circuits with no network call). No ad-hoc fetches.
* Concurrency: max 4 simultaneous upstream requests with one backoff retry on reset/429 (never for search). Home mounts the first 5 rails eagerly; the rest lazy-mount via `IntersectionObserver`.
* Dev proxy: `/api/tmdb` with 10s timeouts + 502 JSON on upstream reset (see `vite.config.js`). Debug upstream traffic with `DEBUG=tmdb npm run dev`.
* Images `src/lib/image.js`: `w342` posters, `w780` backdrops, `w1280` hero only. Lazy + async decode, aspect-ratio boxes (no CLS).
* Rails `src/lib/requests.js`: trending, top_rated, upcoming, Netflix TV (`with_networks=213`), 11 genre discovers.

## Routes

* `/` — hero + 15 rails + modal
* `/title/:type/:id` — details + YouTube-nocookie trailer + cast + JSON-LD
* `/search?q=` — debounced multi-search, abort stale
* `/mylist` — localStorage `routs:mylist:v1`

## Quality bar

* Beautiful UI: tokens in `src/styles/tokens.js`, Bebas Neue + Inter, Netflix red `#E50914` on `#0B0A18`.
* Best UX: 3-click trailer, focus-return modal, toasts, skeletons, retry/empty states.
* A11y WCAG 2.2 AA: landmarks, skip link, keyboard carousels, `alt="{title} ({year}) poster"`, 44px targets, reduced-motion.
* SEO: `react-helmet-async` titles/descriptions/canonical/OG/Twitter/JSON-LD, `robots.txt`, `sitemap.xml`, semantic HTML.
* Optimized: code-split routes, `React.memo`, 5-min cache + dedupe, preconnect image CDN. Budgets: Lighthouse ≥90, LCP <2.5s, CLS <0.1.
* Secure: no keys in repo, `.env` ignored, CSP headers (`vercel.json`/`netlify.toml`), axios timeout+abort, `npm audit` clean.
* Responsive mobile-first: 360 / 768 / 1280 / 1440, scroll-snap rails, `clamp()` hero.

## Deploy

Vercel (recommended) or Netlify. Set `VITE_TMDB_KEY` in dashboard. SPA fallback + security headers already in `vercel.json` / `netlify.toml`.
