## Context

The app is a monorepo: an Express/TypeScript + Prisma backend (`backend/`) and a
Vite/React SPA (`frontend/`), with Postgres. Auth uses a session JWT in an
`httpOnly` + `secure` + `sameSite=strict` cookie. The course requires an infra &
deployment artifact (CI/CD, secrets, public URL) with the hard constraint of
**no paid subscriptions**, and the deployment is run by the owner (locally,
exposed publicly), not by us. We only commit configuration.

## Goals / Non-Goals

**Goals**
- Package the whole app as a reproducible, single-origin Docker image + compose.
- Provide a free public-URL path (Cloudflare Tunnel) and a free-tier cloud option
  (`render.yaml`), documented.
- Provide a basic CI pipeline (tests + build) via GitHub Actions.
- Fill the README infra/security/tests sections and add `docs/deployment.md`.

**Non-Goals**
- No actual cloud deployment performed here; no paid services.
- No secrets committed; no change to product features or the data model.
- No cross-origin cookie relaxation (we keep `sameSite=strict` via single origin).

## Decisions

### Single-origin serving (keeps the strict cookie)
- Add a guarded branch in `createApp`: when `SERVE_FRONTEND === 'true'`, mount
  `express.static(<clientDist>)` and an SPA fallback that returns `index.html`
  for non-API GETs. The fallback MUST NOT swallow `/api/*` (those keep returning
  JSON, including 404s), so it is registered after the API routers and skips any
  path starting with `/api`.
- Enable `app.set('trust proxy', 1)` so `secure` cookies are honored behind the
  HTTPS tunnel/proxy (Cloudflare terminates TLS and forwards HTTP locally).
- Add `GET /api/health` → `200 { status: 'ok' }` (unauthenticated) for
  container/readiness checks and tunnel smoke tests.
- Dev is unaffected: the flag is off by default, so `npm run dev` keeps frontend
  (5173) and backend (3000) separate.

### Docker packaging (multi-stage)
- Root `Dockerfile`:
  1. `deps`/`build-frontend`: install + `vite build` → `/frontend/dist`.
  2. `build-backend`: install + `tsc` → `/backend/dist`, `prisma generate`.
  3. `runtime` (node:20-alpine): copy backend `dist`, prod `node_modules`,
     `prisma/`, and the frontend `dist` into a `public/` folder the backend
     serves; set `SERVE_FRONTEND=true`, `NODE_ENV=production`; entrypoint runs
     `prisma migrate deploy` then `node dist/index.js`.
- `.dockerignore` excludes `node_modules`, test output, `.env`, `.git`.
- The backend resolves the client dist via a `CLIENT_DIST` path (default
  `../public` relative to `dist/`), set by the image layout.

### Compose for local/production-like run
- `docker-compose.prod.yml`: `db` (postgres:16 with a named volume + healthcheck)
  and `app` (built from the Dockerfile), `app` `depends_on` db healthy. Secrets
  come from the environment / an untracked `.env.prod` (documented, not
  committed). `app` exposes `PORT` (default 3000). Optional one-shot seed via a
  documented `docker compose run` command.

### Public URL — Cloudflare Tunnel (free)
- Documented flow: `docker compose -f docker-compose.prod.yml up`, then
  `cloudflared tunnel --url http://localhost:3000` → prints a public
  `https://<random>.trycloudflare.com` URL. No account/payment needed for the
  quick tunnel. `FRONTEND_URL`/CORS is not an issue since it is single-origin.

### Cloud option — Render Blueprint (free tier, optional)
- `render.yaml`: a `web` service (Docker) + a free Postgres. `JWT_SECRET` via
  `generateValue: true`; `DATABASE_URL` wired from the managed DB; `ADMIN_EMAIL`
  /`ADMIN_PASSWORD`/`SERVE_FRONTEND` as env vars (values set in the dashboard,
  not committed). Documented as an alternative to the local+tunnel path.

### CI — GitHub Actions
- `.github/workflows/ci.yml`, triggered on push/PR:
  - `backend` job: Node 20.19, `npm ci`, `prisma generate`, `npm test`.
  - `frontend` job: Node 20.19, `npm ci`, `npm run test` (Vitest) + `npm run build`.
  - `docker` job: `docker build` the image to prove it assembles.
  - Uses the built-in `GITHUB_TOKEN`; any deploy secrets would be GitHub Actions
    secrets (documented, none required for CI itself).

### Secrets management
- Nothing secret in git. Required variables documented in `.env.example` and
  `docs/deployment.md`: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`,
  `ADMIN_PASSWORD`, `NODE_ENV`, `PORT`, `SERVE_FRONTEND`, optional
  `RATE_LIMIT_DISABLED`, `DASHBOARD_DUE_SOON_DAYS`. Local prod uses an untracked
  `.env.prod`; Render uses dashboard env vars; CI uses Actions secrets.

## Risks / Trade-offs
- **SPA fallback vs API**: a greedy catch-all could hijack `/api`. Mitigated by
  guarding the fallback to non-`/api` paths and keeping the JSON 404 behavior.
- **`secure` cookie locally**: without `trust proxy` + HTTPS, the cookie would
  not set. The tunnel provides HTTPS; `trust proxy` makes Express trust it. For a
  purely-local HTTP run (no tunnel), `NODE_ENV` can be left non-production so the
  cookie is not `secure` — documented.
- **Free-tier limits**: Render free Postgres/web sleep or expire; acceptable for
  a demo. The local+Cloudflare path avoids this entirely.

## Verification Plan
- Unit: keep suites green; add tests for `GET /api/health` and the
  `SERVE_FRONTEND` static/SPA-fallback behavior (fallback serves index for a
  non-API route; `/api/*` still returns JSON/401/404).
- Deployment smoke: `docker build` + `docker compose -f docker-compose.prod.yml
  up`, then curl `/api/health` (200), `/` (serves the SPA `index.html`),
  `/api/auth/me` (401 without cookie), and a login round-trip; tear down and
  restore.
- Optionally point Playwright at the containerized app to run the main flow.

## Migration Plan
- Purely additive: new files + a guarded backend branch. Dev workflow unchanged.
  No DB migration, no breaking changes.
