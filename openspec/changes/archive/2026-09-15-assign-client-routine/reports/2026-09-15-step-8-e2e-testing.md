# Step 8 Report - E2E Testing (Playwright)

- Date: 2026-09-15
- Change: assign-client-routine
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, frontend (Vite) on `http://localhost:5173`.
- PostgreSQL up via `docker compose`; base catalog seeded (11 exercises).
- Browser locale `es-AR` → app defaults to Spanish.

## Command
- `npx playwright test --workers=1`

## Results
- 11 tests passed (chromium), including the new client-routine flow:
  - **new** `client-routine.spec.ts`: log in → create a client → build two
    library templates → open the client's routine page (empty state) → assign
    the first template (template picker + start date) → active routine shows →
    assign the second template → the first moves to the routine history (only
    one active routine at a time).
  - All other suites kept passing.

## Notes / Lessons
- Specs run alphabetically and share the database within a run. The new
  `client-routine.spec.ts` leaves a client in the list, so `clients.spec.ts`
  (which previously assumed it was the only client and used `.first()`) was
  updated to scope its edit/deactivate actions to the "E2E Tester" row via
  `getByRole('row', ...)`. This makes it robust regardless of other clients.
- Section navigation in the new spec uses `page.goto('/routines')` /
  `page.goto('/clients')` because the section buttons live only on the
  dashboard.
- Login is rate-limited (10/15 min, in-memory); the backend is restarted before
  the run and the suite runs serially (`--workers=1`).

## Test Data Cleanup
- `DELETE FROM "RoutineTemplate";`, `DELETE FROM "Client";`,
  `DELETE FROM "Exercise" WHERE name LIKE 'E2E%';`, sequences reset,
  `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-run counts: RoutineTemplate = 0, Client = 0, Exercise = 11 (base catalog
  intact).
- Dev servers stopped after the run.

## Outcome
- Step 8 status: PASS
- Blocking issues: none
