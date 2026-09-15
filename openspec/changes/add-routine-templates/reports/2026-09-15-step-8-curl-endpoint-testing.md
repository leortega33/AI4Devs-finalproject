# Step 8 Report - Manual Endpoint Testing (curl)

- Date: 2026-09-15
- Change: add-routine-templates
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, PostgreSQL up via `docker compose`.
- Catalog seeded (11 exercises); session cookie obtained via login.
- Two throwaway templates were created during testing and deleted afterward.
- Exercise ids used: 1 (`Movilidad de cadera`, warm-up), 7 (`Sentadilla`, main).

## Pre-Test Baseline
RoutineTemplate = 0, RoutineSession = 0, RoutineExerciseEntry = 0, Exercise = 11.

## Commands and Results

### Login
`POST /api/auth/login` → **200**.

### Create (nested)
`POST /api/routine-templates` with a template "Hipertrofia Nivel 1" + 1 session
("Sesión A", warm-up prescription) + 1 warm-up entry (ex 1) + 1 main entry
(ex 7, block "Bloque 1", kg 60, reps 8, series 4) → **201**, id = 1.

### Read
- `GET /api/routine-templates` → **200**, one summary row
  (`sessionCount: 1`).
- `GET /api/routine-templates/1` → **200**, full nested detail with sessions
  and ordered entries; each entry includes the resolved `exerciseName`
  ("Movilidad de cadera", "Sentadilla").

### Validation errors
- `POST` with `sessions: []` → **400** ("At least one session is required").
- `POST` with an entry `exerciseId: 99999` → **400**
  ("Exercise 99999 does not exist").

### Update (full replace)
- `PUT /api/routine-templates/1` replacing the sessions with a single
  "Sesión Única" (one main entry, reps 10) → **200**.
- `GET` after the update → sessions: 1, name: "Sesión Única", reps: 10 —
  confirming the nested data was fully replaced.
- `PUT /api/routine-templates/99999` → **404**.

### Duplicate (deep-clone independence)
- `POST /api/routine-templates/1/duplicate` → **201**, id = 2, name
  "Hipertrofia Nivel 1 (copia)".
- Edited the **copy** (`PUT` id 2 → name "Copia Editada", reps 99) → **200**.
- Re-read the **original** (id 1) → name still "Hipertrofia Nivel 1", reps still
  10 — **deep-clone independence confirmed** (editing the copy did not affect
  the original).
- `POST /api/routine-templates/99999/duplicate` → **404**.

### Auth protection
- `GET /api/routine-templates` without cookie → **401**.

## Database Restoration
- `DELETE FROM "RoutineTemplate";` (cascade removed sessions and entries),
  sequences reset for `RoutineTemplate`/`RoutineSession`/`RoutineExerciseEntry`,
  `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-restore counts: RoutineTemplate = 0, RoutineSession = 0,
  RoutineExerciseEntry = 0, Exercise = 11 — matches the baseline.

## Outcome
- Step 8 status: PASS
- Blocking issues: none
