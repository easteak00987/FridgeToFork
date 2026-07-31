# FridgeToFork

*From your fridge to your fork.*

## Live demo

| | |
|---|---|
| **App** | **https://fridgetofork-theta.vercel.app** |
| **API** | https://fridgetofork-api.onrender.com/api |

Sign in as the demo cook to get a stocked fridge, a planned week, favourites and
reviews already in place:

| Account | Email | Password |
|---|---|---|
| Demo cook | `demo@fridgetofork.test` | `DemoPass123!` |
| Admin | `admin@fridgetofork.local` | `AdminPass123!` |

> The API runs on a free Render instance, which sleeps when idle — the first
> request after a quiet spell takes 30–60 seconds to wake. Load the app once
> before demoing it.

Worth a look first: **My Fridge** (`/fridge`) ranks all 32 recipes by how much of
each you can already make, and **Cuisine Map** (`/cuisines`) browses them by
country.

## Project Overview

### Objective

**FridgeToFork** turns the ingredients you already have into personalised, guided
recipes from world cuisines. Home cooks juggle scattered recipe sites, ignored
dietary needs, and little guidance on using what is already in the kitchen —
which leads to food waste, decision fatigue, and a narrow repertoire of dishes.
FridgeToFork answers one question well: *what can I cook, right now, with this?*

### Target Audience
- Beginner cooks who want reliable recipes and step-by-step guidance
- Home cooks trying to use up what they already have
- Food enthusiasts exploring cuisines beyond their usual rotation

### Goals
Cut household food waste, build real cooking confidence, and make global cuisine
approachable for everyday cooks.

---

## Team Members

| ID          | Name              | Role      |
|-------------|-------------------|-----------|
| 20230104123 | Easteak Ahmed     | Lead      |
| 20220204061 | Saleh Mahmud Sami | Front-end |
| 20230104121 | Fairuz Anadi      | Back-end  |

---

## Technology Stack

| Layer            | Technology                                                    |
|------------------|---------------------------------------------------------------|
| Frontend         | React 19 + Tailwind CSS 4 (Vite)                              |
| Typography       | Fraunces (display) + Inter (UI), self-hosted via `@fontsource` |
| Backend          | Laravel 10 (PHP 8.2+), RESTful API                            |
| Database         | PostgreSQL (SQLite for local dev, SQL Server still supported)  |
| Auth             | Laravel Sanctum tokens, optional Google sign-in               |
| Nutrition data   | Built-in per-ingredient table; optional Spoonacular/Edamam    |
| Rendering        | Client-Side Rendering (CSR)                                   |
| Hosting & DevOps | Docker Compose / Railway, CI/CD via GitHub Actions            |

---

## Features

### Core Features

| # | Requirement               | Where it lives                                                        |
|---|---------------------------|-----------------------------------------------------------------------|
| 1 | Account & Profiles        | `/preferences` — dietary preferences, allergies, skill level, household size |
| 2 | Ingredient-Based Search   | `/fridge` — stock your fridge, get recipes ranked by how much you already have |
| 3 | Cuisine Map Explorer      | `/cuisines` — interactive world map, browse by country and region     |
| 4 | Guided Cooking Mode       | `/recipes/{id}/cook` — one step at a time, per-step timers, spoken prompts |
| 5 | Favourites & Meal Planner | `/meal-plan` — a week grid with per-day calorie totals                |
| 6 | Reviews & Ratings         | Recipe library — 5-star ratings, comments, points-based leaderboard   |
| 7 | Nutrition Insights        | Calories and macro split per serving, on every recipe                 |
| 8 | Auto Shopping List        | `/shopping-list` — built from the planned week, minus what's in the fridge, grouped by aisle |

### How the ingredient matching works

1. Every recipe line (`"2 cloves garlic, finely chopped"`) is parsed into a
   quantity, unit and ingredient by `App\Http\Services\IngredientParser`.
