# Step 8 Report - Manual Endpoint Testing with curl

- Date: 2026-09-16
- Change: add-dashboard-alerts
- Agent: GitHub Copilot (backend-developer)

## Environment

- Backend: `RATE_LIMIT_DISABLED=true DASHBOARD_DUE_SOON_DAYS=20 npm run dev` on
  `http://localhost:3000`. The threshold was raised to 20 days for this manual
  run so the "due soon" group is reachable on the test date (2026-09-16): with
  monthly periods and the default 5-day window, a September payment (covered
  month ends 2026-09-30) cannot fall due-soon mid-month. The classification
  logic itself is threshold-driven and fully covered by unit tests with the
  default 5.
- Database: Dockerized PostgreSQL (`gym-postgres`).
- Pre-test baseline: `Client=0`, `Payment=0`, `Exercise=11`.

## Commands & Responses

### Login
→ **200**, session cookie stored.

### Throwaway clients (one per case)
```
Overdue Client  (id 25) + payment Jul 2026            -> overdue
DueSoon Client  (id 26) + payment Sep 2026            -> due soon (within 20d)
NoPay Client    (id 27) + no payment                  -> no payments
Routine Client  (id 28) + payment Sep 2026            -> due soon
                        + active routine Aug 1 / 4wk  -> expired routine
NoAlert Client  (id 29) + payment Oct 2026 (future)   -> no alert
```
The expired active routine was inserted directly in the DB for the routine
client (`INSERT INTO "RoutineTemplate" ... status='active' startDate='2026-08-01'
durationWeeks=4`), since assigning through the UI/API requires a full template.

### `GET /api/dashboard`
```
curl -s -b dcookies.txt http://localhost:3000/api/dashboard
```
→ **200**. Groups:
```
overduePayments:  ['Overdue Client']
paymentsDueSoon:  ['DueSoon Client', 'Routine Client']
noPayments:       ['NoPay Client']
expiringRoutines: ['Routine Client']
```
- Overdue Client → overdue group. ✓
- DueSoon Client and Routine Client → due-soon group. ✓
- NoPay Client → no-payments group (not overdue). ✓
- Routine Client → expiring-routines group (expired), and also correctly in
  due-soon for its payment. ✓
- NoAlert Client (future payment, no routine) → absent from all groups. ✓

### Unauthenticated
```
curl -s http://localhost:3000/api/dashboard   (no cookie)
```
→ **401**.

## Cleanup / Database Restoration

```
DELETE FROM "Payment" WHERE "clientId" IN (25,26,27,28,29);           -- DELETE 4
DELETE FROM "RoutineTemplate" WHERE "clientId" IN (25,26,27,28,29);   -- DELETE 1
DELETE FROM "Client" WHERE id IN (25,26,27,28,29);                    -- DELETE 5
UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;   -- UPDATE 1
```
- Post-test counts: `Client=0`, `Payment=0`, `RoutineTemplate=0`, `Exercise=11`
  — matches the baseline.

## Outcome

- Step 8 status: PASS
- Every client landed in the correct group(s); no-alert client omitted; 401 when
  unauthenticated.
- Blocking issues: none.
