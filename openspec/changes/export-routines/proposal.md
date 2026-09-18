## Why

The trainer builds routine templates (US-005) and assigns them to clients
(US-006), but can only view them on screen. To print a clean routine sheet or
share it with a client, US-017 adds **PDF** and **Excel (`.xlsx`)** exports of a
routine — reusing the `pdfkit` approach already built for the payment history
export (US-008) and adding `exceljs` for the spreadsheet.

## What Changes

- Add two authenticated backend endpoints on the existing routine-templates
  capability:
  - `GET /api/routine-templates/:id/export.pdf` — a printable PDF of the routine
    (header + one block per session with its warm-up and ordered exercise
    entries and prescriptions).
  - `GET /api/routine-templates/:id/export.xlsx` — a spreadsheet of the same
    routine (one sheet per session, a row per exercise entry).
- Both work for a **library template** and a **client's assigned routine** (both
  are routine-template records fetched by id).
- Add `exceljs` as a backend dependency; add `infrastructure/pdf/routinePdf.ts`
  and `infrastructure/xlsx/routineXlsx.ts` builders (bilingual labels es/en).
- Add **Export** controls (PDF + Excel) on the routine templates list and on a
  client's assigned routine; wire frontend service methods to download the blob.

## Impact

- Backend: new export endpoints + PDF/XLSX builders + service method + new
  dependency `exceljs`. No data-model/migration change.
- Frontend: `routineTemplateService` export methods + export buttons + i18n keys.
- Docs: `docs/api-spec.yml` (two new endpoints), `docs/backend-standards.md`
  (new `exceljs` dependency), `readme.md`/`prompts.md` on close.

## Scope Notes

- Backend export (consistent with US-008), not client-side generation.
- The PDF/XLSX cover sessions, warm-up prescription, and each entry's exercise
  name, phase, block, kg/reps/series and notes — the routine's structured
  content. No styling beyond a clean, readable sheet.
- One endpoint pair serves both library templates and client routines (same
  record type). No per-client payment data is involved.
