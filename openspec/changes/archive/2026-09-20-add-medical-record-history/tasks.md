## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-medical-record-history` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data Model + Migration

- [x] 1.1 Add a `MedicalRecordVersion` model to `schema.prisma` (id, `clientId` FK → `Client` `onDelete: Cascade`, `createdAt @default(now())`, and nullable copies of all medical fields: `preexistingConditions`, `injuries`, `surgeriesOrProsthetics`, `physicalRestrictions`, `medication`, `allergies`, `bloodType`, `notes`), with an index on `[clientId, createdAt]`; add the `medicalRecordVersions` relation on `Client`
- [x] 1.2 Create the migration (`prisma migrate dev --name add_medical_record_versions`) and regenerate the client; confirm existing rows are untouched

## 2. Backend history (TDD)

- [x] 2.1 Add the `MedicalRecordVersion` domain model (medical fields + required `createdAt`) with a unit test
- [x] 2.2 Add a `MedicalRecordVersionRepository` interface (`create(clientId, snapshot)`, `listByClientId(clientId)` newest first) and its `PrismaMedicalRecordVersionRepository`; add the repository test (create + newest-first list) — start failing
- [x] 2.3 Inject the version repository into `MedicalRecordService`; on `upsert`, write a version snapshot from the saved record after the upsert succeeds; add `getHistory(clientId)` (ensure client exists → versions newest first); extend `medicalRecordService.test.ts` (version written on save; history newest first; empty history; not-found for missing client) — start failing
- [x] 2.4 Add the controller `history` action and mount `GET /api/clients/:clientId/medical-record/history` (auth-protected); extend the route test (history shape + 401 without auth); wire the new repository in `index.ts`
- [x] 2.5 Run the backend suite (`npm test`); keep everything green

## 3. Frontend history (TDD)

- [x] 3.1 Add the `MedicalRecordVersion` type and `getHistory(clientId)` to the frontend `medicalRecordService`
- [x] 3.2 Render a read-only **history** section on `MedicalRecordPage` (newest first, localized timestamps, empty state), refreshing after a successful save; add `medicalRecord.history.*` i18n keys (es/en); extend the `MedicalRecordPage` test (history renders; empty state) — start failing
- [x] 3.3 Run `npx vitest run` + `npm run build`; keep everything green

## 4. Review Unit Tests (MANDATORY)

- [x] 4.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (snapshot correctness, ordering, render, a11y) and fill any gaps

## 5. Run Unit Tests and Verify State (MANDATORY)

- [x] 5.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 5.2 Record `Client`/`MedicalRecord`/`MedicalRecordVersion` counts before/after (versions grow by one per save; other tables unchanged)
- [x] 5.3 Create the report `openspec/changes/add-medical-record-history/reports/YYYY-MM-DD-step-5-unit-test-and-verification.md`

## 6. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 With the backend running and an authenticated cookie: save a medical record twice via `PUT`, then `GET /api/clients/:clientId/medical-record/history` and confirm two versions newest first with the latest matching the current record; confirm empty history for a never-saved client; confirm 404 for a non-existent client and 401 without auth. Document commands + outcomes in `openspec/changes/add-medical-record-history/reports/YYYY-MM-DD-step-6-curl-endpoint-testing.md`

## 7. Manual Visual + E2E Testing (MANDATORY)

- [x] 7.1 In the browser, save a client's medical record, edit and save again, and verify the history section lists both versions with timestamps (newest first). Capture notes in `openspec/changes/add-medical-record-history/reports/YYYY-MM-DD-step-7-visual-verification.md`
- [x] 7.2 Extend the medical-record E2E to assert the history shows a version after saving; run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in a step-7 E2E report

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `docs/api-spec.yml` with the history endpoint and the `MedicalRecordVersion` schema
- [x] 8.2 Update `docs/data-model.md` with the new `MedicalRecordVersion` entity
- [x] 8.3 Update `planning/user-stories-backlog.md` US-021 status to `in-openspec`, linking to this change
- [x] 8.4 On feature close: update `readme.md` §1.3 (medical record history) and `prompts.md` with the medical-record-history work
