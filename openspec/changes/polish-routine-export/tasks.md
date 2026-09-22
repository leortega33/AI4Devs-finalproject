## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/polish-routine-export` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Expose exercise category + brand asset

- [x] 1.1 Add `exerciseCategory` (`'mobility' | 'activation' | 'main'`) to `RoutineExerciseEntry` (domain model + its unit test) and include `category` in `PrismaRoutineTemplateRepository`'s `exercise` select + `toDomain`; keep the existing routine repository/service tests green
- [x] 1.2 Copy the brand bear logo to `backend/src/infrastructure/pdf/assets/logo.png` (same asset as `frontend/src/assets/logo.png`); ensure it is bundled (not gitignored)

## 2. Shared export view model (TDD)

- [x] 2.1 Add a pure helper `infrastructure/export/routineExportModel.ts` that maps a `RoutineTemplate` (+ client name) to the view model: header (client, startDate), per session `{ warmupPrescription, mobility[], activation[], blocks:[{ rows:[{ exercise, perWeek:[{kg,reps,series}], notes }], seriesByWeek }], finalBlock[], weekCount }`, and considerations; split warm-up by `exerciseCategory`, group `main` entries by `block`, derive per-week values from `weeks` (fallback base in week 1), detect the `final` block, and clamp `weekCount` from `durationWeeks`
- [x] 2.2 Add unit tests for the helper: warm-up split (mobility/activation), block grouping + merged series per week, per-week fallback when no weeks, final-block detection + omission when absent, weekCount clamp — start failing, then implement

## 3. PDF renderer (TDD)

- [x] 3.1 Rewrite `infrastructure/pdf/routinePdf.ts` to A4 landscape consuming the view model: brand band (`#000000`/white) + embedded logo, `PLAN DE ENTRENAMIENTO` + client/date, green `SESIÓN` bar (`#C5DFB4`), week header, `PREPARACIÓN PARA EL MOVIMIENTO` + prescription, two-column MOVILIDAD/ACTIVACIÓN, per-week `KG/REPS/SERIES` grid with SERIES drawn once per block, `EJERCICIOS BLOQUE FINAL` + `OBSERVACIONES`, and a considerations page; paginate/shrink for large `weekCount`
- [x] 3.2 Update the PDF smoke test: valid `%PDF` signature + non-empty, and (via the view model or text assertions) the new structure is exercised for a routine with weeks, a block, and a final block — keep green

## 4. Excel renderer (TDD)

- [x] 4.1 Rewrite `infrastructure/xlsx/routineXlsx.ts` consuming the view model: one sheet per session + a `Consideraciones` sheet, brand header rows (merged, black fill/white bold, logo via `addImage`), green session bar, week header + `KG/REPS/SERIES` groups, SERIES merged per block per week, MOVILIDAD/ACTIVACIÓN, BLOQUE FINAL + OBSERVACIONES; palette fills/borders
- [x] 4.2 Update the XLSX smoke test: valid zip/OOXML signature, expected sheets (one per session + Consideraciones), and header cells present — keep green

## 5. i18n labels

- [x] 5.1 Add the new export label keys to both builders' `Labels` maps (es/en): preparación / movilidad / activación / semana / semana de trabajo / bloque final / observaciones / plan / fecha de inicio / cliente / consideraciones; keep brand strings verbatim in both languages

## 6. Review Unit Tests (MANDATORY)

- [x] 6.1 Review the helper + renderer tests against `docs/backend-standards.md` (pure helper coverage, structure assertions, no regressions to the routine repo/service) and fill any gaps

## 7. Run Unit Tests and Verify State (MANDATORY)

- [x] 7.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 7.2 Create the report `openspec/changes/polish-routine-export/reports/YYYY-MM-DD-step-7-unit-test-and-verification.md` (no DB writes; note counts unaffected)

## 8. Manual Export Verification (MANDATORY - AGENT MUST EXECUTE)

- [x] 8.1 With the backend running and an authenticated cookie, assign/seed a routine with multiple weeks, a superset block, and a `final` block; download the PDF and the Excel from the export endpoints; open/convert them and confirm the brand header + logo, green session bars, per-week grid with merged series, MOVILIDAD/ACTIVACIÓN, BLOQUE FINAL, and considerations render correctly against `planning/reference/trainer-plan.pdf`. Save a rendered PNG of the PDF and document outcomes in `openspec/changes/polish-routine-export/reports/YYYY-MM-DD-step-8-export-verification.md`

## 9. Manual Visual + E2E Testing (MANDATORY)

- [x] 9.1 In the browser: from a routine, trigger the PDF and Excel export actions and confirm the downloads succeed (files non-empty). Capture notes in the step-8 report or a step-9 report
- [x] 9.2 Confirm the existing routines export E2E (PDF/Excel download) still passes; run the relevant E2E serially from a clean DB (backend `RATE_LIMIT_DISABLED=true`); reseed demo after

## 10. Documentation (MANDATORY)

- [x] 10.1 Update `planning/user-stories-backlog.md` US-030 status to `in-openspec`, linking to this change
- [x] 10.2 On feature close: update `readme.md` (routine export now matches the trainer's plan format) and `prompts.md` with this work (no `api-spec.yml`/`data-model.md` change — presentation only)
