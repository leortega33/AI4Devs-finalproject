## Why

A routine exercise entry stores a single kg/reps/series (US-005). Real training
plans progress week to week (e.g. the same lift goes 60→62.5→65 kg over a
mesocycle). US-018 lets the trainer optionally set **per-week** values for an
entry, editable in the routine builder and shown per week in the client's
routine view — while every existing single-value routine keeps working
unchanged.

## What Changes

- Add an optional **weekly progression** to each routine exercise entry: a list
  of per-week values `{ week, kg, reps, series }`. The entry keeps its existing
  single kg/reps/series as the default/simple mode.
- New Prisma table `RoutineExerciseWeek` (`entryId` FK, `week`, `kg`, `reps`,
  `series`, unique on `(entryId, week)`) + a migration. Existing columns are
  untouched.
- Extend the routine create/update flow (validator → repository nested write →
  domain mapping → read include) to persist and return the weeks.
- Routine builder: a compact **per-week editor** per entry (add/remove week rows).
- Client routine view: render the **per-week progression** when present, else the
  current single-value line.

## Impact

- Backend: `schema.prisma` + migration, new domain model + repository mapping,
  validator, controller/routes unchanged (same endpoints, richer payload).
- Frontend: builder per-week editor, client-routine per-week display, service
  types + i18n keys.
- Docs: `docs/data-model.md` (new entity + relation), `readme.md`/`prompts.md` on
  close.

## Scope Notes

- **Backward compatible**: entries without weeks behave exactly as today; the
  single kg/reps/series remains the default when no weeks are set.
- Weeks are **not** tied to `durationWeeks` (which only exists on client-assigned
  routines); the trainer adds as many week rows as the progression needs
  (1-indexed).
- The PDF/Excel export (US-017) is **not** changed here (keeps exporting the
  single values); adding per-week columns to the export is a separate follow-up.
