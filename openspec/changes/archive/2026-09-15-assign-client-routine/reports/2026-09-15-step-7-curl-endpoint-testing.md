# Step 7 Report - Manual Endpoint Testing (curl)

- Date: 2026-09-15
- Change: assign-client-routine
- Agent: GitHub Copilot

## Environment
- Backend on `http://localhost:3000`, PostgreSQL up via `docker compose`.
- Catalog seeded (11 exercises). Throwaway data created: 2 clients
  ("Rut Cliente" id 1, "Sin Rutina" id 2) and a library template
  ("Plantilla Base" id 3, main entry on exercise 7 / Sentadilla).

## Pre-Test Baseline
RoutineTemplate = 0, Client = 0, Exercise = 11 (after cleaning residual dev
templates).

## Commands and Results

### Login → 200. Setup: create client (id 1) and template (id 3).

### Assign + read active
- `GET /api/clients/1/routine` before assign → `{ data: null }` (200).
- `POST /api/clients/1/routine` `{ templateId: 3, startDate: 2026-02-01, durationWeeks: 4 }`
  → **201**: routineId 4, clientId 1, status `active`, computed
  `endDate 2026-03-01`, `isExpired true` (current date is past the end date).
- `GET /api/clients/1/routine` → **200**, nested detail (name "Plantilla Base",
  session "Sesión A", exercise "Sentadilla").

### Single active invariant + history
- `POST` a second routine `{ templateId: 3, startDate: 2026-03-01, durationWeeks: 6 }`
  → **201**.
- `GET /api/clients/1/routines/history` → **200**, 1 item, status `expired`.
- DB check: exactly **1** active routine for the client.

### Adjust (independent from the source template)
- `PUT /api/clients/1/routine` replacing the session ("Sesión Ajustada",
  reps 12) → **200**.
- `GET` active → session "Sesión Ajustada", reps 12.
- `GET /api/routine-templates/3` (source template) → session "Sesión A",
  reps 8 — **unchanged**, confirming the assigned routine is an independent
  clone.

### Error cases
- Assign to unknown client (99999) → **404**.
- Assign an unknown template (99999) → **404**.
- Assign with missing fields (`{ templateId: 3 }`) → **400**.
- Adjust a client with no active routine (id 2) → **404**.
- `GET` active for an unknown client → **404**.

### Auth protection
- `GET /api/clients/1/routine` without cookie → **401**.

### Client list indicator
- `GET /api/clients` → "Rut Cliente" `hasActiveRoutine: true`, "Sin Rutina"
  `hasActiveRoutine: false`.

## Database Restoration
- `DELETE FROM "RoutineTemplate";`, `DELETE FROM "Client";`, sequences reset,
  `UPDATE "User" SET "passwordResetTokenHash"=NULL, "passwordResetExpiresAt"=NULL;`.
- Post-restore counts: RoutineTemplate = 0, Client = 0, Exercise = 11.

## Outcome
- Step 7 status: PASS
- Blocking issues: none
