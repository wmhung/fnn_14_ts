# FNN — Finding Next Neverland

A web app that helps parents track, rate, and remember the places they visit with their children — parks, museums, playgrounds, and other fun spots — on a personal interactive map.

## Features

- **Interactive map** of saved places (Leaflet + React-Leaflet) with routing/directions between points
- **Add / edit / delete places** with photos, ratings, and comments
- **Bookmarks / favourites** for quick access to loved spots
- **Search, sort, and pagination** across the place list
- **Authentication & account management** (sign up, login, password reset, profile)
- **Geocoding** of place names to coordinates via OpenAI
- **Email** notifications (password reset, feedback) via Resend
- **Dark mode** and responsive mobile/desktop layouts

## Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 14 (App Router), React 18, TypeScript     |
| Styling      | Tailwind CSS, styled-components                   |
| Database     | Supabase (Postgres)                               |
| Auth         | NextAuth (Auth.js v5), bcryptjs                   |
| Maps         | Leaflet, React-Leaflet, Leaflet Routing Machine   |
| AI / Geocode | OpenAI API                                        |
| Email        | Resend                                            |
| Forms        | React Hook Form, Zod                              |
| Deployment   | Vercel                                            |

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

Create a `.env.local` file in the project root with the following:

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

## Project Structure

```
app/
├── _components/      # Reusable UI (maps, lists, forms, nav, modals)
├── _lib/
│   ├── contexts/     # React contexts (Place, Bookmark, Location, etc.)
│   ├── hooks/        # useGeolocation, useUrlPosition
│   ├── services/     # routing service
│   ├── utils/        # distance, constants
│   ├── actions.tsx   # server actions (auth, CRUD, feedback)
│   ├── auth.tsx      # NextAuth config
│   └── data-service.ts  # Supabase queries
├── api/
│   ├── auth/         # NextAuth handlers
│   ├── routing/      # map routing endpoint
│   └── openai/       # coordinate geocoding endpoint
├── placelist/        # place list, detail, edit, form, bookmarks
├── dashboard/        # profile & credentials
├── login/ register/ forgot-password/ reset-password/
├── about/ support/
```

## Data Model (Supabase)

- **`user`** — accounts and profile data
- **`placelist`** — saved places (location, rating, photos, comments, owner)
- **`bookmark`** — user-favourited places
- **`feedbacks`** — app ratings and feedback

## Deployment

Deployed on [Vercel](https://vercel.com/). Set the environment variables above in the Vercel project settings (Project → Settings → Environment Variables) before deploying. Pushes to the main branch trigger automatic deployments.

> Note: a leftover `netlify.toml` and `@netlify/plugin-nextjs` dependency remain in the repo from an earlier setup. They are unused with Vercel and can be removed.
