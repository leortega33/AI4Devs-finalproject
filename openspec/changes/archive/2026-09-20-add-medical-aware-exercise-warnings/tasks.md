## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-medical-aware-exercise-warnings` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data Model + Migration

- [x] 1.1 Add `bodyRegions String[] @default([])` to the `Exercise` model in `schema.prisma`
- [x] 1.2 Create the migration (`prisma migrate dev --name add_exercise_body_regions`) and regenerate the client; confirm existing exercises default to `[]`
- [x] 1.3 Update `prisma/seed.ts` to tag the 11 base exercises with their body regions (idempotent update of existing rows); run the seed

## 2. Exercise body-region tags (TDD)

- [x] 2.1 Add a shared `REGION_CODES` constant (controlled vocabulary) in the backend domain; extend the `Exercise` domain model + `ExerciseInput` with `bodyRegions: RegionCode[]` (default `[]`) with a model test
- [x] 2.2 Extend `exerciseSchema` with `bodyRegions: z.array(z.enum(REGION_CODES)).optional()` defaulting to `[]`; extend the validator test (valid regions accepted, unknown region rejected, empty allowed) — start failing
- [x] 2.3 Map `bodyRegions` in `PrismaExerciseRepository` (create/update/read); extend the repository test
- [x] 2.4 Confirm the exercise controller/routes round-trip `bodyRegions`; extend the exercise route test (save + read back)
- [x] 2.5 Run the backend suite (`npm test`); keep everything green

## 3. Medical flags service + endpoint (TDD)

- [x] 3.1 Add the curated `medicalRegionDictionary` config (region → normalized keywords, es/en) and a `scanRegions(text)` helper (lowercase + strip diacritics, word-boundary match); add unit tests (single/multiple regions, case/accent-insensitive, multi-word keyword, no match) — start failing
- [x] 3.2 Add `MedicalFlagsService.getFlags(clientId)` (ensure client exists → scan the current medical record's four free-text fields → `{ regions, details:[{region,field,snippet}] }`); add service tests (flags + details, empty when no record/no match, not-found) — start failing
- [x] 3.3 Add the controller action + nested route `GET /api/clients/:clientId/medical-flags` (auth-protected); wire the service in `index.ts`; add the route test (shape + 401 + 404)
- [x] 3.4 Run the backend suite (`npm test`); keep everything green

## 4. Denormalize exercise regions onto the client routine (TDD)

- [x] 4.1 Add `exerciseBodyRegions` to each client-routine entry in the routine read mapping (alongside `exerciseVideoUrl`); extend the affected service/repository test to assert the field is present
- [x] 4.2 Run the backend suite (`npm test`); keep everything green

## 5. Frontend exercise regions (TDD)

- [x] 5.1 Extend the frontend `Exercise` type + service with `bodyRegions`; add a region multi-select (localized labels → codes) to the exercise form; add `exercises.regions.*` i18n keys (es/en); extend the exercise-form test (select + submit regions) — start failing
- [x] 5.2 Run `npx vitest run` + `npm run build`; keep everything green

## 6. Frontend advisory warnings (TDD)

- [x] 6.1 Add `exerciseBodyRegions` to the client-routine entry type; add a `getFlags(clientId)` call (medical flags service); on `ClientRoutinePage`, compute per-entry overlap and render an advisory marker (icon + tooltip with localized region labels); add `clientRoutine.warning.*` i18n keys (es/en); extend the `ClientRoutinePage` test (marker shown on overlap, hidden without overlap) — start failing
- [x] 6.2 Run `npx vitest run` + `npm run build`; keep everything green

## 7. Review Unit Tests (MANDATORY)

- [x] 7.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (matching correctness, advisory/non-blocking behavior, render, a11y) and fill any gaps

## 8. Run Unit Tests and Verify State (MANDATORY)

- [x] 8.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 8.2 Record `Exercise`/`Client`/`MedicalRecord` counts before/after (unchanged; base exercises gain regions)
- [x] 8.3 Create the report `openspec/changes/add-medical-aware-exercise-warnings/reports/YYYY-MM-DD-step-8-unit-test-and-verification.md`

## 9. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 9.1 With the backend running and an authenticated cookie: save an exercise with `bodyRegions` and read it back; save a client's medical record mentioning a mapped keyword (e.g. "lesión de rodilla") and `GET /api/clients/:clientId/medical-flags` confirming the `knee` region with source snippet; confirm empty flags for a client without a record; confirm 401 without auth and 404 for a missing client. Document commands + outcomes in `openspec/changes/add-medical-aware-exercise-warnings/reports/YYYY-MM-DD-step-9-curl-endpoint-testing.md`

## 10. Manual Visual + E2E Testing (MANDATORY)

- [x] 10.1 In the browser: tag an exercise with a region; give a client a medical record flagging that region; assign a routine including the exercise and verify the advisory marker appears (and that saving/assigning still works). Capture notes in `openspec/changes/add-medical-aware-exercise-warnings/reports/YYYY-MM-DD-step-10-visual-verification.md`
- [x] 10.2 Extend a client-routine E2E to assert the advisory marker shows for an overlapping exercise; run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in a step-10 E2E report

## 11. Documentation (MANDATORY)

- [x] 11.1 Update `docs/api-spec.yml` with `bodyRegions` on the exercise schemas and the `medical-flags` endpoint/schema
- [x] 11.2 Update `docs/data-model.md` with `Exercise.bodyRegions` and the medical-flags derivation note
- [x] 11.3 Update `planning/user-stories-backlog.md` US-022 status to `in-openspec`, linking to this change
- [x] 11.4 On feature close: update `readme.md` §1.3 (advisory medical warnings) and `prompts.md` with this work
