# FNN — Finding Next Neverland

A web app that helps parents find, save, rate, and remember the places they visit with their children — parks, playgrounds, museums, and other fun spots — on a personal interactive map.

## Features

- **Find nearby parks** — one tap searches OpenStreetMap (Overpass API) for parks and playgrounds around you, no API key required; candidates drop onto the map and can be saved with one click
- **Interactive map** of saved places (Leaflet + React-Leaflet) with routing/directions and colour-coded markers (saved, bookmarked, active, you-are-here, and nearby-park candidates)
- **Add / edit / delete places** with photos, star ratings, and notes — add from a found park or by clicking the map
- **Log repeat visits** — record each return trip (date, rating, note) with full visit history; per-place `visit_count` and `last_visited_at` stay in sync automatically
- **Bookmarks / favourites** for quick access to loved spots
- **Search, sort, and pagination** across the place list
- **Authentication & account management** (sign up, login, password reset, profile)
- **Geocoding** of place names to coordinates via OpenAI (GPT-4o)
- **Email** (password reset, feedback) via Resend
- **Dark mode** and responsive mobile/desktop layouts

## Tech Stack

| Layer         | Technology                                        |
| ------------- | ------------------------------------------------- |
| Framework     | Next.js 14 (App Router), React 18, TypeScript     |
| Styling       | Tailwind CSS, styled-components                   |
| Database      | Supabase (Postgres) + committed RPC (`log_visit`) |
| Auth          | NextAuth (Auth.js v5), bcryptjs                   |
| Maps          | Leaflet, React-Leaflet, Leaflet Routing Machine   |
| Nearby search | Overpass API (OpenStreetMap), server-side proxy   |
| AI / Geocode  | OpenAI API (GPT-4o)                               |
| Email         | Resend                                            |
| Forms         | React Hook Form, Zod                              |
| Deployment    | Vercel                                            |

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # serve the production build
npm run prod    # build + start
npm run lint    # run ESLint
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# OpenAI (place-name geocoding)
OPENAI_API_KEY=

# Resend (transactional email)
RESEND_API_KEY=
```

> Overpass ("parks near me") needs no key — the server proxy identifies FNN via a `User-Agent` and caches results for a day (`OVERPASS_REVALIDATE_SECONDS`).

## Project Structure

```
app/
├── _components/       # UI: map, lists, forms, nav, modals (LogVisitModal, VisitsSection, …)
│   └── map/           # Map, DetectClick, Loader
├── _lib/
│   ├── contexts/      # Place, PlaceData, Bookmark, Location, MobilePanel, UserRole
│   ├── hooks/         # useGeolocation, useUrlPosition
│   ├── services/      # routing.ts, overpass.ts (nearby-parks client helper)
│   ├── utils/         # distance, constants
│   ├── actions.tsx    # server actions (auth, CRUD, logVisit, feedback)
│   ├── auth.tsx       # NextAuth config
│   ├── data-service.ts# Supabase queries + RPC calls
│   └── email.ts       # Resend transactional email
├── api/
│   ├── auth/          # NextAuth handlers
│   ├── routing/       # map routing endpoint
│   ├── overpass/nearby/  # OSM nearby-parks proxy (POST { lat, lng, radius? })
│   └── openai/Coordinates/  # place-name → coordinates geocoding
├── placelist/         # list, [placeId] detail, form, bookmarks
├── dashboard/         # profile & credentials
├── login/ register/ forgot-password/ reset-password/
├── about/ support/
supabase/
└── log_visit.sql      # committed RPC: atomic visit insert + counter bump
```

## Data Model (Supabase)

- **`user`** — accounts and profile data
- **`placelist`** — saved places (location, rating, photos, notes, owner), plus denormalized `visit_count` and `last_visited_at`
- **`visits`** — one row per repeat visit (date, rating, note, owner) — full visit history
- **`bookmark`** — user-favourited places
- **`feedbacks`** — app ratings and feedback

### `log_visit` RPC

Logging a visit and bumping the counters happen in a single transaction via the `log_visit` Postgres function (`supabase/log_visit.sql`), so the count can never drift. It enforces ownership and a 1–5 rating range, and uses `GREATEST(...)` so backdating an old visit never moves `last_visited_at` backwards. The SQL is committed to the repo (not just the Supabase dashboard) on purpose.

## Deployment

Deployed on [Vercel](https://vercel.com/). Set the environment variables above in Project → Settings → Environment Variables before deploying. Pushes to the main branch trigger automatic deployments. Apply `supabase/log_visit.sql` to the database before using the repeat-visit feature.
