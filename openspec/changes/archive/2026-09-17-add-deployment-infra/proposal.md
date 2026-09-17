## Why

The course deliverables require an **Infra & deployment** artifact (#7): a basic
CI/CD pipeline, secrets management, and a publicly accessible URL. The project
currently only has a local dev setup (`docker compose` for Postgres + `npm run
dev` for each app) and no deployment configuration. This change adds the
**infrastructure-as-code and CI configuration to the repository** so evaluators
can see how the system is built and deployed.

Hard constraints:
- **No paid subscriptions** of any platform.
- We do **not** deploy to or configure any third-party/course-owned system here;
  we only commit the configuration. The owner runs the deployment themselves
  (locally) and shares the public URL.
- **No real secrets** are committed — only the required variables are documented,
  with values provided at runtime via environment variables / platform secrets.

## What Changes

- **Single-origin serving (small backend change)**: behind a `SERVE_FRONTEND`
  flag, the Express backend serves the built frontend (`dist`) as static files
  with an SPA fallback, so the app runs on one origin and the existing
  `httpOnly` + `secure` + `sameSite=strict` session cookie keeps working without
  a cross-site relaxation. `trust proxy` is enabled so `secure` cookies work
  behind an HTTPS tunnel/proxy.
- **Docker packaging**: a multi-stage `Dockerfile` (build frontend → build
  backend → assemble a runtime image that serves both) plus `.dockerignore`.
- **`docker-compose.prod.yml`**: brings up Postgres + the app image, runs
  `prisma migrate deploy` (and optional seed) on startup, reads secrets from the
  environment.
- **Public URL (free)**: documented via **Cloudflare Tunnel** (`cloudflared`,
  free, no paid account) pointing at the local app — the owner runs the stack
  locally and exposes it.
- **Cloud option (free tier, optional)**: a `render.yaml` Blueprint (web service
  + Postgres) so the same app can be deployed to Render without rewrites — kept
  as a documented alternative, not required.
- **CI pipeline**: a GitHub Actions workflow (`.github/workflows/ci.yml`) that
  runs the backend (Jest) and frontend (Vitest) suites plus the production build
  on every push/PR, and validates the Docker build.
- **Documentation**: fill `readme.md` §2.4 (Infra & deployment: diagram, process,
  secrets management, public URL), §2.5 (Security), §2.6 (Tests), with a detailed
  `docs/deployment.md` linked from the README.

## Capabilities

<!-- skip_specs: true. This is an infrastructure/tooling/documentation change
     plus deployment glue (serving the built SPA); it introduces no new product
     capability or requirement, so no spec delta is created. -->

## Impact

- Backend: a guarded static-serving branch in `createApp` (`SERVE_FRONTEND`),
  `trust proxy`, and a lightweight `GET /api/health` for readiness checks. No
  change to existing API behavior when the flag is off (dev stays as-is).
- New files: root `Dockerfile`, `.dockerignore`, `docker-compose.prod.yml`,
  `render.yaml`, `.github/workflows/ci.yml`, `docs/deployment.md`.
- `readme.md` §2.4/§2.5/§2.6 filled; `.env.example` documents any new deploy
  variables (`SERVE_FRONTEND`, `PORT`) — no secret values committed.
- No data-model change, no migration.

## Scope Notes

- We do not run an actual cloud deployment as part of this change; the owner
  deploys locally and shares the Cloudflare Tunnel URL. All artifacts are
  committed so the infra is fully visible/reproducible.
- E2E/manual verification runs against the **Dockerized single-origin app**
  locally to prove the production-like setup works, then tears it down.
