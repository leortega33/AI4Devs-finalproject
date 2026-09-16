# Step 9 Report - E2E Testing with Playwright

- Date: 2026-09-16
- Change: add-payment-history-export
- Agent: GitHub Copilot (frontend-developer)

## Environment

- Backend (`npm run dev`, port 3000) + frontend (`npm run dev`, port 5173) + Dockerized PostgreSQL.
- Runner: Playwright, `--workers=1` (serial).
- Login rate limiter: 10 attempts / 15 min (in-memory). The full suite has 13
  tests (one login each), which exceeds the limit in a single pass, so the suite
  was run in two batches with a backend restart and a clean DB (`DELETE FROM
  "Payment"; DELETE FROM "Client";`) between batches.

## New test added

`e2e/payments.spec.ts` → **"export the payment history as a PDF"**: logs in,
creates a dedicated client, registers a payment, clicks **"Exportar PDF"**, and
asserts a download is triggered whose suggested filename ends in `.pdf` and whose
file is non-empty (`fs.statSync(path).size > 0`).

## Results

### Batch 1 (auth, clients, exercises, client-routine) — clean DB, backend restarted
```
8 passed (10.2s)
```

### Batch 2 (i18n, medical-record, payments, routines) — clean DB, backend restarted
```
5 passed (7.8s)
  ✓ payments › register, list, and reflect the payment status
  ✓ payments › export the payment history as a PDF
  ✓ routines › build, list, edit and duplicate a routine template
  ...
```

Total: **13/13 E2E tests passed** across the two batches.

### Note on the initial single-pass run

A first attempt to run the whole suite in one pass produced 3 failures, all at
the login step (`getByRole('heading', { name: 'Panel' })` timeout) and one
duplicate-row lookup. Root causes were environmental, **not** regressions:
(1) the login rate limiter (13 logins > 10 in one window) and (2) leftover E2E
clients from previous runs creating duplicate rows. Re-running from a clean DB in
batches under the login limit passed everything, including the new export test.

## Data Restoration

E2E runs create clients, payments, exercises (catalog test), and library routine
templates (routines test) that persist (exercises/templates have no hard delete
via the UI). Cleaned directly in the DB after the run:

```
DELETE FROM "Payment";                             -- E2E payments
DELETE FROM "Client";                              -- E2E clients
DELETE FROM "RoutineTemplate";                     -- E2E library templates (cascade sessions/entries)
DELETE FROM "Exercise" WHERE name LIKE 'E2E Exercise%';  -- E2E-created exercises
UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;
```

Final state (seeded-clean): `Payment=0`, `Client=0`, `Exercise=11`,
`RoutineTemplate=0`.

## Outcome

- Step 9 status: PASS
- Blocking issues: none (failures in the single-pass attempt were the known
  rate-limit + data-leakage test-harness artifacts, resolved by batching).
