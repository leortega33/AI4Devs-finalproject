# Step 8 Report - Manual Endpoint Testing (curl)

- Date: 2026-09-16
- Change: add-payment-registration
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, PostgreSQL up via `docker compose`.
- Session cookie obtained via login. A throwaway client ("Pago Cliente",
  dni 33445566) was created for the tests and deleted afterward.
- Current date is 2026-09-16 (relevant to the derived status).

## Pre-Test Baseline
Payment = 0, Client = 1 (a pre-existing manual test client, kept).

## Commands and Results

### Login → 200. Setup: create client (id 2).

### Register + derived status
- `GET /api/clients/2/payments` before any payment → `{ payments: [], status: "no_payments" }` (200).
- `POST /api/clients/2/payments` `{ amount 5000, date 2026-09-05, cash, period 9/2026 }`
  → **201**, id 1.
- `GET` after → 1 payment, status **`up_to_date`** (covers the current month),
  amount 5000.

### Edit recomputes status
- `PUT /api/payments/1` changing the period to 1/2026 (amount 6000, card)
  → **200**.
- `GET` after → status **`overdue`** (today is past the end of Jan 2026),
  amount 6000, method card — confirming the status recomputes after an edit.

### Client list indicator
- `GET /api/clients` → "Pago" `paymentStatus: overdue`, "Leonel"
  `paymentStatus: no_payments`.

### Error cases
- `POST` with `amount: 0` → **400**.
- `POST` for an unknown client (99999) → **404**.
- `PUT /api/payments/99999` → **404**.

### Delete recomputes status
- `DELETE /api/payments/1` → **204**; `GET` after → status **`no_payments`**.
- `DELETE /api/payments/99999` → **404**.

### Auth protection
- `GET /api/clients/2/payments` without cookie → **401**.

## Database Restoration
- `DELETE FROM "Client" WHERE dni = '33445566';` (cascade removed its payments),
  `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-restore counts: Payment = 0, Client = 1 — matches the baseline.

## Outcome
- Step 8 status: PASS
- Blocking issues: none
