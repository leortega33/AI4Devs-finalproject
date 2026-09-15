# Step 9 Report - E2E Testing (Playwright)

- Date: 2026-09-15
- Change: add-exercise-catalog
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, frontend (Vite) on `http://localhost:5173`.
- PostgreSQL up via `docker compose`; base catalog seeded (11 exercises).
- Browser locale `es-AR` (Playwright config) → app defaults to Spanish.

## Command
- `npx playwright test --workers=1`

## Results
- 9 tests passed (chromium), including the new exercise-catalog flow:
  - **new** `exercises.spec.ts`: log in → open the catalog from the dashboard
    ("Ejercicios") → seeded exercise ("Back squat") is listed → create a new
    exercise → it appears → filter by category ("Principal"/main) keeps it
    visible → edit it (set equipment) and the change persists.
  - Existing suites (auth, clients, i18n, app-shell, medical-record) kept
    passing with the new "Ejercicios" dashboard entry.

## Incident During the Run
- Docker Desktop stopped mid-session, so PostgreSQL became unreachable and login
  returned 500 (`Can't reach database server at localhost:5432`). Resolved by
  relaunching Docker Desktop, `docker compose up -d` (data persisted via the
  volume — 11 exercises intact), and restarting the backend. After that, login
  returned 200 and the full suite passed.
- As before, the suite is run serially (`--workers=1`) to avoid login
  rate-limit collisions.

## Test Data Cleanup
- `DELETE FROM "Client";`, `DELETE FROM "Exercise" WHERE name LIKE 'E2E Exercise%';`,
  `ALTER SEQUENCE "Client_id_seq" RESTART WITH 1;`,
  `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-run counts: Exercise = 11 (base catalog intact), Client = 0, User = 1.
- Dev servers stopped after the run.

## Outcome
- Step 9 status: PASS
- Blocking issues: none
