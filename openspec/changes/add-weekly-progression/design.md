## Context

A routine is a nested `RoutineTemplate → RoutineSession → RoutineExerciseEntry`
tree. Entries store nullable single `kg`/`reps`/`series` (US-005). The write path
is: `validateRoutineTemplate` (zod) → `RoutineTemplateService.create/update` →
`PrismaRoutineTemplateRepository.create`/`replaceNested` (nested Prisma create;
`replaceNested` deletes sessions then recreates in a transaction) → `toDomain`.
Reads use a single `nestedInclude`. `duplicate` and `assignCloneToClient` also
re-map the nested tree. The builder (`RoutineTemplateBuilderPage`) edits entries
with string-backed `kg/reps/series` fields and assembles the payload; the client
view (`ClientRoutinePage`) renders a single-value line per entry.

`durationWeeks` exists only on client-assigned routines (nullable) — library
templates have none — so the weekly progression is **not** derived from it.

## Goals / Non-Goals

**Goals**
- Optional per-week `{ week, kg, reps, series }` list per entry, persisted and
  returned; editable in the builder; shown per week in the client view.
- Full backward compatibility: single-value entries unchanged.

**Non-Goals**
- No change to the export (US-017), the derived routine status, or `durationWeeks`
  semantics. No auto-generation of weeks from a base value.

## Decisions

### Data model + migration
- New Prisma model `RoutineExerciseWeek`:
  `id`, `routineExerciseEntryId` (FK → `RoutineExerciseEntry`, `onDelete: Cascade`),
  `week Int`, `kg Float?`, `reps Int?`, `series Int?`, with `@@unique([routineExerciseEntryId, week])`.
  `RoutineExerciseEntry` gains a `weeks RoutineExerciseWeek[]` relation. Existing
  columns untouched.
- Migration via `npx prisma migrate dev --name add_routine_exercise_weeks`.

### Backend
- Domain: new `RoutineExerciseWeek` model (`week`, `kg`, `reps`, `series`);
  `RoutineExerciseEntry` gains `weeks: RoutineExerciseWeek[]` (default `[]`).
- Input types: `RoutineExerciseWeekInput { week; kg?; reps?; series? }`;
  `RoutineExerciseEntryInput` gains `weeks?: RoutineExerciseWeekInput[]`.
- Validator: add `routineExerciseWeekSchema` (`week` positive int; kg/reps/series
  nonnegative optional-nullable); entry schema gains optional `weeks`; refine to
  reject duplicate week numbers within an entry.
- Repository: extend `sessionsCreate` to nest `weeks: { create: [...] }` per
  entry; extend `nestedInclude` with `weeks: { orderBy: { week: 'asc' } }`;
  `toDomain` maps weeks; `duplicate`/`assignCloneToClient` re-map weeks too.
  `replaceNested` already drops+recreates sessions, so weeks are replaced via
  cascade — no extra work.

### Frontend
- `routineTemplateService` types: add `RoutineExerciseWeek`(+`Input`) and
  `weeks` on the entry (+ input) interfaces.
- Builder `EditEntry` gains `weeks: Array<{ week; kg; reps; series }>` (string
  fields). A compact **weekly editor** under each entry: "Progresión semanal
  (opcional)"; an "add week" button appends a row auto-numbered (1..N); each row
  has kg/reps/series inputs + remove. `buildPayload` maps non-empty weeks to
  `weeks` (parsing strings → nullable numbers), and drops fully-empty rows.
- Client view: when `entry.weeks.length > 0`, render a compact per-week list
  (`Sem 1: 4x8 @ 60kg`, …); otherwise the existing single-value line.
- i18n: `routines.form.weeklyProgression`, `addWeek`, `week`, `removeWeek`, and a
  `clientRoutine.week` label (es/en).

## Risks / Trade-offs
- The builder grows more complex; kept optional and collapsed-by-default per
  entry to avoid overwhelming the simple case.
- `replaceNested` full-replace means editing a routine rewrites all weeks — fine
  at this scale and consistent with current session/entry behavior.

## Migration Plan
- Additive migration (new table only). Old routines read back with empty `weeks`.
  All existing tests stay green; new tests cover the nested weeks write/read,
  validator duplicate-week rejection, the builder editor, and the client display.

## Open Questions
- None. Separate table + optional per-entry weeks + compact per-week client
  display, per the enriched US-018.
