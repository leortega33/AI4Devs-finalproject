# Step 8 Report - Manual Endpoint Testing (curl)

- Date: 2026-09-14
- Change: add-medical-record
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, PostgreSQL up via `docker compose`.
- Admin re-seeded (`npx prisma db seed`); session cookie obtained via login.
- A throwaway client (`dni 55667788`, id 1) was created for the medical-record
  tests and deleted afterward.

## Pre-Test Baseline
Client = 0, MedicalRecord = 0, User = 1.

## Commands and Results

### Login
`POST /api/auth/login` → **200** (session cookie stored).

### Create throwaway client
`POST /api/clients` (Med Tester, dni 55667788) → **201**, id = 1.

### GET before any record exists
`GET /api/clients/1/medical-record` →
`{"success":true,"data":null}` — **200** (null is not an error).

### PUT create
`PUT /api/clients/1/medical-record` `{"preexistingConditions":"Asthma","bloodType":"O+"}`
→ **200**, returns the created record (id 1, clientId 1).

### GET after create
`GET /api/clients/1/medical-record` → **200**, returns the same record.

### PUT update (upsert keeps one record)
`PUT /api/clients/1/medical-record` `{"preexistingConditions":"Asthma, controlled","bloodType":"A-","notes":"Updated"}`
→ **200**, same `id` (1), updated values and a newer `updatedAt` — confirming
the client still has exactly one record.

### Error cases
- `GET /api/clients/99999/medical-record` → **404** `NOT_FOUND` (missing client).
- `PUT /api/clients/99999/medical-record` → **404** `NOT_FOUND` (missing client).
- `PUT /api/clients/1/medical-record` with a 1001-char `injuries` → **400**
  `VALIDATION_ERROR` ("Field must be 1000 characters or fewer").

### Auth protection
- `GET` without cookie → **401** `UNAUTHENTICATED`.
- `PUT` without cookie → **401** `UNAUTHENTICATED`.

## Database Restoration
- `DELETE FROM "Client";` (cascade removed the medical record),
  `ALTER SEQUENCE "Client_id_seq" RESTART WITH 1;`,
  `ALTER SEQUENCE "MedicalRecord_id_seq" RESTART WITH 1;`,
  `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-restore counts: Client = 0, MedicalRecord = 0, User = 1 — matches the
  baseline.

## Outcome
- Step 8 status: PASS
- Blocking issues: none
