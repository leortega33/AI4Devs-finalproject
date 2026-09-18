## Context

Routine templates are stored as nested `RoutineTemplate` records (sessions →
exercise entries → catalog exercise), fetched fully in one query via
`PrismaRoutineTemplateRepository.findById(id)` and returned by
`RoutineTemplateService.findById(id)` (throws `RoutineTemplateNotFoundError`
when missing). A library template has `clientId = null`; a client's assigned
routine is the same record type with `clientId` set — so a single id-based export
serves both.

The payment history export (US-008) is the pattern to mirror: a `pdfkit` builder
in `infrastructure/pdf/` returning a `PDFKit.PDFDocument` (caller pipes + ends),
a controller action that resolves the data first (so 404 surfaces before
streaming), sets `Content-Type` + `Content-Disposition`, and reads `?lang`; the
route sits behind `createAuthMiddleware`; the frontend service fetches the blob
(`responseType: 'blob'`) and triggers a download via a temporary `<a>`.

Routes live at `/api/routine-templates` (`createRoutineTemplateRoutes`,
`RoutineTemplateController`). `exceljs` is not yet a dependency.

## Goals / Non-Goals

**Goals**
- Two authenticated endpoints exporting a routine by id as PDF and as `.xlsx`.
- Bilingual (es/en) labels; readable, printable output covering sessions,
  warm-up, and each entry's exercise + prescription.
- Frontend export controls on the template list and the client routine page.

**Non-Goals**
- No data-model change; no client-side generation; no styling/theming beyond a
  clean layout; no batch/multi-routine export.

## Decisions

- **PDF** — `infrastructure/pdf/routinePdf.ts`:
  `buildRoutinePdf(routine: RoutineTemplate, lang: PdfLang = 'es'): PDFKit.PDFDocument`,
  mirroring `paymentHistoryPdf.ts` (A4, Helvetica, bilingual `LABELS`). Layout:
  routine name + objective header; then per session (ordered): session name, a
  "warm-up" line (prescription + warm-up-phase entries), then the main-phase
  entries as rows (exercise name, block, kg×reps×series, notes). Returns the doc
  without calling `.end()`.
- **XLSX** — `infrastructure/xlsx/routineXlsx.ts`:
  `async buildRoutineXlsx(routine, lang): Promise<Buffer>` using `exceljs`. One
  worksheet per session (sheet name = session name, de-duplicated/sanitized);
  header row [phase, block, exercise, kg, reps, series, notes] then one row per
  entry (ordered). A routine with no sessions yields a single empty/among-header
  sheet so the workbook is still valid.
- **Service** — add `RoutineTemplateService.getExportData(id)` that returns
  `findById(id)` (keeps controller thin and mirrors payments' `getExportData`).
- **Controller** — `RoutineTemplateController.exportPdf` and `.exportXlsx`:
  resolve the routine first; set headers
  (`application/pdf` / `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)
  and `Content-Disposition: attachment; filename="routine-<id>.pdf|xlsx"`; pipe
  the PDF doc / send the xlsx `Buffer`. Read `?lang` via the existing `parseLang`.
- **Routes** — `GET /:id/export.pdf` and `GET /:id/export.xlsx` on
  `createRoutineTemplateRoutes`, behind the existing auth middleware.
- **Frontend** — `routineTemplateService.exportPdf(id, lang)` and
  `exportExcel(id, lang)` (blob download like `paymentService.exportPdf`); add
  PDF + Excel export icon buttons to the routine list row actions
  (`PictureAsPdfOutlined`, `GridOnOutlined`) with tooltips, and to the client's
  active routine on `ClientRoutinePage`. Add `routines.export*` i18n keys.

## Risks / Trade-offs
- `exceljs` adds bundle/deps weight on the backend only; acceptable for a
  server-side export. Pinned to a current stable version.
- Sheet-name constraints (≤31 chars, no `[]:*?/\`): sanitize/truncate session
  names and disambiguate duplicates.

## Migration Plan
- Additive: new dependency + endpoints + frontend controls. No migration. All
  existing suites stay green; add smoke tests for both builders and a frontend
  test for the export actions.

## Open Questions
- None. Backend export via `pdfkit` + `exceljs`, one id-based endpoint pair for
  both template and client-routine, per the enriched US-017.
