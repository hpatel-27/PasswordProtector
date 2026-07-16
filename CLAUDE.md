# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout note

The entire application lives under `FinalProject/`. Run all commands from there, not the repo root. The repo-root `README.md` and `FinalProject/README.md` document the HTTP API routes.

## Running the stack

Everything runs via Docker Compose (four services: nginx `proxy`, `frontend`, `api`, Postgres `database`).

```bash
cd FinalProject
cp .env.example .env   # then fill in real values
docker compose up --build
```

The app is served at `http://localhost` (nginx proxy on port 80). Postgres is exposed on host port `5433` (container 5432). The `api` container runs `nodemon` with `./api/src` mounted as a volume, so backend edits hot-reload. The `frontend` is a **static build** (see below) and must be rebuilt (`docker compose up --build`) to pick up changes.

`database` has a healthcheck and `api` waits for it via `depends_on: condition: service_healthy`, so the API won't start before Postgres is ready.

### Environment

Compose reads `FinalProject/.env` (git-ignored). Copy `.env.example` and fill it in. Keys:

- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — configure the Postgres container on first init **and** are read by the API's DB connection.
- `DB_HOST` (= `database`, the compose service name) / `DB_PORT` (= `5432`, in-container).
- `PORT`, `API_SECRET_KEY` (signs JWTs).
- `NODE_ENV` — set to `production` to enable Secure cookies (requires HTTPS); leave unset for local http.

### Database seeding

`database/db_schema/pw_protector.sql` is mounted into `/docker-entrypoint-initdb.d` and runs **only on first init** of an empty data volume. Postgres persists to `database/data/` (git-ignored). To force a re-seed after schema changes, stop the stack and delete `database/data/`.

## Architecture

Request flow: **browser → nginx proxy → frontend (static) or api → Postgres**.

- **nginx proxy** (`proxy/default.conf.template`) routes `/` to the `frontend` service and `/api/*` to the `api` service, stripping the `/api` prefix via `rewrite`. So a browser call to `/api/users/login` hits the API's `/users/login` route.
- **frontend** (`frontend/`) is a **React + Vite** single-page app (JavaScript). It is built to static files and served by nginx inside the frontend container (`frontend/Dockerfile` is a multi-stage build → nginx; `frontend/nginx.conf` adds the SPA `try_files … /index.html` fallback). Routing is client-side via `react-router-dom` (`src/App.jsx`); pages live in `src/pages/`. All data access goes through `src/api/client.js` (base URL `/api`, `fetch` with `credentials: 'include'`). Per-page CSS in `src/styles/` is **scoped under a page-root class** (e.g. `.home-container`, `.login-page`) because Vite bundles all imported CSS globally — keep new styles scoped the same way. Bootstrap is loaded via CDN in `index.html` for the `btn`/`col` classes. For local dev outside Docker, `vite dev` proxies `/api` (see `vite.config.js`).
- **api** (`api/src/`) is an Express server. `server.js` mounts a single `APIRouter.js` that defines every route inline and delegates all data access to the DAO layer.

### API layers

- `APIRouter.js` — all route handlers in one file. Protected routes use `TokenMiddleware` (auth user on `req.user`). A shared `sendError(res)` helper maps DAO rejections (`{ status, error }`) to responses.
- **DAOs** (`db/UserDAO.js`, `db/ProviderDAO.js`, `db/AccountDAO.js`) — all SQL lives here, **promise-style throughout**. `UserDAO`/`ProviderDAO` delegate down to `ProviderDAO`/`AccountDAO`. Provider/account operations gate on ownership via the shared `db/ownership.js` `checkUserProviderConnection(userId, providerId)` (checks the `user_provider` join table) — do not re-inline this check.
- **Models** (`db/models/User.js`, `Provider.js`, `Account.js`) — wrap raw DB rows, mapping prefixed columns to clean property names. `User` keeps `#passwordHash`/`#salt` private and exposes `validatePassword()`; its `toJSON()` (and the `getFilteredUser` helper in `UserDAO`) strip credentials before anything is returned to a client.
- `db/DBConnection.js` — a lazily-created **Postgres (`pg`) connection pool**. `db.query(sql, params)` returns a Promise resolving `{ results, rowCount, fields }` where `results` is the returned rows. Use numbered placeholders (`$1, $2, …`), `RETURNING` for generated ids on INSERT, and `rowCount` for rows affected by INSERT/UPDATE/DELETE. Note `user` is a reserved word in Postgres and must be quoted as `"user"` in queries.

### Auth

JWT-based (`api/src/middleware/TokenMiddleware.js`). On login, `generateToken` signs a token with `API_SECRET_KEY` (1-hour TTL, cookie lifetime kept in sync) and sets it as an httpOnly cookie named `PWProtectorToken`; the `Secure` flag is gated on `NODE_ENV === 'production'` so it works over local http. `TokenMiddleware` accepts the token from that cookie **or** an `Authorization: Bearer` header, verifies it, and populates `req.user`. User login passwords are hashed with `crypto.pbkdf2` (10000 iterations, sha256, 32 bytes) using a per-user random salt.

### Data model

Column names are prefixed per table: `usr_*` (user), `prv_*` (provider), `act_*` (account), `upr_*` (user_provider join). A user owns providers through the `user_provider` many-to-many table; an account belongs to one provider (`account.prv_id`, `ON DELETE CASCADE`). This lets one user store multiple accounts per site.

### Account-password encryption

Stored account passwords (`account.act_password`, `VARCHAR(512)`) are encrypted at rest with **reversible** AES-256-GCM (`db/encryption.js`), **not** hashed — a password manager must be able to show the user their stored password. This is distinct from *login* passwords, which are one-way pbkdf2 hashes (see Auth).

- `encryption.js` exposes `encrypt`/`decrypt`. Ciphertext is stored as `gcmv1:<iv>:<authTag>:<ciphertext>` (all base64); the `gcmv1` header is a version marker.
- The 32-byte key comes from `ACCOUNT_ENCRYPTION_KEY` (base64) and is validated on first use. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- `AccountDAO` encrypts on INSERT/UPDATE and decrypts on read (via its `toAccount` helper). `decrypt` passes through any value lacking the `gcmv1:` header, so the plaintext demo-seed rows in `pw_protector.sql` still display without a migration step.
- GCM is authenticated: a tampered or wrong-key ciphertext throws on decrypt rather than returning garbage. Rotating `ACCOUNT_ENCRYPTION_KEY` invalidates all previously encrypted rows.
