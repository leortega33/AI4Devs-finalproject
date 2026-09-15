## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-exercise-catalog` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: Data Model, Migration & Seed

- [x] 1.1 Add the `Exercise` model + `ExerciseCategory` enum (`mobility`/`activation`/`main`) to `prisma/schema.prisma` per `docs/data-model.md` entity #4 (required `name`, `muscleGroup`, `category`; optional `defaultSets`, `defaultReps`, `technique`, `equipment`)
- [x] 1.2 Run `npx prisma migrate dev --name add-exercise`, verify `npx prisma validate` passes and the client regenerates
- [x] 1.3 Extend `prisma/seed.ts` to idempotently seed a base catalog (~9-12 exercises across the three categories) via find-or-create by name; verify re-running the seed does not duplicate

## 2. Backend: Domain & Data Access (TDD)

- [x] 2.1 Write failing unit tests for `domain/models/Exercise.ts`, then implement it
- [x] 2.2 Define `domain/repositories/ExerciseRepository.ts` (interface with `ExerciseInput`, `ExerciseListFilters`, `create`, `findById`, `findAll`, `update`)
- [x] 2.3 Write failing unit tests for `PrismaExerciseRepository` (create, findById found/not-found, findAll with category + case-insensitive name search, update), then implement until they pass

## 3. Backend: Application Layer (TDD)

- [x] 3.1 Write failing unit tests for `exerciseSchema` in `application/validator.ts` (required name/muscleGroup/category enum; optional numeric/text fields; invalid category rejected), then implement
- [x] 3.2 Write failing unit tests for `exerciseService` (create, findById found/`ExerciseNotFoundError`, list with search+category, update incl. `ExerciseNotFoundError`), then implement; add `ExerciseNotFoundError` and map it to 404 in `errorHandler`

## 4. Backend: Presentation Layer

- [x] 4.1 Implement `presentation/controllers/exerciseController.ts` (list, get, create, update) and `routes/exerciseRoutes.ts` mounted at `/api/exercises`, protected by `authMiddleware` (no DELETE); wire it into `index.ts`
- [x] 4.2 Write integration tests (supertest) for the routes: 200 list (with search/category), 200 get + 404, 201 create + 400, 200 update + 404, and 401 when unauthenticated

## 5. Frontend: Exercise Catalog UI

- [x] 5.1 Implement `services/exerciseService.ts` (list/get/create/update) and add `exercises` i18n keys to `es.json`/`en.json`
- [x] 5.2 Implement `pages/ExerciseCatalogPage.tsx` (MUI `DataGrid` with name search + category filter, New/Edit actions, `BackButton`) with unit tests
- [x] 5.3 Implement `pages/ExerciseFormPage.tsx` (shared create/edit form with category select and validation matching the backend) with unit tests
- [x] 5.4 Wire routes `/exercises`, `/exercises/new`, `/exercises/:id/edit` into `App.tsx` behind `ProtectedRoute` + `AppLayout`, and add an "Exercises" entry on the dashboard; keep existing tests green

## 6. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 6.1 Review all unit tests written in sections 2-5 against `docs/backend-standards.md` (AAA pattern, happy path/error/edge case coverage) and fill any gaps

## 7. Backend: Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 Capture the pre-test database baseline (`Exercise`, `Client`, `User` row counts)
- [x] 7.2 Run the targeted unit tests for the exercise module
- [x] 7.3 Run the full backend test suite (`npm test`) and record pass/fail counts and coverage (90%+ threshold)
- [x] 7.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [x] 7.5 Create the report `openspec/changes/add-exercise-catalog/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`
- [x] 7.6 Mark this step complete only once tests pass and the report file exists

## 8. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 8.1 Ensure the backend server and the Dockerized PostgreSQL database are running; run the seed; log in to obtain a session cookie
- [x] 8.2 Test `GET /api/exercises` (all, with `search`, with `category`) and document responses
- [x] 8.3 Test `POST /api/exercises` (valid → 201; then note the created id for restoration), and invalid category → 400
- [x] 8.4 Test `GET /api/exercises/:id` (found → 200; not found → 404)
- [x] 8.5 Test `PUT /api/exercises/:id` (valid update → 200, then revert; invalid → 400; missing → 404)
- [x] 8.6 Test that every endpoint returns 401 without a session cookie
- [x] 8.7 Restore the database (delete any exercise created during testing beyond the seeded set, reset the sequence if needed, clear the admin reset token) and document all curl commands/responses in `openspec/changes/add-exercise-catalog/reports/YYYY-MM-DD-step-8-curl-endpoint-testing.md`

## 9. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [x] 9.1 Ensure both the frontend and backend servers are running (seeded catalog present); run E2E serially (`--workers=1`) to avoid login rate-limit collisions
- [x] 9.2 Log in, open the exercise catalog, and verify seeded exercises are listed
- [x] 9.3 Create a new exercise through the UI and verify it appears; search by name and filter by category and verify the list updates
- [x] 9.4 Edit the exercise and verify the change persists
- [x] 9.5 Restore any test data created during the run and document outcomes in `openspec/changes/add-exercise-catalog/reports/YYYY-MM-DD-step-9-e2e-testing.md`

## 10. Documentation (MANDATORY)

- [x] 10.1 Update `docs/api-spec.yml` with the exercise endpoints
- [x] 10.2 Verify/adjust `docs/data-model.md` `Exercise` entity to match the implemented schema
- [x] 10.3 Update `planning/user-stories-backlog.md` US-004 status to `in-openspec`, linking to this change
- [x] 10.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-004 content
