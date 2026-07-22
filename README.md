# FNN — Finding Next Neverland

A web app that helps parents find, save, rate, and remember the places they visit with their children — parks, playgrounds, museums, and other fun spots — on a personal interactive map.

## Features

- **Find nearby parks** — one tap searches OpenStreetMap (Overpass API) for parks and playgrounds around you, no API key required; candidates drop onto the map and can be saved with one click
- **Interactive map** of saved places (Leaflet + React-Leaflet) with routing/directions and colour-coded markers (saved, bookmarked, active, you-are-here, and nearby-park candidates)
- **Add / edit / delete places** with photos, star ratings, and notes — add from a found park or by clicking the map
- **Log repeat visits** — record each return trip (date, rating, note) with full visit history; per-place `visit_count` and `last_visited_at` stay in sync automatically
- **Bookmarks / favourites** for quick access to loved spots
- **Search, sort, and pagination** across the place list
- **Authentication & account management** — email/password plus Google & GitHub social login, password reset, profile
- **Geocoding** of place names to coordinates via OpenAI (GPT-4o)
- **Email** (password reset, feedback) via Resend
- **Dark mode** and responsive mobile/desktop layouts

## Tech Stack

| Layer         | Technology                                               |
| ------------- | -------------------------------------------------------- |
| Framework     | Next.js 14 (App Router), React 18, TypeScript            |
| Styling       | Tailwind CSS, styled-components                          |
| Database      | Supabase (Postgres) + committed RPC (`log_visit`)        |
| Maps          | Leaflet, React-Leaflet                                   |
| Routing       | OpenRouteService (server-side proxy)                     |
| Nearby search | Overpass API (OpenStreetMap), server-side proxy          |
| AI / Geocode  | OpenAI (GPT-4o) names the place, Google Maps geocodes it |
| Auth          | NextAuth (Auth.js v5), bcryptjs, Google + GitHub OAuth   |
| Email         | Resend                                                   |
| Forms         | React Hook Form, Zod                                     |
| Deployment    | Vercel                                                   |

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Prerequisites

FNN talks to several third-party services. Register an account with each and generate a key/credential for the matching environment variable below. Only Overpass ("parks near me") needs no signup.

| Service                                                           | Used for                 | Cost           |
| ----------------------------------------------------------------- | ------------------------ | -------------- |
| [Supabase](https://supabase.com)                                  | Database, storage, auth  | Free tier      |
| [OpenAI](https://platform.openai.com)                             | AI place search (GPT-4o) | Paid           |
| [Google Maps](https://console.cloud.google.com/google/maps-apis)  | Geocoding                | Free + billing |
| [OpenRouteService](https://openrouteservice.org/dev/#/signup)     | Routing / directions     | Free tier      |
| [Resend](https://resend.com)                                      | Transactional email      | Free tier      |
| [Google Cloud](https://console.cloud.google.com/apis/credentials) | Google login             | Free           |
| [GitHub](https://github.com/settings/developers)                  | GitHub login             | Free           |
| Overpass (OpenStreetMap)                                          | Find nearby parks        | Free — no key  |

For the two OAuth apps, register this callback URL (swap the domain in production):

```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github
```

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
NEXT_PUBLIC_SUPABASE_KEY=          # anon/public key
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
AUTH_SECRET=                      # any strong random string: `openssl rand -base64 32`
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # used to build the password-reset link

# Google OAuth ("Continue with Google")
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth ("Continue with GitHub")
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# AI place search: OpenAI names the place, Google Maps geocodes it
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=

# OpenRouteService (map routing / directions)
ORS_API_KEY=

# Resend (transactional email)
RESEND_API_KEY=
EMAIL_FROM=                       # verified sender, e.g. "FNN <noreply@yourdomain.com>"

# Overpass (no API key — just a contact address for their User-Agent etiquette)
OVERPASS_CONTACT=                 # e.g. you@yourdomain.com
```

> Overpass ("parks near me") needs no API key — but their etiquette asks apps to identify themselves, so set `OVERPASS_CONTACT` to an address they can reach you at. The server proxy builds the `User-Agent` from it and caches results for a day (`OVERPASS_REVALIDATE_SECONDS`).

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
