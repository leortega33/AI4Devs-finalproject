# Step 7 Report - Unit Tests and Database Verification

- Date: 2026-09-17
- Change: add-deployment-infra
- Agent: GitHub Copilot (backend-developer / frontend-developer)

## Commands Executed

- Baseline / post-test DB counts:
  `docker exec gym-postgres psql -U gymDbUser -d gymDb -t -c "SELECT 'Client='||count(*) FROM \"Client\" UNION ALL SELECT 'Payment='||count(*) FROM \"Payment\" UNION ALL SELECT 'Exercise='||count(*) FROM \"Exercise\";"`
- Targeted: `npx jest src/app.test.ts`
- Full backend + coverage: `npm run test:coverage`
- Full frontend: `npx vitest run`

## Unit Test Results

- Targeted `createApp` deployment tests (`src/app.test.ts`): 4 passed
  - `GET /api/health` → 200 `{ status: 'ok' }` (unauthenticated)
  - `SERVE_FRONTEND=true` serves the SPA `index.html` for a non-API route
  - the SPA fallback does not hijack `/api/*` (protected route still 401)
  - unknown `/api/*` returns a JSON 404
- Full backend suite: 35 suites, **268 passed**, 0 failed (was 264 before; +4)
- Full frontend suite: 26 files, **65 passed**, 0 failed (unchanged; the
  API-base-URL centralization refactor kept all tests green)
- Backend coverage: **98.71%** statements / 91.91% branches — 90% threshold met.

## Database State Verification

- Pre-test baseline: `Client=0`, `Payment=0`, `Exercise=11`
- Post-test validation: `Client=0`, `Payment=0`, `Exercise=11`
- State restored: N/A (unchanged — unit tests use mocks; `createApp` tests hit
  only `/api/health` and static serving, no DB queries)

## Notes

- Frontend change: the per-service `API_BASE_URL` was centralized in
  `services/apiBaseUrl.ts`, defaulting to relative URLs in a production build
  (single-origin) and to `http://localhost:3000` in dev. All service tests mock
  axios, so behavior is unaffected.

## Outcome

- Step 7 status: PASS
- Blocking issues: none
