# Step 8 Report - Manual Endpoint Testing with curl

- Date: 2026-09-13
- Change: add-client-management
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, Dockerized PostgreSQL running.
- Pre-test baseline: `Client` = 0 rows.
- Authenticated with the seeded admin to obtain a session cookie.

## Tests Executed

### Auth protection
- `GET /api/clients` without a session cookie → **401**.

### GET /api/clients
- Empty list → `200 { success:true, data:[] }`.
- With `?search=ana&status=active` → `200`, returns only the matching active client.

### POST /api/clients
- Valid body → **201**, returns the created client (status `active`, id 1).
- Same DNI again → **409** (duplicate DNI).

### GET /api/clients/:id
- Existing (id 1) → **200**.
- Missing (id 999) → **404**.

### PUT /api/clients/:id
- Valid update → **200**.
- Invalid body (bad DNI/email/phone) → **400**.

### PATCH /api/clients/:id/status
- Deactivate (`{status:'inactive'}`) → **200**, client status becomes `inactive`.
- Reactivate (`{status:'active'}`) → **200**.

## Database State Restoration
- The tests created one client (id 1). Since the API exposes no DELETE (logical
  deactivation only, by design), the test client was removed directly in the DB
  and the id sequence reset.
- Post-test `Client` row count: 0 (matches the pre-test baseline).

## Outcome
- Step 8 status: PASS
- Blocking issues: none
