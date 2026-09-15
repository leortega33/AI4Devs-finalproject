## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [ ] 0.1 Create feature branch `feature/assign-client-routine` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [ ] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: Repository Additions (TDD)

- [x] 1.1 Extend `RoutineTemplateRepository` with `assignCloneToClient(clientId, templateId, startDate, durationWeeks)`, `findActiveByClient(clientId)`, `findHistoryByClient(clientId)` (reusing the nested mapping/deep-clone helpers)
- [x] 1.2 Write failing unit tests for the new `PrismaRoutineTemplateRepository` methods (assign clone closes previous active in a transaction; findActiveByClient found/null; findHistoryByClient non-active summaries), then implement until they pass

## 2. Backend: Application Layer (TDD)

- [x] 2.1 Write failing unit tests for `assignRoutineSchema` in `application/validator.ts` (`templateId` positive int, `startDate` required, `durationWeeks` positive int), then implement
- [x] 2.2 Write failing unit tests for `clientRoutineService` (assign: client-not-found, template-not-found, clone+close-previous; getActive found/null incl. computed endDate/isExpired; getHistory; adjust: no-active-not-found, replace nested, source template unchanged), then implement (reuses `ClientNotFoundError` and `RoutineTemplateNotFoundError`)

## 3. Backend: Presentation Layer

- [x] 3.1 Implement `presentation/controllers/clientRoutineController.ts` (assign, getActive, getHistory, adjust) and `routes/clientRoutineRoutes.ts` (nested `mergeParams` router mounted at `/api/clients/:clientId`, routes `/routine` [POST/GET/PUT] and `/routines/history` [GET]), protected by `authMiddleware`; wire it into `index.ts`
- [x] 3.2 Write integration tests (supertest) for the routes: 201 assign + 404 (client)/400 (missing fields), 200 get active (routine and `null`), 200 history, 200 adjust + 404 (no active), and 401 when unauthenticated

## 4. Frontend: Client Routine UI

- [x] 4.1 Implement `services/clientRoutineService.ts` (`getActive`, `assign`, `adjust`, `getHistory`) and add `clientRoutine` i18n keys to `es.json`/`en.json`
- [x] 4.2 Implement `components/TemplatePickerDialog.tsx` (lists library templates to assign) with a unit test
- [x] 4.3 Implement `pages/ClientRoutinePage.tsx` at `/clients/:clientId/routine` (active routine or empty state, "Assign routine" with template picker + start date + duration, history list, `BackButton`) with unit tests
- [x] 4.4 Wire the route into `App.tsx` behind `ProtectedRoute` + `AppLayout`, and add a "Routine" action to reach it from `ClientsListPage`; keep existing tests green
- [x] 4.5 Add a routine-assigned indicator to the client list: extend the backend client list to return `hasActiveRoutine` (filtered active-routine lookup in `PrismaClientRepository.findAll`, exposed on the `Client` list mapping) and add a "Rutina" column (assigned/not-assigned chip) to `ClientsListPage`; update the affected client-management unit tests

## 5. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 5.1 Review all unit tests written in sections 1-4 against `docs/backend-standards.md` (AAA pattern, happy path/error/edge case coverage) and fill any gaps

## 6. Backend: Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 Capture the pre-test database baseline (`RoutineTemplate`, `Client`, `Exercise`, `User` row counts)
- [x] 6.2 Run the targeted unit tests for the client-routine module
- [x] 6.3 Run the full backend test suite (`npm test`) and record pass/fail counts and coverage (90%+ threshold)
- [x] 6.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [x] 6.5 Create the report `openspec/changes/assign-client-routine/reports/YYYY-MM-DD-step-6-unit-test-and-db-verification.md`

## 7. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 Ensure the backend server and the Dockerized PostgreSQL database are running (catalog seeded); log in; create a throwaway client and a library template to assign
- [x] 7.2 Test `POST /api/clients/:clientId/routine` (assign) → 201; `GET /api/clients/:clientId/routine` → 200 active with computed endDate/isExpired
- [x] 7.3 Assign a second routine and confirm the previous one is closed (only one active); `GET /routines/history` lists the closed one
- [x] 7.4 Test `PUT /api/clients/:clientId/routine` (adjust) → 200 and confirm the source template is unchanged; adjust with no active routine → 404
- [x] 7.5 Test error cases: assign unknown client → 404, assign unknown template → 400/404, missing fields → 400
- [x] 7.6 Test that every endpoint returns 401 without a session cookie
- [x] 7.7 Restore the database (delete the throwaway client [cascade], templates, reset sequences, clear the admin reset token) and document all curl commands/responses in `openspec/changes/assign-client-routine/reports/YYYY-MM-DD-step-7-curl-endpoint-testing.md`

## 8. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [x] 8.1 Ensure both servers are running (catalog seeded); run E2E serially (`--workers=1`)
- [x] 8.2 Log in, create a client and a library template, open the client's routine page, assign the template, and verify the active routine shows
- [x] 8.3 Assign a second template and verify the first moves to history (only one active)
- [x] 8.4 Restore any test data created during the run and document outcomes in `openspec/changes/assign-client-routine/reports/YYYY-MM-DD-step-8-e2e-testing.md`

## 9. Documentation (MANDATORY)

- [x] 9.1 Update `docs/api-spec.yml` with the client-routine endpoints and schemas, and add `hasActiveRoutine` to the client list response schema
- [x] 9.2 Verify `docs/data-model.md` already covers the reused entities (no schema change) and note the client-routine field usage if needed
- [x] 9.3 Update `planning/user-stories-backlog.md` US-006 status to `in-openspec`, linking to this change
- [x] 9.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-006 content
