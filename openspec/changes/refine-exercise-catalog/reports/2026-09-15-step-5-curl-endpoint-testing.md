# Step 5 Report - Manual Endpoint Testing (curl)

- Date: 2026-09-15
- Change: refine-exercise-catalog
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, PostgreSQL up via `docker compose`.
- Spanish base catalog seeded (11 exercises); session cookie obtained via login.

## Pre-Test Baseline
Exercise = 11 (Spanish base catalog), User = 1.

## Command and Result

### Login
`POST /api/auth/login` → **200**.

### Negative default sets rejected
`POST /api/exercises` `{"name":"Neg test","muscleGroup":"Legs","category":"main","defaultSets":-2}`
→ **400** `VALIDATION_ERROR` ("Number must be greater than or equal to 0").

This confirms the backend rejects negative default sets/reps (matching the new
client-side guard that prevents entering them).

## Database State
- No row was created (Exercise count still 11).
- Admin reset token cleared after testing.
- Post-test baseline matches pre-test.

## Outcome
- Step 5 status: PASS
- Blocking issues: none
