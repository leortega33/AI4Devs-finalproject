## Why

The gym app tracks training (routines), health (medical records), attendance,
and progress, but has no way to record what a client should eat. Trainers want to
complement training with a simple, structured nutrition plan per client. The
product scope is resolved (see US-027 in `planning/user-stories-backlog.md`):
structured meals with food items, optional daily targets, and a saved history —
reusable templates are deferred to US-027b.

## What Changes

- Add a **nutrition plan per client**: an ordered list of **meals**, each with an
  ordered list of **food items** (description + optional quantity/note), plus
  optional plan-level **daily targets** (`dailyCalories`, `proteinTargetG`) and a
  general note.
- **Upsert** the whole plan (meals + items + targets + note) in one operation;
  each save appends an immutable **version snapshot** so the plan's history is
  preserved (mirroring the medical-record history, US-021).
- View the plan and its **version history** (snapshots, newest first).
- Add a client-scoped **nutrition page** (meal/food-item editor with add / remove
  / reorder, targets, general note, and a history view) reachable from a
  **Nutrición** action on the client list, plus i18n keys (es/en).

## Capabilities

### New Capabilities
- `nutrition`: creating, editing (upsert), and viewing a client's structured
  nutrition plan (meals + food items + optional daily targets + note) with a
  saved version history.

### Modified Capabilities
_None._

## Impact

- **Data model:** new `NutritionPlan` (1:1 with `Client`, unique `clientId`,
  optional `dailyCalories`/`proteinTargetG`, `generalNotes`), `NutritionMeal`
  (FK → plan, `name`, `note?`, `order`), `NutritionFoodItem` (FK → meal,
  `description`, `quantity?`, `order`), and `NutritionPlanVersion` (FK → client,
  `snapshot Json`, `createdAt`); Prisma migration. All cascade on parent delete.
- **Backend:** new nutrition domain models, a repository + Prisma implementation
  (load the plan graph, upsert-replace meals/items transactionally, append a
  version, list versions), an application service, a zod validator, a controller,
  and a nested router at `/api/clients/:clientId/nutrition-plan`
  (`GET`, `PUT`, and `GET .../versions`); `NutritionPlanNotFoundError` is not
  needed (an absent plan returns an empty payload, not a 404).
- **Frontend:** a `nutritionService`, a `ClientNutritionPage` editor + history
  view, a route, a **Nutrición** action icon on the client list, and new i18n
  keys.
- **Docs:** `docs/api-spec.yml` (nutrition endpoints + schemas) and
  `docs/data-model.md` (the four new entities) updated.
- **Dependencies:** none new (Prisma `Json` column is built-in).
