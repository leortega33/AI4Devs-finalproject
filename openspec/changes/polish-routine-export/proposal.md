## Why

The routine export (US-017) produces a plain text-list PDF/Excel that does not
resemble the trainer's real training-plan sheet. The trainer wants to print/share
a document that looks like their familiar "SPORT – FITNESS" plan. The reference
layout is captured and all design decisions are resolved (see US-030 in
`planning/user-stories-backlog.md`, reference at
`planning/reference/trainer-plan.pdf`). This is a **presentation-only** redesign
of the existing export builders — no new endpoint, model, or requirement.

## What Changes

- Redesign `routinePdf.ts` (PDFKit) and `routineXlsx.ts` (ExcelJS) so the export
  matches the reference plan:
  - A **brand header** (black band: `PF: MANSILLA LEANDRO` · `SPORT – FITNESS` /
    `ENTRENAMIENTO FÍSICO INTEGRAL` · `CEL: 2604300402`) with the **bear logo**,
    the `PLAN DE ENTRENAMIENTO` title, the client name, and the start date.
  - Per session: a **leaf-green `SESIÓN <name>` bar**, a **week header row**
    (`SEMANA 1..N`), the `PREPARACIÓN PARA EL MOVIMIENTO` warm-up prescription,
    a two-column **MOVILIDAD / ACTIVACIÓN** warm-up list, and a main
    **exercises table** with a `KG/REPS/SERIES` group **per week** and the
    **SERIES cell merged per block** (superset).
  - An **`EJERCICIOS BLOQUE FINAL`** section (single KG/REPS/SERIES +
    `OBSERVACIONES`) and a final **considerations** page from the template's
    general considerations.
- Include the **weekly progression (US-018)** in the export: per-week columns are
  read from each entry's weeks, falling back to the base kg/reps/series in week 1.
- Render in **A4 landscape**; embed the bear logo (new backend asset).
- Add the new section labels to the existing i18n export label sets (es/en),
  keeping the brand strings verbatim in both languages.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
_None — presentation-only. The change sets `skip_specs: true`: no spec-level
behavior changes (the export endpoints, their inputs, and their outputs' file
types are unchanged; only the visual layout of the generated documents changes)._

## Impact

- **Backend (presentation only):** rewrite `infrastructure/pdf/routinePdf.ts`
  (brand header, green/black bars via rects/fills, embedded logo, manual
  column-grid table with per-week groups + merged series, final-block section,
  considerations page) and `infrastructure/xlsx/routineXlsx.ts` (same structure
  via ExcelJS merges/fills/borders). New asset
  `backend/src/infrastructure/pdf/assets/logo.png`.
- **No changes** to the export endpoints, routes, services, domain models, or the
  database.
- **Tests:** extend the existing PDF/XLSX smoke tests to assert the new structure
  (per-week columns, MOVILIDAD/ACTIVACIÓN, BLOQUE FINAL, considerations) while
  keeping the file-signature/sheet checks.
- **Docs:** none required beyond `readme.md`/`prompts.md` on close (no API or
  data-model change).
- **Dependencies:** none new (PDFKit + ExcelJS already present).
