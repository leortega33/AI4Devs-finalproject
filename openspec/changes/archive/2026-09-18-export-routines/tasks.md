## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/export-routines` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend export builders (TDD)

- [x] 1.1 Add `exceljs` to `backend` dependencies (and types if needed); install
- [x] 1.2 Add `infrastructure/pdf/routinePdf.ts` (`buildRoutinePdf(routine, lang)`) mirroring `paymentHistoryPdf.ts` (A4, bilingual labels, per-session warm-up + ordered entries); add a smoke test asserting a non-empty `%PDF-` buffer for a routine with sessions and for an empty routine, and that `lang='en'` does not throw
- [x] 1.3 Add `infrastructure/xlsx/routineXlsx.ts` (`async buildRoutineXlsx(routine, lang): Promise<Buffer>`) using `exceljs` (one worksheet per session, header + entry rows, sanitized sheet names); add a smoke test asserting a non-empty buffer, the XLSX/zip signature (`PK`), and one worksheet per session (and a valid workbook for an empty routine)
- [x] 1.4 Add `RoutineTemplateService.getExportData(id)` returning `findById(id)` (throws not-found); add/extend a service test

## 2. Backend controller + routes (TDD)

- [x] 2.1 Add `RoutineTemplateController.exportPdf` and `.exportXlsx`: resolve the routine first, set `Content-Type` + `Content-Disposition` (`routine-<id>.pdf|xlsx`), read `?lang`, pipe the PDF doc / send the xlsx buffer; add controller/route tests (200 + headers for a valid id, 404 for a missing id, 401 without auth)
- [x] 2.2 Wire `GET /:id/export.pdf` and `GET /:id/export.xlsx` in `createRoutineTemplateRoutes` behind the existing auth middleware
- [x] 2.3 Run the backend suite (`npm test`); keep everything green

## 3. Frontend export controls (TDD)

- [x] 3.1 Add `routineTemplateService.exportPdf(id, lang)` and `exportExcel(id, lang)` (blob download like `paymentService.exportPdf`)
- [x] 3.2 Add PDF + Excel export icon buttons (`PictureAsPdfOutlined`, `GridOnOutlined`, with tooltips) to the routine list row actions and to the client's active routine on `ClientRoutinePage`; add `routines.export*` i18n keys (es/en); extend the relevant unit tests (the export actions call the service)
- [x] 3.3 Run `npx vitest run` + `npm run build`; keep everything green

## 4. Review Unit Tests (MANDATORY)

- [x] 4.1 Review the new backend and frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (smoke coverage, headers, auth, a11y of the export buttons) and fill any gaps

## 5. Run Unit Tests and Verify State (MANDATORY)

- [x] 5.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 5.2 No database change — record `Client`/`Payment`/`Exercise`/`RoutineTemplate` counts before/after as a sanity check (unchanged)
- [x] 5.3 Create the report `openspec/changes/export-routines/reports/YYYY-MM-DD-step-5-unit-test-and-verification.md`

## 6. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 With the backend running and an authenticated cookie, `curl` `GET /api/routine-templates/:id/export.pdf` and `.xlsx` for a seeded routine and confirm: 200, correct `Content-Type` and `Content-Disposition`, and a non-empty body (PDF `%PDF-` / xlsx `PK` signature via `file`/`xxd`); confirm 404 for a missing id and 401 without the auth cookie. Document commands + outcomes in `openspec/changes/export-routines/reports/YYYY-MM-DD-step-6-curl-endpoint-testing.md`

## 7. E2E Testing with Playwright (MANDATORY)

- [x] 7.1 Extend the routines E2E to trigger the PDF and Excel exports (assert a download starts / the request succeeds) for a template; run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in `openspec/changes/export-routines/reports/YYYY-MM-DD-step-7-e2e-testing.md`

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `docs/api-spec.yml` with the two new export endpoints (auth, params, binary responses)
- [x] 8.2 Update `docs/backend-standards.md` to record the new `exceljs` dependency (and its purpose)
- [x] 8.3 Update `readme.md` §1.3 (UX walkthrough) to mention routine PDF/Excel export
- [x] 8.4 Update `planning/user-stories-backlog.md` US-017 status to `in-openspec`, linking to this change
- [x] 8.5 On feature close: update `readme.md` deliverables and `prompts.md` with the routine-export work
