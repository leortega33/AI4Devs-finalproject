## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [ ] 0.1 Create feature branch `feature/add-client-management` from `main` and verify it is checked out (`git branch --show-current`)
- [ ] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: Data Model & Migration

- [x] 1.1 Add the `Client` model to `prisma/schema.prisma` per `docs/data-model.md` (unique `dni`, `status` field, embedded emergency contact columns) and verify `npx prisma migrate dev --name add-client` succeeds
- [x] 1.2 Verify `npx prisma validate` passes and the Prisma client regenerates

## 2. Backend: Domain & Data Access (TDD)

- [x] 2.1 Write failing unit tests for `domain/models/Client.ts`, then implement it
- [x] 2.2 Write failing unit tests for `ClientRepository` (interface) and `PrismaClientRepository` (create, findById, findAll with search/status filter, update, setStatus), then implement until they pass

## 3. Backend: Application Layer (TDD)

- [x] 3.1 Write failing unit tests for the client create/update validation schema in `application/validator.ts` (required fields, email/DNI/phone format), then implement
- [x] 3.2 Write failing unit tests for `clientService` (create incl. duplicate-DNI conflict, findById found/not-found, list with search+status, update, deactivate/reactivate), then implement

## 4. Backend: Presentation Layer

- [x] 4.1 Implement `clientController` (list, get, create, update, updateStatus) and wire up `clientRoutes` under `/api/clients`, protected by `authMiddleware`
- [x] 4.2 Write integration tests (supertest) for the routes, including the 401 when unauthenticated and the 409 on duplicate DNI

## 5. Frontend: Client UI

- [x] 5.1 Implement `services/clientService.ts` (axios calls for the client endpoints)
- [x] 5.2 Implement `pages/ClientsListPage.tsx` (MUI DataGrid with name search + status filter, link to detail/edit) with unit tests
- [x] 5.3 Implement `pages/ClientFormPage.tsx` (shared create/edit form with validation matching the backend) with unit tests
- [x] 5.4 Implement `components/DeactivateClientDialog.tsx` (confirmation) with a unit test; wire routes into the app behind `ProtectedRoute`

## 6. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 6.1 Review all unit tests written in sections 2-5 against `docs/backend-standards.md` (AAA pattern, happy path/error/edge case coverage) and fill any gaps

## 7. Backend: Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 Capture the pre-test database baseline (`Client` and `User` row counts)
- [x] 7.2 Run the targeted unit tests for the client module
- [x] 7.3 Run the full backend test suite (`npm test`) and record pass/fail counts and coverage (90%+ threshold)
- [x] 7.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [x] 7.5 Create the report `openspec/changes/add-client-management/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`
- [x] 7.6 Mark this step complete only once tests pass and the report file exists

## 8. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 8.1 Ensure the backend server and the Dockerized PostgreSQL database are running; log in to obtain a session cookie
- [x] 8.2 Test `GET /api/clients` (empty, with search, with status filter) and document responses
- [x] 8.3 Test `POST /api/clients` (valid → 201; then restore DB by deleting the created client), and duplicate DNI → 409
- [x] 8.4 Test `GET /api/clients/:id` (found → 200; not found → 404)
- [x] 8.5 Test `PUT /api/clients/:id` (valid update → 200, then revert; invalid → 400)
- [x] 8.6 Test `PATCH /api/clients/:id/status` (deactivate → 200, reactivate → 200)
- [x] 8.7 Test that every endpoint returns 401 without a session cookie
- [x] 8.8 Document all curl commands/responses in `openspec/changes/add-client-management/reports/YYYY-MM-DD-step-8-curl-endpoint-testing.md` and confirm the database matches the pre-test baseline

## 9. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [x] 9.1 Ensure both the frontend and backend servers are running
- [x] 9.2 Log in, navigate to the clients list, and create a new client through the UI; verify it appears in the list
- [x] 9.3 Edit the client and verify the change persists
- [x] 9.4 Search by name and filter by status and verify the list updates
- [x] 9.5 Deactivate the client (confirmation dialog) and verify it shows as inactive
- [x] 9.6 Restore any test data created during the run and document outcomes in `openspec/changes/add-client-management/reports/YYYY-MM-DD-step-9-e2e-testing.md`

## 10. Documentation (MANDATORY)

- [x] 10.1 Update `docs/api-spec.yml` with the client endpoints
- [x] 10.2 Verify/adjust `docs/data-model.md` `Client` entity to match the implemented schema
- [x] 10.3 Update `planning/user-stories-backlog.md` US-002 status to `in-openspec`, linking to this change
- [ ] 10.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-002 content
