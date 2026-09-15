## Why

This is the core automation piece of the MVP. Today the trainer rebuilds a
routine from scratch for every client. Reusable routine templates — composed of
sessions and structured warm-up/main exercises from the catalog (US-004) — let
the trainer build once and duplicate. It is the prerequisite for assigning
routines to clients (US-006).

## What Changes

- Add three nested entities: `RoutineTemplate` → `RoutineSession` →
  `RoutineExerciseEntry`.
- A **library template** (`clientId = null`) has a name, optional
  description/objective/general considerations, and one or more sessions.
- Each session has a name, an optional free-text warm-up prescription, an
  order, and a list of exercise entries.
- Each entry references a catalog `Exercise`, a `phase` (`warmup` | `main`),
  an optional block/superset label (main phase), single-value kg/reps/series
  (no weekly progression in the MVP), optional notes, and an order.
- Endpoints to list, read (full nested detail), create (nested payload),
  update (replace nested sessions/entries in a single transaction), and
  **duplicate** (independent deep clone).
- A routine builder UI: create/edit a template with multiple sessions, adding
  warm-up and main exercises picked from the catalog.
- All endpoints protected by the existing auth middleware (US-001).

## Capabilities

### New Capabilities
- `routine-templates`: create/edit/list/duplicate reusable routine templates
  composed of nested sessions and catalog-based exercise entries.

### Modified Capabilities
<!-- None. Reuses the auth middleware (US-001) and the Exercise catalog
     (US-004) without changing their requirements. -->

## Impact

- New `RoutineTemplate`, `RoutineSession`, `RoutineExerciseEntry` tables +
  `RoutineStatus` and `RoutinePhase` enums via a Prisma migration (models
  already described in `docs/data-model.md` entities #5-#7). Back-relations
  added to `Client` (nullable) and `Exercise`.
- New `/api/routine-templates` endpoints (GET list, GET :id, POST, PUT,
  POST :id/duplicate), all behind `authMiddleware`.
- Updating a template replaces its full session/entry list inside a single DB
  transaction (delete + recreate) to avoid partial/inconsistent state.
- New frontend list + builder pages, an exercise-picker dialog, a service, and
  routing, behind `ProtectedRoute`; a navigation entry from the dashboard.
- `docs/api-spec.yml` gains the routine-template endpoints; `docs/data-model.md`
  already defines the entities (verify/adjust during implementation).

## Scope Notes

- This change covers **library templates only** (`clientId = null`). Assigning a
  routine to a client (client instances, `sourceTemplateId`, status lifecycle)
  is US-006. The schema includes the client-instance fields now, but the US-005
  API only creates/edits library templates.
