# Step 9 Report - E2E Testing (Playwright)

- Date: 2026-09-14
- Change: add-medical-record
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, frontend (Vite) on `http://localhost:5173`.
- PostgreSQL up via `docker compose`; admin seeded; DB cleaned before the run.
- Browser locale `es-AR` (Playwright config) → app defaults to Spanish.

## Command
- `npx playwright test --workers=1`

## Results
- 8 tests passed (chromium), including the new medical-record flow:
  - **new** `medical-record.spec.ts`: log in → create a client → open its
    medical record (empty state visible) → fill and save (confirmation shown)
    → go back to the list and reopen (values persisted, no empty state) → edit
    a field and reload (change persisted, still one record).
  - Existing suites (auth, clients, i18n, app-shell) kept passing with the new
    "Ficha médica" action added to the client list.

## Notes / Lessons
- The auth login endpoint is rate-limited (10 attempts / 15 min, in-memory).
  Running the suite with parallel workers (or repeated full runs) exhausted the
  window and caused login failures. Running serially (`--workers=1`) with a
  fresh backend process resolved it. Documented for future E2E runs.

## Test Data Cleanup
- `DELETE FROM "Client";` (cascade removed medical records),
  `ALTER SEQUENCE "Client_id_seq" RESTART WITH 1;`,
  `ALTER SEQUENCE "MedicalRecord_id_seq" RESTART WITH 1;`,
  `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-run counts: Client = 0, MedicalRecord = 0, User = 1.
- Dev servers stopped after the run.

## Outcome
- Step 9 status: PASS
- Blocking issues: none
