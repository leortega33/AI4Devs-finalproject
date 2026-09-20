## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-exercise-media` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data model + migration

- [x] 1.1 Add `videoUrl String?` and `imageUrl String?` to the `Exercise` model in `schema.prisma`
- [x] 1.2 Generate + apply the migration (`npx prisma migrate dev --name add_exercise_media`); verify `prisma generate` and that old exercises read back with null media

## 2. Backend (TDD)

- [x] 2.1 Add `videoUrl`/`imageUrl` to the domain `Exercise` (Props + class, default null) and to `ExerciseInput`
- [x] 2.2 Extend `exerciseSchema` with URL validation (empty → null via `z.preprocess`, otherwise a valid http(s) URL, max length); add validator tests (accepts valid/empty URLs, rejects a malformed non-empty URL) — start failing
- [x] 2.3 Extend the routine nested read: `exercise: { select: { name: true, videoUrl: true } }`; add `exerciseVideoUrl` to `RoutineExerciseEntry` (Props + class) and map it in `toDomain`; extend the repository test to assert the video URL is carried into a routine entry
- [x] 2.4 Run the backend suite (`npm test`); keep everything green

## 3. Frontend (TDD)

- [x] 3.1 Add `videoUrl`/`imageUrl` to `Exercise` + `ExerciseFormData` (exerciseService), and `exerciseVideoUrl` to the routine entry type
- [x] 3.2 Add two optional URL fields (video, image) to `ExerciseFormPage`, sending `null` when empty; extend its unit test (fills + submits the URLs)
- [x] 3.3 Add a media column to `ExerciseCatalogPage` (icon links to video/image when present); extend its unit test (a media link renders for an exercise with a URL)
- [x] 3.4 Add a video link next to an exercise in `ClientRoutinePage` when `entry.exerciseVideoUrl` is present; extend its test; add `exercises.form.videoUrl/imageUrl`, `exercises.columns.media`, `exercises.watchVideo`, and any routine label i18n keys (es/en)
- [x] 3.5 Run `npx vitest run` + `npm run build`; keep everything green

## 4. Review Unit Tests (MANDATORY)

- [x] 4.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (URL validation edge cases, form/catalog/routine display, a11y of the links) and fill any gaps

## 5. Run Unit Tests and Verify State (MANDATORY)

- [x] 5.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 5.2 Verify the migration applied (Exercise has `videoUrl`/`imageUrl`); record `Client`/`Payment`/`Exercise`/`RoutineTemplate` counts before/after (unchanged)
- [x] 5.3 Create the report `openspec/changes/add-exercise-media/reports/YYYY-MM-DD-step-5-unit-test-and-verification.md`

## 6. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 With the backend running and an authenticated cookie, `POST`/`PUT` an exercise with a video and image URL and confirm they round-trip on `GET`; confirm a malformed URL is rejected (400); confirm an empty URL is accepted (stored as null). Document commands + outcomes in `openspec/changes/add-exercise-media/reports/YYYY-MM-DD-step-6-curl-endpoint-testing.md`

## 7. Manual Visual + E2E Testing (MANDATORY)

- [x] 7.1 In the browser, add a video/image URL to an exercise, verify the catalog shows the media links, add that exercise to a routine, assign it, and verify the client routine view shows the video link. Capture notes in `openspec/changes/add-exercise-media/reports/YYYY-MM-DD-step-7-visual-verification.md`
- [x] 7.2 Extend the exercises E2E to set a media URL and confirm it saves/renders; run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in a step-7 E2E report

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `docs/data-model.md` (Exercise `videoUrl`/`imageUrl` fields)
- [x] 8.2 Update `readme.md` §1.3 to mention exercise media (video/image link) in the catalog and routine
- [x] 8.3 Update `planning/user-stories-backlog.md` US-019 status to `in-openspec`, linking to this change
- [x] 8.4 On feature close: update `readme.md` deliverables and `prompts.md` with the exercise-media work
