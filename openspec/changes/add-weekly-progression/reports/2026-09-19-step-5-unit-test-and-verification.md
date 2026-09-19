# Step 5 Report - Unit Tests and Verification

- Date: 2026-09-19
- Change: add-weekly-progression (US-018)
- Agent: GitHub Copilot (backend + frontend)

## Commands

- Backend: `npx jest`
- Frontend: `npx vitest run`, `npm run build`
- Migration: `npx prisma migrate dev --name add_routine_exercise_weeks`

## Results

- **Backend: 37 suites, 283 passed** (was 280; +3: validator accepts a weekly
  progression, rejects duplicate week numbers, rejects a non-positive week; the
  repository create test also asserts the weeks round-trip and the nested create
  includes them).
- **Frontend: 34 files, 106 passed** (was 104; +2: the builder adds a week row
  and includes it in the payload; the client routine view renders the per-week
  progression). Build clean.
- **Migration applied**: `RoutineExerciseWeek` table exists
  (`to_regclass` → `"RoutineExerciseWeek"`), with FK cascade and unique
  `(routineExerciseEntryId, week)`.
- **Database (demo data)**: Client=3, Payment=2, Exercise=11, RoutineTemplate=0,
  RoutineExerciseWeek=0. A stray `Test` library template left from earlier manual
  testing was removed to restore a clean baseline.

## Notes

- New table `RoutineExerciseWeek` (`routineExerciseEntryId` FK cascade, `week`,
  `kg?`, `reps?`, `series?`, unique `(entryId, week)`). Existing entry columns
  untouched → old single-value routines read back with empty `weeks`.
- Backend: new domain model `RoutineExerciseWeek`; `RoutineExerciseEntry.weeks`;
  input types; validator refinement; repository `nestedInclude`/`sessionsCreate`/
  `toDomain` + a shared `sourceSessionsToInput` used by `duplicate`/`assign`.
- Frontend: `routineTemplateService` week types; a per-entry weekly editor in the
  builder (add/remove week rows, auto-numbered); per-week display in the client
  routine view; i18n keys (es/en).

## Outcome

- Step 5 status: PASS
- Blocking issues: none
