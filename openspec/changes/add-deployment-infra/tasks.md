## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-deployment-infra` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: single-origin serving + health check (TDD)

- [x] 1.1 Write failing tests: `GET /api/health` returns `200 { status: 'ok' }` unauthenticated; with `SERVE_FRONTEND=true`, a non-API GET route returns the SPA `index.html` while `/api/*` unknown paths still return a JSON 404 and protected routes still return 401
- [x] 1.2 Implement in `createApp`: add `GET /api/health`; enable `app.set('trust proxy', 1)`; behind `SERVE_FRONTEND==='true'`, mount `express.static(CLIENT_DIST)` + an SPA fallback guarded to non-`/api` GET paths (registered after the API routers, before `errorHandler`); resolve `CLIENT_DIST` (default `../public`)
- [x] 1.3 Add `SERVE_FRONTEND` and `CLIENT_DIST`/`PORT` docs to `backend/.env.example`; keep dev behavior unchanged (flag off)

## 2. Docker packaging

- [x] 2.1 Add a root multi-stage `Dockerfile`: build frontend (`vite build`), build backend (`tsc` + `prisma generate`), assemble a `node:20-alpine` runtime that copies backend `dist`, prod `node_modules`, `prisma/`, and the frontend `dist` into the served `public/` folder; set `NODE_ENV=production` and `SERVE_FRONTEND=true`
- [x] 2.2 Add an entrypoint that runs `npx prisma migrate deploy` then `node dist/index.js`; add a root `.dockerignore` (`**/node_modules`, `**/dist`, `.git`, `**/.env*`, coverage/test output)
- [x] 2.3 Build the image locally (`docker build -t gym-app .`) and confirm it completes

## 3. Compose (local production-like run)

- [x] 3.1 Add `docker-compose.prod.yml`: `db` (postgres:16, named volume, healthcheck) and `app` (built image, `depends_on` db healthy, reads env from an untracked `.env.prod`, exposes `PORT`)
- [x] 3.2 Document the seed step (`docker compose -f docker-compose.prod.yml run --rm app npx prisma db seed`) and a sample `.env.prod` in `docs/deployment.md` (no real secret values)

## 4. Public URL + cloud option (config only)

- [x] 4.1 Document the free Cloudflare Tunnel flow (`cloudflared tunnel --url http://localhost:3000` → public `*.trycloudflare.com`) in `docs/deployment.md`
- [x] 4.2 Add `render.yaml` (Blueprint: Docker web service + free Postgres; `JWT_SECRET` via `generateValue`, `DATABASE_URL` from the DB, other env vars referenced not valued) as the optional free-tier cloud path

## 5. CI pipeline (GitHub Actions)

- [x] 5.1 Add `.github/workflows/ci.yml`: `backend` job (Node 20.19, `npm ci`, `prisma generate`, `npm test`), `frontend` job (`npm ci`, Vitest, `npm run build`), and a `docker` job (`docker build`) — triggered on push/PR
- [x] 5.2 Confirm the workflow YAML is valid (lint/parse) and the job commands match the project scripts

## 6. Review Unit Tests (MANDATORY)

- [x] 6.1 Review the tests added in section 1 against `docs/backend-standards.md` (AAA, happy/error/edge) and fill any gaps

## 7. Run Unit Tests and Verify Database State (MANDATORY)

- [x] 7.1 Capture the pre-test database baseline (`Client`, `Payment`, `Exercise` counts)
- [x] 7.2 Run the targeted new tests (health + serve-frontend), then the full backend (`npm test`) and frontend (`npx vitest run`) suites; record counts and backend coverage (90%+)
- [x] 7.3 Verify the post-test DB state matches the baseline; restore if needed
- [x] 7.4 Create the report `openspec/changes/add-deployment-infra/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`

## 8. Deployment Smoke Test (MANDATORY - replaces curl step)

- [x] 8.1 `docker build` the image and bring up `docker-compose.prod.yml` with a throwaway `.env.prod`; confirm migrations run and the app starts
- [x] 8.2 Smoke test the single-origin app: `GET /api/health` → 200; `GET /` serves the SPA `index.html`; `GET /api/auth/me` → 401 without a cookie; a login round-trip sets the session cookie and reaches a protected endpoint
- [x] 8.3 Tear down the stack and volumes; restore the local dev database baseline; document commands/outputs in `openspec/changes/add-deployment-infra/reports/YYYY-MM-DD-step-8-deployment-smoke-test.md`

## 9. E2E Testing with Playwright (MANDATORY if applicable)

- [x] 9.1 Point Playwright `baseURL` at the containerized single-origin app and run the main-flow spec (login + dashboard) to prove the production-like build works end to end; document outcomes in `openspec/changes/add-deployment-infra/reports/YYYY-MM-DD-step-9-e2e-testing.md` (or record why it is not applicable and rely on the smoke test)

## 10. Documentation (MANDATORY)

- [x] 10.1 Create `docs/deployment.md`: architecture of the deployment, local Docker run, Cloudflare Tunnel public URL, Render option, CI pipeline, and secrets management (required env vars, no values)
- [x] 10.2 Fill `readme.md` §2.4 (Infra & deployment: diagram + process + secrets + public URL, linking `docs/deployment.md`), §2.5 (Security practices), and §2.6 (Tests overview with counts/commands)
- [x] 10.3 Update `docs/development_guide.md`/`docs/backend-standards.md` if the new env vars or the Docker workflow change setup instructions
- [x] 10.4 On feature close: update `readme.md` deliverables and `prompts.md` with the deployment-infra work
