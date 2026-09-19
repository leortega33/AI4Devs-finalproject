## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-weekly-progression` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data model + migration

- [x] 1.1 Add the `RoutineExerciseWeek` model to `schema.prisma` (`routineExerciseEntryId` FK cascade, `week Int`, `kg Float?`, `reps Int?`, `series Int?`, `@@unique([routineExerciseEntryId, week])`) and the `weeks RoutineExerciseWeek[]` relation on `RoutineExerciseEntry`
- [x] 1.2 Generate + apply the migration (`npx prisma migrate dev --name add_routine_exercise_weeks`); verify `prisma generate` and that old routines still read back (empty weeks)

## 2. Backend nested weeks (TDD)

- [x] 2.1 Add the domain model `RoutineExerciseWeek` and `weeks: RoutineExerciseWeek[]` (default `[]`) to `RoutineExerciseEntry`; add `RoutineExerciseWeekInput` + `weeks?` to `RoutineExerciseEntryInput`
- [x] 2.2 Extend the validator: `routineExerciseWeekSchema` (positive int week; nonnegative optional-nullable kg/reps/series), optional `weeks` on the entry schema, and a refinement rejecting duplicate week numbers within an entry; add validator tests (accepts weeks, rejects duplicate/`<1` week) — start failing
- [x] 2.3 Extend `PrismaRoutineTemplateRepository`: `nestedInclude` loads `weeks` ordered by week; `sessionsCreate` nests `weeks: { create }`; `toDomain` maps weeks; `duplicate`/`assignCloneToClient` re-map weeks; extend the repository test (create/replace/duplicate round-trips the weeks)
- [x] 2.4 Run the backend suite (`npm test`); keep everything green

## 3. Frontend builder + client view (TDD)

- [x] 3.1 Add `RoutineExerciseWeek`(+`Input`) types and `weeks` on the entry (+ input) interfaces in `routineTemplateService.ts`
- [x] 3.2 Extend the routine builder: `EditEntry.weeks`, a compact per-entry weekly editor (add/remove week rows, auto-numbered), and `buildPayload` mapping non-empty weeks (drop fully-empty rows); add `routines.form.weeklyProgression/addWeek/week/removeWeek` i18n keys (es/en); extend the builder unit test (adding a week row submits `weeks`) — start failing
- [x] 3.3 Extend the client routine view: render the per-week progression when `entry.weeks` is non-empty, else the single-value line; add `clientRoutine.week` i18n key; extend the `ClientRoutinePage` test (per-week rendered)
- [x] 3.4 Run `npx vitest run` + `npm run build`; keep everything green

## 4. Review Unit Tests (MANDATORY)

- [x] 4.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (nested round-trip, validator edge cases, builder/display, backward-compat) and fill any gaps

## 5. Run Unit Tests and Verify State (MANDATORY)

- [x] 5.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 5.2 Verify the migration applied: `RoutineExerciseWeek` table exists; record `Client`/`Payment`/`Exercise`/`RoutineTemplate` counts before/after (unchanged) as a sanity check
- [x] 5.3 Create the report `openspec/changes/add-weekly-progression/reports/YYYY-MM-DD-step-5-unit-test-and-verification.md`

## 6. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 With the backend running and an authenticated cookie, `curl` `POST /api/routine-templates` with an entry that has a `weeks` array, then `GET /api/routine-templates/:id` and confirm the weeks round-trip in order; `PUT` to change the weeks and confirm they are replaced; confirm a duplicate-week payload is rejected (400). Document commands + outcomes in `openspec/changes/add-weekly-progression/reports/YYYY-MM-DD-step-6-curl-endpoint-testing.md`

## 7. Manual Visual + E2E Testing (MANDATORY)

- [x] 7.1 In the browser, build a routine with a per-week progression on an entry, save it, assign it to a client, and verify the client routine view shows the per-week values; verify a single-value routine still renders as before. Capture notes in `openspec/changes/add-weekly-progression/reports/YYYY-MM-DD-step-7-visual-verification.md`
- [x] 7.2 Extend the routines E2E to add a week row when building a routine and confirm it saves; run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in the same or a step-7 E2E report

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `docs/data-model.md` with the new `RoutineExerciseWeek` entity and its relation to `RoutineExerciseEntry`
- [x] 8.2 Update `readme.md` §1.3 (UX walkthrough) to mention the weekly progression in the builder and client view
- [x] 8.3 Update `planning/user-stories-backlog.md` US-018 status to `in-openspec`, linking to this change
- [x] 8.4 On feature close: update `readme.md` deliverables and `prompts.md` with the weekly-progression work
