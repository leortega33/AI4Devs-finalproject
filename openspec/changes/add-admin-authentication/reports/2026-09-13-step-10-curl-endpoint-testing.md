# Step 10 Report - Manual Endpoint Testing with curl

- Date: 2026-09-13
- Change: add-admin-authentication
- Agent: GitHub Copilot

## Environment
- Backend server running on `http://localhost:3000` (`npm run dev`)
- Dockerized PostgreSQL (`gym-postgres`) running
- Pre-test `User` table row count: 1 (seeded admin `admin@example.com`)

## Tests Executed

### POST /api/auth/login
- **Valid credentials** (`admin@example.com` / `ChangeMe123!`): `200 OK`,
  `Set-Cookie: session=<jwt>; HttpOnly; SameSite=Strict; Max-Age=2592000`,
  body `{ success: true, data: { id, email } }`.
- **Invalid password**: `401` `{ success:false, error.code: INVALID_CREDENTIALS }`.

### GET /api/auth/me
- **With valid session cookie**: `200` `{ success:true, data:{ id:1 } }`.
- **Without cookie**: `401`.

### POST /api/auth/logout
- Returns `204`; a subsequent `/me` call with the cleared cookie returns `401`.

### POST /api/auth/forgot-password
- **Matching email** (`admin@example.com`): `200`, generic message, reset link
  logged by the dev email service.
- **Non-matching email** (`nobody@example.com`): `200`, **identical** generic
  message, no email logged. Confirms account existence is not revealed.

### POST /api/auth/reset-password
- **Invalid token**: `400` `{ error.code: INVALID_RESET_TOKEN }`.
- **Valid token** (captured from the dev email log): `200`, password updated
  (verified by logging in with the new password → `200`).
- **Reusing the same (now consumed) token**: `400`. Confirms single-use.

### Validation error cases
- Missing `password` field: `400` `{ error.code: VALIDATION_ERROR, message: "Required" }`.
- Malformed email: `400` `{ error.code: VALIDATION_ERROR, message: "Invalid email" }`.

## Database State Restoration
- The reset-password test changed the admin password to a temporary value.
- Ran `npx prisma db seed` to restore the original password
  (`ChangeMe123!`); verified login with the original password returns `200`.
- Post-test `User` table row count: 1 (matches the pre-test baseline).

## Outcome
- Step 10 status: PASS
- Blocking issues: none
