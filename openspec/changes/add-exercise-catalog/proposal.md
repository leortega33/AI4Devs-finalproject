## Why

The trainer builds routines from the same exercises over and over. A reusable
exercise catalog removes repetitive retyping and is the prerequisite for the
routine builder (US-005), which composes routines from catalog exercises and
filters them by category (warm-up vs main). This capability comes right after
client management and medical records, before routines.

## What Changes

- Add an `Exercise` entity: name, muscle group, category
  (`mobility` | `activation` | `main`), optional default sets/reps, technique,
  and equipment.
- Create and edit exercises; **no hard delete** (no `DELETE` route) so routines
  that reference an exercise are never broken.
- List exercises with search by name and filter by category.
- Seed a base set of common exercises on first run (covering all three
  categories).
- All endpoints protected by the existing auth middleware (US-001).

## Capabilities

### New Capabilities
- `exercise-catalog`: create/edit and list/search/filter a reusable catalog of
  exercises (no deletion).

### Modified Capabilities
<!-- None. Reuses the auth middleware from admin-authentication without
     changing its requirements. -->

## Impact

- New `Exercise` table + `ExerciseCategory` enum via a Prisma migration (model
  already described in `docs/data-model.md` entity #4).
- New `/api/exercises` endpoints (GET list, GET by id, POST, PUT), all behind
  the existing `authMiddleware`. No `DELETE`.
- `prisma/seed.ts` extended to idempotently seed a base exercise catalog.
- New frontend catalog and exercise-form pages, plus a service and routing,
  behind `ProtectedRoute`; a navigation entry from the dashboard.
- `docs/api-spec.yml` gains the exercise endpoints; `docs/data-model.md`
  already defines `Exercise` (verify/adjust during implementation).
