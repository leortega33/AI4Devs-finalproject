## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-nutrition-plans` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data Model + Migration

- [x] 1.1 Add `NutritionPlan` (1:1 with `Client`, unique `clientId` FK cascade, `dailyCalories Int?`, `proteinTargetG Int?`, `generalNotes String?`, `createdAt`, `updatedAt @updatedAt`), `NutritionMeal` (`nutritionPlanId` FK cascade, `name`, `note String?`, `order`, `@@index([nutritionPlanId])`), `NutritionFoodItem` (`nutritionMealId` FK cascade, `description`, `quantity String?`, `order`, `@@index([nutritionMealId])`), and `NutritionPlanVersion` (`clientId` FK cascade, `snapshot Json`, `createdAt`, `@@index([clientId, createdAt])`) to `schema.prisma`; add the relations on `Client`
- [x] 1.2 Create the migration (`prisma migrate dev --name add_nutrition_plan`) and regenerate the client; confirm existing rows are untouched

## 2. Backend nutrition (TDD)

- [x] 2.1 Add the nutrition domain models (`NutritionPlan`, `NutritionMeal`, `NutritionFoodItem`, with a unit test) and a `NutritionPlanRepository` interface (`findByClientId` returning the plan graph or null, `upsert` replacing meals/items and appending a version in a transaction, `listVersionsByClientId` newest first) + its Prisma implementation with a repository test (upsert replaces children, appends a version; find returns the ordered graph; versions newest-first)
- [x] 2.2 Add `nutritionPlanSchema` to the validator (`dailyCalories`/`proteinTargetG` optional non-negative integers coerced; `generalNotes` optional `max(1000)`; `meals` array `max(30)` each with non-empty `name` `max(120)`, optional `note` `max(500)`, and `items` array `max(50)` each with non-empty `description` `max(300)` and optional `quantity` `max(60)`) + `validateNutritionPlan`; add validator tests (accepts a full plan, accepts an empty plan, rejects a negative target, rejects a meal without a name, rejects an item without a description) — start failing
- [x] 2.3 Add a `NutritionService` (`getPlan` returning the plan or an empty payload, ensuring the client exists; `savePlan` upserting the graph, defaulting order from array position, and appending a version, ensuring the client exists; `getVersions` newest first) with unit tests (get existing/empty, get 404 for a missing client, save create + replace, save appends a version, save 404 for a missing client, versions newest-first) — start failing
- [x] 2.4 Add the controller + nested route `createClientNutritionRoutes` (`GET /`, `PUT /`, `GET /versions`) mounted at `/api/clients/:clientId/nutrition-plan` (auth-protected); wire it in `index.ts`; add the route test (get empty, put create/replace + shape, put 400 invalid, get versions, 401, 404)
- [x] 2.5 Run the backend suite (`npm test`); keep everything green

## 3. Frontend nutrition (TDD)

- [x] 3.1 Add a `nutritionService` (`getPlan`, `savePlan`, `getVersions`) + types (`NutritionPlan`, `NutritionMeal`, `NutritionFoodItem`, `NutritionPlanVersion`)
- [x] 3.2 Add a `ClientNutritionPage` (optional daily targets + general note; meals with add / remove / reorder, each with food items add / remove; save with a success snackbar; a history view listing versions newest-first); add the route in `App.tsx` and a **nutrition** action icon on the client list; add `nutrition.*` and `clients.actions.nutrition` i18n keys (es/en); add the page test (add a meal and a food item, save calls the service; history renders) — start failing
- [x] 3.3 Run `npx vitest run` + `npm run build`; keep everything green

## 4. Review Unit Tests (MANDATORY)

- [x] 4.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (upsert-replace + version append, empty-plan payload, validation, render/a11y) and fill any gaps

## 5. Run Unit Tests and Verify State (MANDATORY)

- [x] 5.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 5.2 Record `Client`/`NutritionPlan`/`NutritionPlanVersion` counts before/after (unit tests use mocks; no DB writes)
- [x] 5.3 Create the report `openspec/changes/add-nutrition-plans/reports/YYYY-MM-DD-step-5-unit-test-and-verification.md`

## 6. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 With the backend running and an authenticated cookie: `GET` an empty plan; `PUT` a plan with targets + two meals each with food items and confirm it round-trips in order; `PUT` again with different meals and confirm the previous ones are replaced; `GET /versions` and confirm two snapshots newest-first; confirm 400 for a negative target and for a meal without a name, 401 without auth, and 404 for a non-existent client. Document commands + outcomes in `openspec/changes/add-nutrition-plans/reports/YYYY-MM-DD-step-6-curl-endpoint-testing.md`

## 7. Manual Visual + E2E Testing (MANDATORY)

- [x] 7.1 In the browser: open a client's nutrition page, add meals + food items and targets, save, verify it persists on reload, and open the history. Capture notes in `openspec/changes/add-nutrition-plans/reports/YYYY-MM-DD-step-7-visual-verification.md`
- [x] 7.2 Add a nutrition E2E (save a plan with a meal + food item, assert it persists and a version appears); run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in a step-7 E2E report

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `docs/api-spec.yml` with the nutrition endpoints and schemas
- [x] 8.2 Update `docs/data-model.md` with the four new entities, relationships, ER nodes, and a design-principle note (whole-plan upsert, JSON version snapshots)
- [x] 8.3 Update `planning/user-stories-backlog.md` US-027 status to `in-openspec`, linking to this change
- [x] 8.4 On feature close: update `readme.md` §1.3 (nutrition page) and `prompts.md` with this work