2. The parsed name is normalised — case, punctuation, plurals and a table of
   aliases — so *chillies*, *chilli* and *green chili* all resolve to one row.
3. Recipes are scored against your fridge as `have / required`, ranked by that
   ratio, then by how few ingredients are missing.
4. Your dietary preferences, allergies and skill level filter the results.

### Recipe artwork

The app ships no stock photography. `App\Support\DishArtwork` composes a flat
overhead illustration per recipe: a plate, a two-layer organic food mass and a
scatter of garnish, all driven by a seeded PRNG keyed on the recipe title. The
palette is chosen from the recipe's categories and dietary tags — desserts come
out chocolate-brown, seafood pink, vegan dishes green — so the picture matches
the dish rather than being random noise.

Because the seed is the title, artwork is stable across re-seeds, and the same
generator fills in for any upload that arrives without a photo, so no recipe
card is ever an empty grey box.

### Design system

| Token   | Value                                                              |
|---------|--------------------------------------------------------------------|
| Primary | `#0f5132` deep pine                                                 |
| Accent  | `#b5762a` brass                                                     |
| Ink     | `#14181b` on a `#f6f6f4` neutral paper                              |
| Type    | Fraunces (variable serif, `SOFT`/`WONK` dialled to 0) + Inter       |
| Radii   | 6 / 10 / 14 / 18 px, with pill buttons                              |

Fonts are bundled, not fetched from a CDN, so first paint is not blocked by a
third-party request and the app looks identical offline.

### CRUD Operations

- **Create** — publish a recipe with ingredients, steps, cuisine, timings,
  difficulty, servings and dietary tags.
- **Read** — browse the library, the cuisine map, recipe detail, ratings, reviews.
- **Update** — edit your own recipes; nutrition and the ingredient index are
  recalculated on save.
- **Delete** — remove your own recipes; admins can remove any.

---

## Running it locally

**Requirements:** PHP 8.2+ (with `pdo_sqlite`), Composer, Node 20+.
No database server needed — local dev defaults to SQLite.

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

Then start the two servers in separate terminals:

```bash
php artisan serve --port=8000
```

```bash
npm install --prefix client && npm run dev --prefix client
```

The app is at **http://localhost:5173**, the API at **http://localhost:8000/api**.

### Seeded accounts

| Account   | Email                      | Password        | What it has                                           |
|-----------|----------------------------|-----------------|-------------------------------------------------------|
| Demo cook | `demo@fridgetofork.test`   | `DemoPass123!`  | A stocked fridge, a planned week, favourites, reviews |
| Admin     | `admin@fridgetofork.local` | `AdminPass123!` | Admin dashboard and moderation                        |

The seeder also creates six community cooks and **32 recipes across 23 countries**,
each with a generated dish illustration (see below).

### Running with PostgreSQL

```bash
docker compose up --build
```

Compose runs the API against PostgreSQL 16 and serves the client through nginx on
port 5173, with Mailpit on 8025 for outgoing mail. To point a non-Docker run at
PostgreSQL instead of SQLite, uncomment the `pgsql` block in `.env`.

---

## Deployment

**Currently deployed to:**

| Half | Host | URL |
|---|---|---|
| React SPA | Vercel | https://fridgetofork-theta.vercel.app |
| Laravel API + PostgreSQL | Render (Singapore) | https://fridgetofork-api.onrender.com |

Both track the `anadiModifications` branch and redeploy on push.

The two halves deploy separately: the SPA to **Vercel**, the Laravel API and its
PostgreSQL database to a container host. Vercel cannot host the API — PHP is not
a first-class runtime there, and the filesystem is read-only, which Laravel's
`storage/framework` cache, session and view directories need.

Two container hosts are wired up; pick either:

- **Render** — `render.yaml` blueprint, provisions the web service and Postgres
  together. Import it at Dashboard → New → Blueprint.
- **Railway** — `railway.toml`, builds the same Dockerfile.

