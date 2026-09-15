# Step 8 Report - Manual Endpoint Testing (curl)

- Date: 2026-09-15
- Change: add-exercise-catalog
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, PostgreSQL up via `docker compose`.
- Base catalog seeded (11 exercises); session cookie obtained via login.
- A throwaway exercise ("Curl test lunge", id 12) was created for the tests and
  deleted afterward.

## Pre-Test Baseline
Exercise = 11 (seeded base), Client = 1, User = 1.

## Commands and Results

### Login
`POST /api/auth/login` → **200** (session cookie stored).

### List (all / search / category)
- `GET /api/exercises` → **200**, 11 exercises (e.g. Back squat, Band lateral
  walk, Bench press).
- `GET /api/exercises?search=squat` → **200**, `["Back squat"]`.
- `GET /api/exercises?category=mobility` → **200**, 3 exercises, all category
  `mobility`.

### Create
- `POST /api/exercises` `{"name":"Curl test lunge","muscleGroup":"Legs","category":"main","defaultSets":3,"defaultReps":12}`
  → **201**, id = 12.
- `POST` with `category:"cardio"` → **400** `VALIDATION_ERROR`
  ("Invalid enum value...").

### Read by id
- `GET /api/exercises/12` → **200**.
- `GET /api/exercises/99999` → **404** `NOT_FOUND` ("Exercise not found").

### Update
- `PUT /api/exercises/12` (valid) → **200** (defaultReps updated).
- `PUT /api/exercises/12` with `category:"cardio"` → **400** `VALIDATION_ERROR`.
- `PUT /api/exercises/99999` → **404** `NOT_FOUND`.

### Auth protection
- `GET /api/exercises` without cookie → **401**.
- `POST /api/exercises` without cookie → **401**.

### No delete
- No `DELETE /api/exercises/:id` route exists (not exposed by the router).

## Database Restoration
- `DELETE FROM "Exercise" WHERE id = 12;` (removed the throwaway exercise),
  `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-restore count: Exercise = 11 (base catalog intact) — matches the
  baseline.

## Outcome
- Step 8 status: PASS
- Blocking issues: none
