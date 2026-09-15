## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [ ] 0.1 Create feature branch `feature/add-routine-templates` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [ ] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: Data Model & Migration

- [ ] 1.1 Add `RoutineStatus` and `RoutinePhase` enums and the `RoutineTemplate`, `RoutineSession`, `RoutineExerciseEntry` models to `prisma/schema.prisma` per `docs/data-model.md` entities #5-#7 (cascade on session/entry FKs, self-relation on template, back-relations on `Client` and `Exercise`)
- [ ] 1.2 Run `npx prisma migrate dev --name add-routine-templates`, verify `npx prisma validate` passes and the client regenerates

## 2. Backend: Domain & Data Access (TDD)

- [ ] 2.1 Write failing unit tests for the domain models (`RoutineTemplate`, `RoutineSession`, `RoutineExerciseEntry`), then implement them
- [ ] 2.2 Define `domain/repositories/RoutineTemplateRepository.ts` (nested `RoutineTemplateInput`, `findAll` summary, `findById` full, `create`, `replaceNested`/`update`, `deleteById` helpers as needed)
- [ ] 2.3 Write failing unit tests for `PrismaRoutineTemplateRepository` (create with nested sessions/entries, findById with ordered nesting, findAll library-only, transactional replace on update, deep-copy read for duplicate), then implement until they pass

## 3. Backend: Application Layer (TDD)

- [ ] 3.1 Write failing unit tests for `routineTemplateSchema` in `application/validator.ts` (name required, at least one session, session name required, entry `exerciseId`/`phase` valid, non-negative kg/reps/series), then implement
- [ ] 3.2 Write failing unit tests for `routineTemplateService` (create incl. unknown-`exerciseId` rejection, findById found/`RoutineTemplateNotFoundError`, list, update replaces nested data atomically, duplicate deep-clone independence), then implement; add `RoutineTemplateNotFoundError` and map it to 404 in `errorHandler`

## 4. Backend: Presentation Layer

- [ ] 4.1 Implement `presentation/controllers/routineTemplateController.ts` (list, get, create, update, duplicate) and `routes/routineTemplateRoutes.ts` mounted at `/api/routine-templates`, protected by `authMiddleware`; wire it into `index.ts`
- [ ] 4.2 Write integration tests (supertest) for the routes: 200 list, 200 get + 404, 201 create + 400 (no session / unknown exercise), 200 update + 404, 201 duplicate + 404, and 401 when unauthenticated

## 5. Frontend: Routine Builder UI

- [ ] 5.1 Implement `services/routineTemplateService.ts` (list/get/create/update/duplicate) and add `routines` i18n keys to `es.json`/`en.json`
- [ ] 5.2 Implement `components/ExercisePickerDialog.tsx` (search catalog by name + category, returns the chosen exercise) with a unit test
- [ ] 5.3 Implement `pages/RoutineTemplatesListPage.tsx` (MUI `DataGrid` with New/Edit/Duplicate actions, `BackButton`) with unit tests
- [ ] 5.4 Implement `pages/RoutineTemplateBuilderPage.tsx` (template fields + sessions with warm-up/main entry lists, add/remove sessions and entries via the picker, set block/kg/reps/series/notes, validation matching the backend) with unit tests
- [ ] 5.5 Wire routes `/routines`, `/routines/new`, `/routines/:id/edit` into `App.tsx` behind `ProtectedRoute` + `AppLayout`, and add a "Routines" entry on the dashboard; keep existing tests green

## 6. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [ ] 6.1 Review all unit tests written in sections 2-5 against `docs/backend-standards.md` (AAA pattern, happy path/error/edge case coverage) and fill any gaps

## 7. Backend: Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [ ] 7.1 Capture the pre-test database baseline (`RoutineTemplate`, `RoutineSession`, `RoutineExerciseEntry`, `Exercise`, `User` row counts)
- [ ] 7.2 Run the targeted unit tests for the routine-template module
- [ ] 7.3 Run the full backend test suite (`npm test`) and record pass/fail counts and coverage (90%+ threshold)
- [ ] 7.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [ ] 7.5 Create the report `openspec/changes/add-routine-templates/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`
- [ ] 7.6 Mark this step complete only once tests pass and the report file exists

## 8. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [ ] 8.1 Ensure the backend server and the Dockerized PostgreSQL database are running (catalog seeded); log in to obtain a session cookie
- [ ] 8.2 Test `POST /api/routine-templates` with a valid nested payload (2 sessions, warm-up + main entries referencing seeded exercises) → 201; capture the created id
- [ ] 8.3 Test `GET /api/routine-templates` (list) and `GET /api/routine-templates/:id` (full nested detail) → 200
- [ ] 8.4 Test `POST /api/routine-templates` with no sessions → 400 and with an unknown `exerciseId` → 400
- [ ] 8.5 Test `PUT /api/routine-templates/:id` (replace sessions/entries) → 200 and confirm the nested data was replaced; missing id → 404
- [ ] 8.6 Test `POST /api/routine-templates/:id/duplicate` → 201, then edit the copy and confirm the original is unchanged (deep-clone independence)
- [ ] 8.7 Test that every endpoint returns 401 without a session cookie
- [ ] 8.8 Restore the database (delete templates created during testing, reset sequences, clear the admin reset token) and document all curl commands/responses in `openspec/changes/add-routine-templates/reports/YYYY-MM-DD-step-8-curl-endpoint-testing.md`, confirming the DB matches the pre-test baseline

## 9. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [ ] 9.1 Ensure both the frontend and backend servers are running (catalog seeded); run E2E serially (`--workers=1`) to avoid login rate-limit collisions
- [ ] 9.2 Log in, open the routines library, build a new template with a session and warm-up/main exercises from the picker, save, and verify it appears
- [ ] 9.3 Edit the template (add/remove a session or entry) and verify the change persists
- [ ] 9.4 Duplicate the template and verify an independent copy appears; edit the copy and confirm the original is unchanged
- [ ] 9.5 Restore any test data created during the run and document outcomes in `openspec/changes/add-routine-templates/reports/YYYY-MM-DD-step-9-e2e-testing.md`

## 10. Documentation (MANDATORY)

- [ ] 10.1 Update `docs/api-spec.yml` with the routine-template endpoints and schemas
- [ ] 10.2 Verify/adjust `docs/data-model.md` `RoutineTemplate`/`RoutineSession`/`RoutineExerciseEntry` entities to match the implemented schema
- [ ] 10.3 Update `planning/user-stories-backlog.md` US-005 status to `in-openspec`, linking to this change
- [ ] 10.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-005 content
