## Context

US-004 adds a reusable exercise catalog, following the same DDD layered pattern
already used for clients and medical records (domain model → repository
interface → Prisma repository → service → controller → routes) and the existing
frontend service + MUI `DataGrid`/form pattern. Auth reuses the `authMiddleware`
from US-001. The catalog is the prerequisite for the routine builder (US-005).

## Goals / Non-Goals

**Goals**
- Create/edit exercises and list them with search + category filter.
- Pre-seed a base catalog covering all three categories.
- Never delete exercises (protect future routine references).

**Non-Goals**
- No hard delete / no `DELETE` route.
- No archive/active flag in the MVP (edit-only is enough; can be added later if
  hiding an exercise becomes necessary).
- No exercise images/media in the MVP.

## Decisions

### Data model
- `Exercise` model: `id`, `name`, `muscleGroup`, `category`
  (`ExerciseCategory` enum: `mobility` | `activation` | `main`),
  `defaultSets Int?`, `defaultReps Int?`, `technique String?`,
  `equipment String?`, `createdAt`, `updatedAt`.
- Required: `name`, `muscleGroup`, `category`. The rest are optional.

### API shape
- `GET /api/exercises` → `200 { success, data: Exercise[] }`; query params
  `category` (enum) and `search` (name fragment, case-insensitive).
- `GET /api/exercises/:id` → `200 { success, data }`; `404` when not found.
- `POST /api/exercises` → `201 { success, data }`; `400` on validation error.
- `PUT /api/exercises/:id` → `200 { success, data }`; `400`/`404`.
- No `DELETE` route. Router mounted at `/api/exercises`, protected by
  `authMiddleware`, consistent with the client routes.

### Validation
- Zod `exerciseSchema`: `name` non-empty, `muscleGroup` non-empty, `category`
  enum; `defaultSets`/`defaultReps` optional non-negative integers;
  `technique`/`equipment` optional strings.
- Introduce a domain error `ExerciseNotFoundError` (mapped to 404 by the error
  handler, mirroring `ClientNotFoundError`).

### Service behavior
- `exerciseService`: `create`, `findById` (throws `ExerciseNotFoundError`),
  `list({ search, category })`, `update` (throws `ExerciseNotFoundError`).

### Seeding
- Extend `prisma/seed.ts` to upsert a base set of ~9-12 exercises across the
  three categories (e.g. mobility: hip/shoulder mobility drills; activation:
  glute bridge, band walks; main: squat, deadlift, bench press, row, overhead
  press). Idempotent via a stable unique key. Since `name` is not unique in the
  schema, seed idempotently by checking existence per name (find-or-create) to
  avoid duplicates on re-seed without adding a DB constraint.

### Frontend
- `services/exerciseService.ts`: `list`, `get`, `create`, `update`.
- `pages/ExerciseCatalogPage.tsx`: MUI `DataGrid` with name search + category
  filter, "New exercise" and per-row "Edit"; `BackButton` to the dashboard.
- `pages/ExerciseFormPage.tsx`: shared create/edit form (category select,
  optional numeric/text fields) with validation matching the backend.
- Routes `/exercises`, `/exercises/new`, `/exercises/:id/edit` behind
  `ProtectedRoute` + `AppLayout`; add an "Exercises" entry on the dashboard.
- New i18n keys under an `exercises` namespace in `es.json`/`en.json`.

## Risks / Trade-offs

- **Seed idempotency without a unique constraint**: using find-or-create by
  name keeps the schema simple but is not race-safe; acceptable for a
  single-run seed script.
- **No delete**: intentional; if the trainer needs to retire an exercise, a
  future archive flag can be added.

## Migration Plan

- Add the `Exercise` model + `ExerciseCategory` enum, run
  `npx prisma migrate dev --name add-exercise`. Additive only.

## Open Questions

- Final base seed list is finalized during implementation (see Decisions).
