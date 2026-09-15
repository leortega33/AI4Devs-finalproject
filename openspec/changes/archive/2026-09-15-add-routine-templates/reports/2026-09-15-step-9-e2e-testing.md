# Step 9 Report - E2E Testing (Playwright)

- Date: 2026-09-15
- Change: add-routine-templates
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, frontend (Vite) on `http://localhost:5173`.
- PostgreSQL up via `docker compose`; base catalog seeded (11 exercises).
- Browser locale `es-AR` → app defaults to Spanish.

## Command
- `npx playwright test --workers=1`

## Results
- 10 tests passed (chromium), including the new routine-templates flow:
  - **new** `routines.spec.ts`: log in → open the routines library from the
    dashboard ("Rutinas") → build a new routine (name + session "Sesión A") →
    add a main-phase exercise via the `ExercisePickerDialog` ("Sentadilla") →
    save → the routine appears in the list → duplicate it (a "… (copia)" row
    appears) → edit the original (set objective "Fuerza") → save → the original
    persists.
  - All other suites (auth, clients, i18n, app-shell, medical-record,
    exercises) kept passing with the new "Rutinas" dashboard entry.

## Notes / Lessons
- Playwright's `getByRole` `name` option is a case-insensitive **substring**
  match by default; used `exact: true` for the routine "Nombre" field (to avoid
  matching "Nombre de la sesión") and for the final list assertion (to avoid
  matching the "… (copia)" row).
- The login endpoint is rate-limited (10/15 min, in-memory). Repeated failed
  runs exhausted the window; restarting the backend reset it. The suite is run
  serially (`--workers=1`).

## Test Data Cleanup
- `DELETE FROM "RoutineTemplate";` (cascade removed sessions/entries),
  `DELETE FROM "Client";`, `DELETE FROM "Exercise" WHERE name LIKE 'E2E%';`,
  sequences reset, `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-run counts: RoutineTemplate = 0, Client = 0, Exercise = 11 (base catalog
  intact).
- Dev servers stopped after the run.

## Outcome
- Step 9 status: PASS
- Blocking issues: none
