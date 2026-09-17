# Step 9 Report - E2E Testing against the Dockerized app

- Date: 2026-09-17
- Change: add-deployment-infra
- Agent: GitHub Copilot (frontend-developer)

## Setup

- The production compose stack was running (backend serving the built frontend
  on `http://localhost:3000`, single origin).
- `playwright.config.ts` was updated to read the base URL from
  `PLAYWRIGHT_BASE_URL` (defaulting to `http://localhost:5173`), so the existing
  specs can run against the containerized app without changes.
- Command:
  `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test dashboard.spec.ts auth.spec.ts --workers=1`

## Why these specs

`auth.spec.ts` (5 tests) + `dashboard.spec.ts` (1 test) exercise the **main
flow** against the real production build: login/logout, protected-route guard,
the app shell, and creating a client + overdue payment that surfaces on the
dashboard. This proves the single-origin cookie (`Secure`) works in a browser
(localhost is a secure context) and that the API + SPA are served together
correctly. The full suite was not run against the container to stay under the
login rate limiter (active in the production image); the complete E2E suite is
already validated in dev on the `add-dashboard-alerts` change.

## Results

```
6 passed (4.8s)
  ✓ auth › unauthenticated visit redirects to login
  ✓ auth › invalid login shows an error
  ✓ auth › valid login lands on the dashboard, then logout
  ✓ auth › forgot-password flow
  ✓ auth › app shell + back navigation
  ✓ dashboard › shows an overdue client and links to their payments
```

**6/6 passed** against the Dockerized single-origin production build.

## Cleanup

- Stack torn down with `docker compose -f docker-compose.prod.yml down -v`
  (throwaway DB volume removed). The E2E data lived only in that volume; the
  local dev database was untouched.

## Outcome

- Step 9 status: PASS
- Blocking issues: none
