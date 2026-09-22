## Context

See proposal.md — Why. The app already has two relevant precedents: the
medical-record **history as immutable full snapshots** (US-021,
`MedicalRecordVersion`) and the routine **nested structure** (template → sessions
→ exercises, US-005). Nutrition combines both: a nested plan (plan → meals →
items) that must be versioned on each save. Client-scoped resources follow an
established pattern — domain model → repository interface + Prisma impl →
application service (ensures the client exists via `ClientNotFoundError` → 404) →
zod validator → controller → nested router `/api/clients/:clientId/...` wired in
`index.ts`. Auth is enforced by middleware on every router.

## Goals / Non-Goals

**Goals:**
- One plan per client, edited as a whole (upsert) with meals + food items.
- Optional plan-level daily targets; every save appends a version snapshot.
- Reuse the existing client-scoped + history conventions.

**Non-Goals:**
- No per-food-item macros and no food database (only free-text description +
  optional quantity).
- No reusable templates (US-027b) and no per-field diffing of versions.
- No delete endpoint (the plan lives with the client; an empty save clears it).

## Decisions

### Whole-plan upsert in a transaction (replace children)
`PUT /api/clients/:clientId/nutrition-plan` accepts the entire plan (targets +
note + ordered meals, each with ordered food items). The service runs a single
`prisma.$transaction`: upsert the `NutritionPlan` scalars, delete its existing
meals (cascade removes their food items), recreate the submitted meals and items
with their array index as `order`, and append a `NutritionPlanVersion` snapshot.
- **Why:** a nutrition plan is edited as one document; replace-children keeps the
  server simple and the order authoritative, and one transaction keeps the plan,
  its children, and the version consistent.
- **Alternative (rejected):** per-meal/per-item CRUD endpoints — far more surface
  for a small single-trainer editor and harder to version atomically.

### Version history as a JSON snapshot (not normalized)
Each save writes a `NutritionPlanVersion { clientId, snapshot: Json, createdAt }`
where `snapshot` is the full saved plan (targets, note, meals, items). History is
read newest-first.
- **Why:** the plan is a nested structure; a JSON snapshot captures it in one row
  without duplicating the meal/item tables per version. This mirrors the
  medical-record "full snapshot" principle adapted to nested data.
- **Alternative (rejected):** versioned copies of the normalized tables — heavier
  schema and joins for read-only history.

### Absent plan returns an empty payload, not 404
`GET` returns `{ dailyCalories: null, proteinTargetG: null, generalNotes: null,
meals: [] }` when the client has no plan, so the editor opens ready to fill in.
A non-existent **client** still returns 404 (via `ClientNotFoundError`).
- **Why:** "no plan yet" is a normal state for the editor, not an error.

### Validation (zod)
`nutritionPlanSchema`: `dailyCalories`/`proteinTargetG` optional non-negative
integers (coerced); `generalNotes` optional `max(1000)`; `meals` an array where
each has a non-empty `name` (`max(120)`), optional `note` (`max(500)`), and an
`items` array where each has a non-empty `description` (`max(300)`) and optional
`quantity` (`max(60)`). Order is derived from array position, not client input.

### Data model
- `NutritionPlan` (1:1): `clientId` **unique** FK cascade, `dailyCalories Int?`,
  `proteinTargetG Int?`, `generalNotes String?`, `createdAt`, `updatedAt`.
- `NutritionMeal`: `nutritionPlanId` FK cascade, `name`, `note String?`, `order`,
  `@@index([nutritionPlanId])`.
- `NutritionFoodItem`: `nutritionMealId` FK cascade, `description`,
  `quantity String?`, `order`, `@@index([nutritionMealId])`.
- `NutritionPlanVersion`: `clientId` FK cascade, `snapshot Json`, `createdAt`,
  `@@index([clientId, createdAt])`.

## Risks / Trade-offs

- **Replace-children loses child ids across saves** → acceptable; the editor
  treats the plan as a document and ids are not referenced elsewhere. Version
  snapshots preserve prior states.
- **Unbounded meal/item counts** → cap arrays in the validator (e.g. ≤ 30 meals,
  ≤ 50 items per meal) to bound payloads.
- **JSON snapshot drift from the schema** → snapshots are read-only display data;
  they are never rehydrated into tables, so schema evolution does not break them.
- **Transaction on `$transaction`** → all writes for a save succeed or fail
  together; a failure leaves the previous plan intact.

## Migration Plan

- Additive Prisma migration (`add_nutrition_plan`); four new tables, no changes to
  existing tables. No new dependencies. Rollback = revert the migration + code.
