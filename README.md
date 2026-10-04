# RoutsCinema — Netflix-Style Movie & TV Browser

A cinematic Netflix-style browsing experience for movies and TV shows, powered by the
[TMDB REST API](https://developers.themoviedb.org/3). Featured hero billboard, 15 genre
rails, details with trailers, live search, and a persistent My List.

![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![React](https://img.shields.io/badge/React-18-61DAFB)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245)
![TMDB](https://img.shields.io/badge/TMDB-REST_API-01B4E4)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Hero billboard** — a random trending title is spotlighted on every page load, with
  backdrop art, rating, metadata, overview, Play / More Info / My List actions.
- **15 content rails** — Trending Now, Top Rated, Upcoming, TV Shows, Sci-Fi, Animation,
  Action, Mystery, Horror, Romance, Comedy, Family, Crime, Thriller, Documentary.
- **Details modal & pages** — overview, genres, cast, rating, and YouTube trailer embeds.
- **Live search** — debounced multi-search across movies and TV shows, synced to the URL.
- **My List** — save titles to a watchlist persisted in `localStorage`.
- **Resilient data layer** — request throttling, in-memory caching, silent background
  retries with skeleton screens, and friendly error / empty states with manual retry.
- **Accessible (WCAG 2.2 AA)** — landmarks, skip link, keyboard-navigable carousels,
  focus-trapped modal, visible focus rings, 44px touch targets, `prefers-reduced-motion`.
- **SEO ready** — per-route titles, meta descriptions, canonical URLs, Open Graph /
  Twitter cards, JSON-LD structured data, `robots.txt`, and `sitemap.xml`.
- **Responsive** — mobile-first layout from 360px phones to 1440px desktops with
  swipeable snap-scroll rails.

## Tech Stack

| Layer          | Choice                                                         |
| -------------- | -------------------------------------------------------------- |
| Build          | Vite 5                                                         |
| UI             | React 18, styled-components 6, framer-motion 11, react-icons 5 |
| Routing        | react-router-dom 6                                             |
| SEO            | react-helmet-async 2                                           |
| Data           | axios 1.x against TMDB REST API                                |
| Testing / Lint | Vitest + Testing Library, ESLint                               |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A free TMDB API key from https://www.themoviedb.org/settings/api

### Setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd RoutsCinema--Netflix-Clone
npm install

# 2. Configure your TMDB key (pick one file)
cp .env.example .env.local
# then edit .env.local and set VITE_TMDB_KEY=your_key_here

# 3. Start the dev server (restarts are required after env changes)
npm run dev   # http://localhost:3000
```

> `.env*` files are gitignored and never committed. If a key was ever committed to
> git history, rotate it in the TMDB dashboard and replace it locally.

## Available Scripts

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start Vite dev server with TMDB proxy |
| `npm run build`      | Production build into `dist/`         |
| `npm run preview`    | Preview the production build          |
| `npm run lint`       | Run ESLint (zero warnings)            |
| `npm test`           | Run the Vitest suite once             |
| `npm run test:watch` | Run Vitest in watch mode              |

## Project Structure

```
├── index.html              # App shell: SEO meta, OG/Twitter tags, fonts, preconnects
├── vite.config.js          # Dev server + /api/tmdb proxy with timeouts and error handling
├── vercel.json / netlify.toml  # SPA fallback + security headers for deploy
├── public/                 # favicon, manifest.json, robots.txt, sitemap.xml
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Router, providers, global layout
    ├── lib/
    │   ├── tmdb.js         # Central axios client: key injection, timeouts, typed errors
    │   ├── image.js        # Sized TMDB image URL helpers (w342 / w500 / w780 / w1280)
    │   └── requests.js     # Endpoint map + the 15 home-page rails
    ├── hooks/
    │   ├── useTmdb.js      # Cached, throttled fetching with silent retries + abort
    │   └── useMyList.js    # localStorage-backed watchlist with toast feedback
    ├── styles/             # Design tokens + global styles
    ├── components/         # Navbar, Hero, Row, TitleCard, DetailsModal, Footer, …
    ├── pages/              # Home, SearchPage, MyListPage, DetailsPage, NotFound
    └── test/               # Vitest suites
```

## Routes

| Route              | View                                                                |
| ------------------ | ------------------------------------------------------------------- |
| `/`                | Hero billboard + all genre rails + details modal                    |
| `/title/:type/:id` | Full details page with trailer and cast (`type` is `movie` or `tv`) |
| `/search?q=`       | Live search results grid                                            |
| `/mylist`          | Saved watchlist                                                     |
| `*`                | 404 page                                                            |

## How It Works

- **Dev proxy** — the browser calls same-origin `/api/tmdb/...` and Vite forwards to
  `https://api.themoviedb.org/3`, so the API key stays out of client-side URLs in
  development. Run with `DEBUG=tmdb npm run dev` to log proxied upstream requests.
- **Respectful fetching** — at most 4 simultaneous TMDB requests, 5-minute in-memory
  cache with in-flight deduplication, and above-the-fold rails load first while the rest
  mount on scroll via `IntersectionObserver`.
- **Silent recovery** — transient failures (reset connections, rate limits, slow
  responses) are retried automatically with backoff; the UI only shows an error with a
  Retry button after retries are exhausted. Aborted requests never surface as errors.
- **Right-sized images** — `w342` posters in rails (`w500` retina srcset), `w780`
  backdrops, `w1280` hero only; lazy-loaded below the fold with aspect-ratio boxes to
  avoid layout shift.

## Deployment

Vercel or Netlify — both configs are included (SPA fallback + security headers).

1. Push the repo and import it in the Vercel / Netlify dashboard.
2. Set the environment variable `VITE_TMDB_KEY` to your TMDB key.
3. Deploy — the build command is `npm run build`, output directory `dist/`.

## Attribution

Data and images by [TMDB](https://www.themoviedb.org/). This product uses the TMDB API
but is not endorsed or certified by TMDB.

## License

MIT — see `LICENSE` for details.
