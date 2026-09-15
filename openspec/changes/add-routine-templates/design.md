## Context

US-005 is the largest MVP story: a nested aggregate (`RoutineTemplate` →
`RoutineSession` → `RoutineExerciseEntry`) built from catalog exercises
(US-004). It follows the existing DDD layered pattern, but the repository and
service handle a nested payload and a deep-clone. Auth reuses `authMiddleware`
(US-001). This change covers library templates (`clientId = null`); client
assignment is US-006.

## Goals / Non-Goals

**Goals**
- Create/edit/list/read/duplicate reusable library templates with nested
  sessions and exercise entries.
- Atomic update (replace nested data in one transaction).
- Independent deep-clone on duplicate.

**Non-Goals**
- No client assignment / status lifecycle / `sourceTemplateId` population
  (US-006).
- No weekly progression (single kg/reps/series per entry).
- No separate CRUD endpoints for sessions/entries — they are edited as part of
  the template payload.

## Decisions

### Data model
- `RoutineTemplate`: `id`, `name`, `description?`, `objective?`,
  `generalConsiderations?`, `clientId?` (FK → Client, nullable),
  `sourceTemplateId?` (self-FK), `startDate?`, `durationWeeks?`,
  `status` (`RoutineStatus` enum: `draft` | `active` | `expired`, default
  `draft`), `sessions RoutineSession[]`, timestamps.
- `RoutineSession`: `id`, `routineTemplateId` (FK, `onDelete: Cascade`),
  `name`, `warmupPrescription?`, `order Int`, `entries RoutineExerciseEntry[]`.
- `RoutineExerciseEntry`: `id`, `routineSessionId` (FK, `onDelete: Cascade`),
  `exerciseId` (FK → Exercise), `phase` (`RoutinePhase` enum:
  `warmup` | `main`), `block?`, `kg Float?`, `reps Int?`, `series Int?`,
  `notes?`, `order Int`.
- Back-relations: `Client.routines RoutineTemplate[]`,
  `Exercise.routineEntries RoutineExerciseEntry[]`,
  `RoutineTemplate.clones RoutineTemplate[]` (self-relation "TemplateClone").
- Client-instance fields (`clientId`, `sourceTemplateId`, `startDate`,
  `durationWeeks`, non-draft `status`) exist now but are only populated in
  US-006; US-005 creates library templates with `clientId = null`.

### API shape
- `GET /api/routine-templates` → `200 { success, data: TemplateSummary[] }`,
  library only (`clientId = null`). Returns lightweight rows (no deep nesting).
- `GET /api/routine-templates/:id` → `200 { success, data }` full nested
  detail; `404` when not found.
- `POST /api/routine-templates` → `201` with the created nested template;
  `400` on validation error.
- `PUT /api/routine-templates/:id` → `200`; replaces nested sessions/entries;
  `400`/`404`.
- `POST /api/routine-templates/:id/duplicate` → `201` with the new independent
  template; `404` when the source does not exist.
- Router mounted at `/api/routine-templates`, protected by `authMiddleware`.

### Validation
- Zod `routineTemplateSchema`: `name` non-empty; `sessions` array with at least
  one item; each session `name` non-empty, `entries` array (may be empty);
  each entry `exerciseId` positive int, `phase` enum, `kg/reps/series`
  optional non-negative numbers, `order` int. Existence of every referenced
  `exerciseId` is checked in the service against the catalog (unknown →
  validation error). Introduce `RoutineTemplateNotFoundError` (404) and reuse
  `ValidationError` (400).

### Service behavior
- `create(data)`: validate exercise references exist, then create the template
  with nested `sessions`/`entries` in a single transaction (Prisma nested
  create).
- `update(id, data)`: in a transaction — verify the template exists, delete its
  sessions (cascade removes entries), then recreate sessions/entries from the
  payload (full replace, no diffing). Fail the whole transaction on any error.
- `duplicate(id)`: load the source with its nested data, then create a new
  template (`clientId = null`, `sourceTemplateId = null` — an independent
  library copy, not a client instance) deep-copying sessions/entries in a
  transaction.
- `findById(id)`: full nested detail or `RoutineTemplateNotFoundError`.
- `list()`: library templates (`clientId = null`), summary rows.

### Frontend
- `services/routineTemplateService.ts`: `list`, `get`, `create`, `update`,
  `duplicate`.
- `pages/RoutineTemplatesListPage.tsx`: MUI `DataGrid` of library templates
  with "New", "Edit", "Duplicate" actions, `BackButton`.
- `pages/RoutineTemplateBuilderPage.tsx`: create/edit form — template fields +
  a list of sessions; each session has a name, warm-up prescription, and two
  entry lists (warm-up, main). Add/remove sessions; add exercises via a picker;
  set block/kg/reps/series/notes per entry; reorder is out of scope for the MVP
  beyond insertion order.
- `components/ExercisePickerDialog.tsx`: searches the exercise catalog
  (by name, filter by category) and returns the chosen exercise.
- Routes `/routines`, `/routines/new`, `/routines/:id/edit` behind
  `ProtectedRoute` + `AppLayout`; add a "Routines" entry on the dashboard.
- New i18n keys under a `routines` namespace in `es.json`/`en.json`
  (Spanish-first content).

## Risks / Trade-offs

- **Full-replace update**: simpler and consistent (no diff/merge bugs) at the
  cost of regenerating child rows and their ids on every save; acceptable for
  the MVP since sessions/entries have no external references yet.
- **Builder complexity**: the nested builder is the most complex UI so far; kept
  pragmatic (insertion order, no drag-and-drop) to stay within MVP scope.
- **Deep-clone correctness**: covered by an explicit "editing the copy does not
  affect the original" test.

## Migration Plan

- Add the three models + two enums + back-relations, run
  `npx prisma migrate dev --name add-routine-templates`. Additive only.

## Open Questions

- Whether to seed a sample library template. Decision: no seed for the MVP; the
  trainer builds their own (the catalog seed is enough to start).
