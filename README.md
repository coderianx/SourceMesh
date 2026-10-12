# SourceMesh

[![License: MIT](https://img.shields.io/badge/License-MIT-3fb950.svg)](LICENSE)
![Go](https://img.shields.io/badge/Go-1.27-00ADD8?logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)

**The open source social network for developers.**

SourceMesh is a small, fully open source social network with a deliberately
short dependency list. It has accounts, a feed, comments and likes, long-form
Markdown posts (MeshWrites) with a bookmark system, and profile pages. The
whole app speaks a simple JSON-speaking HTTP API.

The source code lives at <https://github.com/coderianx/SourceMesh>.

## Features

- **Accounts** — register and sign in with a username and password. Short-lived
  JWT access tokens (30 min) plus a hashed refresh token (30 days) stored in
  PostgreSQL.
- **Meshflows** — short posts (up to 1000 characters) with comments and likes.
  They show up on your profile and can be deleted by their author.
- **MeshWrites** — long-form Markdown posts with a title, a live-preview editor
  and a readable article page.
- **Saves (bookmarks)** — bookmark any MeshWrite from its page; saved items are
  collected in the **Saved** tab of your profile.
- **Dashboard** — an app shell with a sidebar and a feed of the latest
  MeshWrites, with a dark/light theme toggle.
- **Profiles** — your own profile (posts, MeshWrites, saved) and public
  profiles at `/@username`.
- **Bilingual UI** — Turkish and English, switchable at runtime.
- **Security basics** — passwords hashed with bcrypt, per-IP rate limiting on
  every endpoint.

## Tech stack

| Layer       | Technology                                                            |
| ----------- | --------------------------------------------------------------------- |
| Backend     | Go 1.27, [chi](https://github.com/go-chi/chi) router, pgx, go-redis   |
| Auth        | JWT (golang-jwt), bcrypt, refresh tokens stored hashed (SHA-256)      |
| Database    | PostgreSQL                                                            |
| Cache       | Redis (feed cache + rate-limit counters)                              |
| Frontend    | React 19, Vite 8, react-markdown + remark-gfm, lucide-react, oxlint   |

## Repository layout

```
backend/
  main.go                 # HTTP router and server entry point
  internal/
    handlers/             # auth, meshflow, meshwrite and public profile handlers
    middlewares/          # JWT auth (required / optional) and per-IP rate limiting
    models/               # request models and JWT claims
    store/                # PostgreSQL pool, schema creation, Redis clients, feed cache
frontend/
  src/
    components/           # pages and UI components (React)
    lib/                  # auth, i18n and formatting helpers
    i18n/                 # Turkish and English dictionaries
    main.jsx              # client-side routing entry point
```

## Getting started

### Prerequisites

- Go **1.27+**
- Node.js **20.19+ or 22.12+** (Vite 8 requirement)
- PostgreSQL running locally
- Redis running locally on `localhost:6379`

> The Redis address is currently hardcoded to `localhost:6379`. Two logical
> databases are used: DB 0 for rate-limit counters, DB 1 for the MeshWrite feed
> cache.

### 1. Backend

Create a `.env` file inside `backend/`:

```env
DB_URL=postgres://user:password@localhost:5432/sourcemesh?sslmode=disable
JWT_SECRET=replace-with-a-long-random-string
```

Then start the server:

```bash
cd backend
go run .
```

Database tables are created automatically on startup. The API listens on
`http://localhost:8080`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies every request under `/api` to
`http://localhost:8080`, so no extra configuration is needed.

For a production build:

```bash
npm run build     # outputs to frontend/dist/
npm run preview   # serve the build locally
```

Serve the built `dist/` folder with any static file server and forward `/api`
to the backend.

## Environment variables

| Variable     | Example                                                            | Description                                    |
| ------------ | ------------------------------------------------------------------ | ---------------------------------------------- |
| `DB_URL`     | `postgres://user:password@localhost:5432/sourcemesh?sslmode=disable` | PostgreSQL connection string (required).     |
| `JWT_SECRET` | `long-random-string`                                                | HMAC secret used to sign JWTs (required).      |

## API overview

All routes are mounted under `/api/v1`. In the tables below, `✓` means the
route requires an `Authorization: Bearer <accessToken>` header, `–` means it is
public, and `optional` means the handler uses the token when it is present (for
example to fill `liked` / `saved` flags).

### Auth

| Method | Endpoint                | Auth | Description                                     |
| ------ | ----------------------- | ---- | ----------------------------------------------- |
| POST   | `/auth/register`        | –    | Create an account (username ≤ 20, password ≥ 6) |
| POST   | `/auth/login`           | –    | Sign in; returns access and refresh tokens      |
| POST   | `/auth/refresh`         | –    | Rotate the session with a refresh token         |
| GET    | `/auth/me`              | ✓    | Current user with their mesflows and meshwrites |

### Meshflow (short posts)

| Method | Endpoint                     | Auth | Description                    |
| ------ | ---------------------------- | ---- | ------------------------------ |
| POST   | `/meshflow`                   | ✓    | Create a meshflow (≤ 1000 chars) |
| DELETE | `/meshflow/{id}`              | ✓    | Delete your own meshflow       |
| POST   | `/meshflow/{id}/comments`     | ✓    | Add a comment                  |
| GET    | `/meshflow/{id}/comments`     | ✓    | List comments                  |
| POST   | `/meshflow/{id}/like`         | ✓    | Like a meshflow                |
| DELETE | `/meshflow/{id}/like`         | ✓    | Remove your like               |

### MeshWrite (long-form Markdown posts)

| Method | Endpoint                    | Auth     | Description                                       |
| ------ | --------------------------- | -------- | ------------------------------------------------- |
| POST   | `/meshwrite`                 | ✓        | Publish (title ≤ 200 chars, Markdown body)        |
| GET    | `/meshwrite/latest`          | –        | Latest 50 MeshWrites, served from the Redis cache |
| GET    | `/meshwrite/{id}`            | optional | Single MeshWrite; includes your `saved` flag      |
| DELETE | `/meshwrite/{id}`            | ✓        | Delete your own MeshWrite                         |
| GET    | `/meshwrite/saved`           | ✓        | MeshWrites you have saved                         |
| POST   | `/meshwrite/{id}/save`       | ✓        | Save a MeshWrite (409 if already saved)           |
| DELETE | `/meshwrite/{id}/save`       | ✓        | Remove a save (404 if not saved)                  |

### Profiles

| Method | Endpoint               | Auth     | Description                                          |
| ------ | ---------------------- | -------- | ---------------------------------------------------- |
| GET    | `/profile/{username}`  | optional | Public profile with meshflows and MeshWrites         |

## Frontend pages

| Route                    | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `/`                      | Landing page                                                      |
| `/register`, `/login`    | Sign up / sign in                                                 |
| `/profile`               | Your profile: **Posts**, **MeshWrites** and **Saved** tabs        |
| `/dashboard`             | App shell with sidebar and the latest MeshWrites feed             |
| `/@username`             | Public profile                                                    |
| `/meshwrite/new`         | Markdown editor with live preview                                 |
| `/meshwrite/view/{id}`   | MeshWrite reader with the save (bookmark) button                  |

## How the MeshWrite feed works

The latest MeshWrites are cached in Redis instead of being queried from
PostgreSQL on every request:

- a background goroutine refreshes the cache every **2 minutes**,
- the cache keeps the **50 newest** MeshWrites (`meshwrites:latest`, DB 1),
- `GET /meshwrite/latest` serves the cached JSON directly and returns an empty
  list before the first refresh.

## Security notes

- Passwords are hashed with bcrypt (cost 12).
- Access tokens expire after 30 minutes; refresh tokens are single-use and
  stored hashed in the database.
- Every endpoint has a per-IP rate limit: 5 requests/min for the auth routes,
  15/min for writes, 30/min for reads.
- CORS is not enabled; the frontend is expected to be served behind the same
  origin (proxy `/api` to the backend).

## Contributing

Bug reports and pull requests are welcome. Keep the core small and readable:
few dependencies, understandable package structure, no unnecessary
abstractions.

1. Fork the repository and create a branch.
2. Make your change and run the checks:
   - backend: `go build ./... && go vet ./...`
   - frontend: `npm run lint && npm run build`
3. Open a pull request describing what you changed and why.

## License

[MIT](LICENSE) © coderianx
