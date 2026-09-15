## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-medical-record` from the current branch and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: Data Model & Migration

- [x] 1.1 Add the `MedicalRecord` model to `prisma/schema.prisma` per `docs/data-model.md` entity #3 (unique `clientId` FK to `Client`, `onDelete: Cascade`, nullable free-text fields + `bloodType` + `notes`), and add the inverse `medicalRecord MedicalRecord?` relation on `Client`
- [x] 1.2 Run `npx prisma migrate dev --name add-medical-record`, then verify `npx prisma validate` passes and the Prisma client regenerates

## 2. Backend: Domain & Data Access (TDD)

- [x] 2.1 Write failing unit tests for `domain/models/MedicalRecord.ts`, then implement it
- [x] 2.2 Define `domain/repositories/MedicalRecordRepository.ts` (interface with `MedicalRecordInput`, `findByClientId`, `upsert`)
- [x] 2.3 Write failing unit tests for `PrismaMedicalRecordRepository` (findByClientId found/not-found, upsert create, upsert update), then implement until they pass

## 3. Backend: Application Layer (TDD)

- [x] 3.1 Write failing unit tests for `medicalRecordSchema` in `application/validator.ts` (all fields optional, empty payload valid, per-field length limit enforced), then implement
- [x] 3.2 Write failing unit tests for `medicalRecordService` (`getByClientId`: found, `null` when none, `ClientNotFoundError` for missing client; `upsert`: create when none, update when exists, `ClientNotFoundError` for missing client), then implement

## 4. Backend: Presentation Layer

- [x] 4.1 Implement `presentation/controllers/medicalRecordController.ts` (get, upsert) and `routes/medicalRecordRoutes.ts` (nested `mergeParams` router mounted at `/api/clients/:clientId/medical-record`, protected by `authMiddleware`); wire it into `index.ts`
- [x] 4.2 Write integration tests (supertest) for the routes: 200 read (record and `null`), 200 upsert (create + update), 404 for a missing client, 400 for an oversized field, and 401 when unauthenticated

## 5. Frontend: Medical Record UI

- [x] 5.1 Implement `services/medicalRecordService.ts` (`get(clientId)`, `save(clientId, data)`) and add `medicalRecord` i18n keys to `es.json`/`en.json`
- [x] 5.2 Implement `components/MedicalRecordForm.tsx` (MUI form with the medical fields, empty state when no record yet) with unit tests (renders empty state, saves values)
- [x] 5.3 Implement `pages/MedicalRecordPage.tsx` at `/clients/:clientId/medical-record` (loads the record on open, renders the form, saves via the service, `BackButton` to the client list) and wire the route into `App.tsx` behind `ProtectedRoute` + `AppLayout`; add a "Medical record" action to reach it from `ClientsListPage` with tests kept green

## 6. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 6.1 Review all unit tests written in sections 2-5 against `docs/backend-standards.md` (AAA pattern, happy path/error/edge case coverage) and fill any gaps

## 7. Backend: Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 Capture the pre-test database baseline (`Client`, `MedicalRecord`, `User` row counts)
- [x] 7.2 Run the targeted unit tests for the medical-record module
- [x] 7.3 Run the full backend test suite (`npm test`) and record pass/fail counts and coverage (90%+ threshold)
- [x] 7.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [x] 7.5 Create the report `openspec/changes/add-medical-record/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`
- [x] 7.6 Mark this step complete only once tests pass and the report file exists

## 8. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 8.1 Ensure the backend server and the Dockerized PostgreSQL database are running; seed the admin and create a throwaway client; log in to obtain a session cookie
- [x] 8.2 Test `GET /api/clients/:clientId/medical-record` before any record exists (expect `data: null`) and document the response
- [x] 8.3 Test `PUT /api/clients/:clientId/medical-record` to create the record (200), then `GET` again to confirm it is returned
- [x] 8.4 Test `PUT` again to update the record (200) and confirm the values changed (still one record)
- [x] 8.5 Test `GET`/`PUT` for a non-existent client (404) and an oversized field (400)
- [x] 8.6 Test that every endpoint returns 401 without a session cookie
- [x] 8.7 Restore the database (delete the throwaway client + its record, reset sequences, clear the admin reset token) and document all curl commands/responses in `openspec/changes/add-medical-record/reports/YYYY-MM-DD-step-8-curl-endpoint-testing.md`, confirming the DB matches the pre-test baseline

## 9. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [x] 9.1 Ensure both the frontend and backend servers are running
- [x] 9.2 Log in, open the medical-record page of an existing client (from the client list), and verify it shows an empty state
- [x] 9.3 Fill in and save the medical record; reload/reopen and verify the values persist
- [x] 9.4 Edit the medical record and verify the change persists (still one record)
- [x] 9.5 Restore any test data created during the run and document outcomes in `openspec/changes/add-medical-record/reports/YYYY-MM-DD-step-9-e2e-testing.md`

## 10. Documentation (MANDATORY)

- [x] 10.1 Update `docs/api-spec.yml` with the medical-record endpoints
- [x] 10.2 Verify/adjust `docs/data-model.md` `MedicalRecord` entity to match the implemented schema
- [x] 10.3 Update `planning/user-stories-backlog.md` US-003 status to `in-openspec`, linking to this change
- [x] 10.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-003 content
