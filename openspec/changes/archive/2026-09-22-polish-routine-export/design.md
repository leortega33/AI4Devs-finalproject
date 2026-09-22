## Context

See proposal.md — Why, and US-030 in `planning/user-stories-backlog.md` for the
resolved design (sampled colors, orientation, conventions). The current builders
(`routinePdf.ts` with PDFKit, `routineXlsx.ts` with ExcelJS) emit a plain
text-list. The routine domain already carries everything the layout needs:
`RoutineTemplate` (name, `startDate`, `durationWeeks`, `generalConsiderations`,
`clientId`), `RoutineSession` (name, `warmupPrescription`, order),
`RoutineExerciseEntry` (phase warmup/main, `block`, kg/reps/series, notes, order,
`weeks: RoutineExerciseWeek[]`), and the assigned client for the header name.

One gap: `RoutineExerciseEntry` exposes `exerciseBodyRegions` but **not the
exercise `category`**, which is needed to split warm-up entries into MOVILIDAD
(`mobility`) vs ACTIVACIÓN (`activation`). The Prisma enum is
`ExerciseCategory { mobility, activation, main }`.

## Goals / Non-Goals

**Goals:**
- Make the PDF and Excel visually match `planning/reference/trainer-plan.pdf`.
- Reuse the existing endpoints/services unchanged; only the builders change.
- Read weekly progression (US-018) into per-week columns.

**Non-Goals:**
- No new endpoint, route, service, DB table, or spec (skip_specs).
- No pixel-perfect clone — a faithful, legible A4 landscape rendition.
- No template-editor changes; a library template with no client renders with a
  blank name/date.

## Decisions

### Expose the exercise category on routine entries
Add `exerciseCategory` (`'mobility' | 'activation' | 'main'`) to
`RoutineExerciseEntry` and include `category` in the Prisma repository's
`exercise` select + `toDomain`. This is additive read-only data (no endpoint or
spec change) that lets the export split the warm-up into the two columns.
- **Alternative (rejected):** infer the split from the `block` label — not
  guaranteed to carry mobility/activation, and the category already models it.

### Shared layout model, two renderers
Extract a small pure helper that turns a `RoutineTemplate` into a **view model**:
`{ header, sessions: [{ name, warmupPrescription, mobility[], activation[],
blocks: [{ rows: [{ exercise, perWeek: [{kg,reps,series}], notes }], seriesByWeek }],
finalBlock: [{ exercise, kg, reps, series, notes }], weekCount }], considerations }`.
Both `routinePdf.ts` and `routineXlsx.ts` consume this view model so the grouping
logic (block grouping, per-week columns, mobility/activation split, final-block
detection) lives in one tested place.
- **Why:** avoids duplicating the non-trivial grouping in two renderers and keeps
  smoke tests focused on structure.

### Per-week columns (US-018)
`weekCount = clamp(durationWeeks ?? 1, 1, MAX)`. For each entry, the per-week
`kg/reps/series` come from its `weeks` (matched by week number); when an entry has
no weeks, its base `kg/reps/series` fill week 1 and the rest are blank. The
**SERIES value is shown once per block per week** (merged in Excel, drawn once in
the PDF), matching the reference where a superset shares its series count.

### Final block detection
A `main` block whose `block` label equals `final`/`bloque final`
(case-insensitive) becomes the `EJERCICIOS BLOQUE FINAL` section: a single
`KG/REPS/SERIES` (its base values) + `OBSERVACIONES` (notes), not a per-week grid.
If absent, the section is omitted.

### PDF rendering (PDFKit, A4 landscape)
- Colors: session bar fill `#C5DFB4` (black text), accent lime `#6FAC46`, brand
  band + table/section headers `#000000` with white text.
- Brand band drawn with `doc.rect(...).fill()` + positioned text; the bear logo
  embedded from `backend/src/infrastructure/pdf/assets/logo.png` via `doc.image`.
- The exercises table is drawn as a manual grid (compute column x-positions for
  the name column + `weekCount × 3` value columns); row backgrounds/borders via
  rects; SERIES cell drawn once vertically centered per block.
- Long tables paginate, repeating the session/week header; when `weekCount` is
  large, column widths and font shrink to a floor before paginating a second
  week-block.

### Excel rendering (ExcelJS)
- One worksheet per session (existing sheet-name sanitization kept) plus a
  `Consideraciones` sheet; a brand header in the top rows (merged cells, black
  fill + white bold, logo added via `workbook.addImage`).
- Week header + `KG/REPS/SERIES` groups as merged header cells; block SERIES
  merged across the block's rows per week; fills/borders match the palette.

### i18n
Reuse the builders' existing `Labels` maps; add the new keys (`preparacion`,
`mobility`, `activation`, `weekOf`, `week`, `finalBlock`, `observations`,
`plan`, `startDate`, `client`, `considerations`). Brand strings
(`SPORT – FITNESS`, `ENTRENAMIENTO FÍSICO INTEGRAL`, `PF: …`, `CEL: …`) are static
constants, identical in es/en.

## Risks / Trade-offs

- **Manual PDF grid math is fiddly** → centralize column geometry in the view
  helper + constants; keep smoke tests asserting the structural text is present.
- **Large `durationWeeks` overflow** → clamp + shrink + paginate (above);
  realistic plans are ~4 weeks.
- **Logo binary in the backend** → commit a copy of the existing brand logo under
  the backend; it is the same asset already shipped in the frontend.
- **View-model helper diverging from renderers** → it is the single source both
  renderers read; unit-test the helper's grouping (blocks, per-week, split,
  final-block).

## Migration Plan

- Purely additive/refactor: new view-model helper + logo asset, rewritten
  builders, and an `exerciseCategory` field on the entry + repo select. No DB
  migration, no endpoint/spec change. Rollback = revert the builder/helper files.
