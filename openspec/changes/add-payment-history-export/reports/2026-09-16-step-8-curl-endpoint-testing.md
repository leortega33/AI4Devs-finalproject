# Step 8 Report - Manual Endpoint Testing with curl

- Date: 2026-09-16
- Change: add-payment-history-export
- Agent: GitHub Copilot (backend-developer)

## Environment

- Backend: `npm run dev` on `http://localhost:3000` (restarted to reset the login rate limiter).
- Database: Dockerized PostgreSQL (`gym-postgres`).
- Admin: `admin@example.com`.
- Pre-test baseline: `Payment=2`, `Client=1`, `Exercise=11`.

## Commands & Responses

### Login
```
curl -s -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'
```
→ **200**, session cookie stored.

### Create throwaway client with payments
```
POST /api/clients            → 201 (clientId=2, "Export Tester")
POST /api/clients/2/payments (Aug 2026, cash, 5000)  → 201
POST /api/clients/2/payments (Sep 2026, card, 6000)  → 201
```

### Export (Spanish, default)
```
curl -s -b cookies.txt "http://localhost:3000/api/clients/2/payments/export" -D - -o hist.pdf
```
→ **200**, `Content-Type: application/pdf`,
`Content-Disposition: attachment; filename="payment-history-2.pdf"`.
`file hist.pdf` → `PDF document, version 1.3, 1 pages`; first bytes `%PDF-`.

### Export (English)
```
curl -s -b cookies.txt "http://localhost:3000/api/clients/2/payments/export?lang=en" -o hist_en.pdf
```
→ **200**, size 1656 bytes, first bytes `%PDF-`.

### Export for a client with no payments
```
POST /api/clients (clientId=3, "Empty Payer") → 201
curl -s -b cookies.txt "http://localhost:3000/api/clients/3/payments/export" -o hist_empty.pdf
```
→ **200**, size 1673 bytes, first bytes `%PDF-` (valid PDF, empty history).

### Export for an unknown client
```
curl -s -b cookies.txt "http://localhost:3000/api/clients/999999/payments/export"
```
→ **404**.

### Export without a session cookie
```
curl -s "http://localhost:3000/api/clients/2/payments/export"
```
→ **401**.

## Cleanup / Database Restoration

```
DELETE FROM "Payment" WHERE "clientId" IN (2,3);  -- DELETE 2
DELETE FROM "Client"  WHERE id IN (2,3);           -- DELETE 2
UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL
  WHERE "passwordResetTokenHash" IS NOT NULL;      -- UPDATE 0
```

- Post-test counts: `Payment=2`, `Client=1`, `Exercise=11` — matches the baseline.

## Outcome

- Step 8 status: PASS
- All status codes and content types as expected (200 `application/pdf` for
  populated/empty/`en`, 404 unknown client, 401 unauthenticated).
- Blocking issues: none.
