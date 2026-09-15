## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/refine-exercise-catalog` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Seed: Spanish base catalog

- [x] 1.1 Translate the base exercise catalog in `prisma/seed.ts` to Spanish (names, muscle groups, equipment), keeping code/comments in English
- [x] 1.2 Run the seed against a clean catalog and verify the Spanish exercises are present; re-run to confirm idempotency (no duplicates)

## 2. Frontend: Prevent negative sets/reps

- [x] 2.1 Add `min: 0` to the default sets/reps numeric inputs in `pages/ExerciseFormPage.tsx` and a client-side non-negative validation that shows a localized message; add the i18n key to `es.json`/`en.json`
- [x] 2.2 Add/adjust unit tests: submitting a negative default sets/reps shows the validation message and does not call the service

## 3. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 3.1 Confirm the backend non-negative validation is already covered (`validator` test) and keep backend tests seed-content-agnostic; fill any gaps

## 4. Backend: Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [x] 4.1 Capture the pre-test database baseline (`Exercise`, `User` row counts)
- [x] 4.2 Run the full backend test suite (`npm test`) and record pass/fail counts and coverage (90%+ threshold)
- [x] 4.3 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [x] 4.4 Create the report `openspec/changes/refine-exercise-catalog/reports/YYYY-MM-DD-step-4-unit-test-and-db-verification.md`

## 5. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 5.1 With the server running and logged in, `POST /api/exercises` with a negative `defaultSets` and confirm it is rejected with 400
- [x] 5.2 Document the command/response in `openspec/changes/refine-exercise-catalog/reports/YYYY-MM-DD-step-5-curl-endpoint-testing.md` and confirm the DB is unchanged (baseline restored)

## 6. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 Re-seed a clean catalog; run E2E serially (`--workers=1`)
- [x] 6.2 Verify the catalog lists the Spanish seeded exercises and the existing exercise-catalog flow still passes
- [x] 6.3 Restore any test data created during the run and document outcomes in `openspec/changes/refine-exercise-catalog/reports/YYYY-MM-DD-step-6-e2e-testing.md`

## 7. Documentation (MANDATORY)

- [x] 7.1 No API/schema change — verify `docs/api-spec.yml` and `docs/data-model.md` need no update
- [x] 7.2 On feature close: update `readme.md`/`prompts.md` only if the described behavior changed materially (note the Spanish base catalog + negative-value guard)