Both inject `PORT` and a `DATABASE_URL`, which `docker/app/start.sh` handles.

### 1a. Backend → Render

Import `render.yaml`, then set the two secrets it deliberately leaves blank:
`APP_KEY` (from `php artisan key:generate --show`) and `APP_URL` (the service's
own URL, once Render assigns it).

### 1b. Backend → Railway

Railway builds `docker/app/Dockerfile` (already wired up in `railway.toml`).

1. Create a Railway project from the repo, then add a **PostgreSQL** plugin.
2. Set these variables on the app service:

   | Variable | Value |
   |---|---|
   | `APP_KEY` | output of `php artisan key:generate --show` |
   | `APP_ENV` | `production` |
   | `APP_DEBUG` | `false` |
   | `APP_URL` | your Railway URL, e.g. `https://<your-app>.up.railway.app` |
   | `DB_CONNECTION` | `pgsql` |
   | `DATABASE_URL` | reference the Postgres plugin's connection string |
   | `CORS_ALLOWED_ORIGINS` | your Vercel URL, e.g. `https://fridgetofork-theta.vercel.app` |
   | `RUN_SEED` | `true` for the first deploy only, then remove it |

`APP_URL` matters: recipe `image_url` values are absolute, and they are built
from it.

`docker/app/start.sh` waits for the database (driver-agnostic, so `DATABASE_URL`
works), runs migrations, caches config and routes, and binds Apache to the
`PORT` Railway injects.

### 2. Frontend → Vercel

Set the project's **root directory to `client`** — `client/vercel.json` supplies
the build settings and the SPA catch-all rewrite that keeps deep links like
`/fridge` from 404ing.

One environment variable:

```
VITE_API_URL = https://<your-railway-app>.up.railway.app/api
```

```bash
cd client
vercel        # preview deploy
vercel --prod # production
```

### Uploaded photos need object storage

Generated dish artwork is rendered per request and needs no disk. **Uploaded**
recipe photos still go to the local disk, which is ephemeral on Railway — they
disappear on redeploy. For durable uploads set `FILESYSTEM_DISK=s3` plus the
`AWS_*` variables already present in `.env.example`; any S3-compatible bucket
(Cloudflare R2, Backblaze B2) works.

---

### Tests

```bash
php artisan test
```

44 tests cover ingredient parsing, timer detection, pantry matching, the cuisine
map, meal planning, shopping-list generation and nutrition. The frontend is
linted with `npm run lint --prefix client`.

---

## Non-Functional Requirements

| Requirement  | Approach                                                              |
|--------------|-----------------------------------------------------------------------|
| Performance  | Indexed cuisine/difficulty columns; ingredient matching runs off a pivot table rather than text search |
| Scalability  | Stateless token auth, so API instances scale horizontally             |
| Usability    | Responsive React UI; guided cooking works hands-free with voice prompts |
| Security     | Hashed passwords, Sanctum tokens, per-owner authorisation on every write |
| Availability | Health-checked database in Compose; nutrition falls back to the local table when a third-party API is unavailable |
| Portability  | Runs on SQLite, PostgreSQL or SQL Server without code changes         |

---

## Sustainable Development Goals

- **SDG 2 — Zero Hunger.** Ingredient-matching search helps households cook what
  they already own, cutting avoidable food waste.
- **SDG 3 — Good Health & Well-Being.** Per-serving nutrition insights guide
  users toward balanced, home-cooked meals.
- **SDG 12 — Responsible Consumption.** Shopping lists subtract what is already
  in the fridge, and servings scale to household size, encouraging mindful buying.

---

## Milestones

- **Milestone 1** — Sign up and sign in, profiles, recipe upload, basic dashboards.
- **Milestone 2** — Ingredient search, cuisine map, ratings and feedback, points and leaderboard.
- **Milestone 3** — Meal planner, shopping list, guided cooking mode, admin dashboard and moderation.
