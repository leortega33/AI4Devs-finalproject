# Step 6 Report - E2E Testing (Playwright)

- Date: 2026-09-14
- Change: add-app-shell
- Agent: GitHub Copilot

## Environment
- Backend dev server running on `http://localhost:3000` (probed `/api/auth/me`
  → 401 as expected without a session).
- Frontend dev server (Vite) running on `http://localhost:5173`.
- PostgreSQL up via `docker compose` (`gym-postgres`); admin user re-seeded with
  `npx prisma db seed` before the run.
- Browser locale `es-AR` (Playwright config), so the app defaults to Spanish.

## Commands Executed
- `npx playwright test`

## Results
- 7 tests passed (chromium):
  - auth: protected-route redirect, invalid login error, valid login + logout,
    forgot-password confirmation.
  - **new** auth/app-shell: the branded AppBar ("SPORT – FITNESS") is visible on
    authenticated screens, and back navigation from Clients returns to the
    dashboard ("Panel").
  - clients: create / edit / filter / deactivate flow (updated to assert the new
    "Panel" dashboard heading).
  - i18n: default Spanish, switch to English, persist across reload (updated to
    assert the new "Panel" heading; the language switcher and logout are now
    exercised from the AppBar).

## Relocated-controls coverage
- Language switcher and logout are now asserted from the shared AppBar via the
  i18n and auth E2E specs.
- Back navigation is covered by the new app-shell test.

## Test Data Cleanup
- `DELETE FROM "Client";` (removed E2E-created rows) and
  `ALTER SEQUENCE "Client_id_seq" RESTART WITH 1;`.
- `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`
  to clear the forgot-password token generated during the run.
- Dev servers stopped after the run.

## Outcome
- Step 6 status: PASS
- Blocking issues: none
