# Step 9 Report - E2E Testing with Playwright

- Date: 2026-09-16
- Change: add-dashboard-alerts
- Agent: GitHub Copilot (frontend-developer)

## Environment

- Backend (`RATE_LIMIT_DISABLED=true npm run dev`, default `DASHBOARD_DUE_SOON_DAYS=5`)
  + frontend (`npm run dev`) + Dockerized PostgreSQL.
- Runner: Playwright, `--workers=1` (serial). With `RATE_LIMIT_DISABLED=true`
  (added on `chore/configurable-login-rate-limit`), the whole suite now runs in a
  single pass without hitting the login rate limiter.

## New test added

`e2e/dashboard.spec.ts` → **"shows an overdue client and links to their payments"**:
logs in and lands on the dashboard (heading "Panel", four alert groups visible),
creates a client, registers a clearly past-period payment (01/2020 → overdue),
returns to the dashboard, verifies the client appears as a link in the overdue
group, and clicks it to confirm it navigates to that client's payments page.

## Test harness change

`e2e/auth.spec.ts` "valid login lands on the protected dashboard" previously
asserted the old placeholder text ("Sesión iniciada como ..."), which the real
dashboard (US-009) no longer shows. Updated it to assert the "Panel" heading
instead — a behavior-preserving fix for the landing-page replacement.

## Results (single pass, clean DB, backend restarted)

```
14 passed (20.1s)
  ✓ auth (5)  ✓ client-routine  ✓ clients  ✓ exercises  ✓ i18n
  ✓ medical-record  ✓ payments (2)  ✓ routines  ✓ dashboard
```

Total: **14/14 E2E tests passed** (13 previous + the new dashboard spec).

## Data Restoration

E2E runs create clients, payments, exercises (catalog test), and library routine
templates (routines test) that persist. Cleaned directly in the DB after the run:

```
DELETE FROM "Payment";
DELETE FROM "Client";
DELETE FROM "RoutineTemplate";
DELETE FROM "Exercise" WHERE name LIKE 'E2E Exercise%';
UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;
```

Final state (seeded-clean): `Client=0`, `Payment=0`, `Exercise=11`,
`RoutineTemplate=0`.

## Outcome

- Step 9 status: PASS
- Blocking issues: none.
