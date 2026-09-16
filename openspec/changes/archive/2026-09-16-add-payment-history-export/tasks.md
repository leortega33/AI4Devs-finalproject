## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-payment-history-export` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: Dependency

- [x] 1.1 Add `pdfkit` as a backend dependency (`cd backend && npm install pdfkit`) plus its type declarations `@types/pdfkit` as a devDependency (pdfkit 0.20.x ships no usable types), and confirm the app still builds (`npm run build`)

## 2. Backend: PDF builder module (TDD)

- [x] 2.1 Write failing unit tests for `infrastructure/pdf/paymentHistoryPdf.ts` (`buildPaymentHistoryPdf`): pipes to an in-memory buffer and produces a non-empty PDF (starts with the `%PDF` signature) for a client with several payments; still produces a valid non-empty PDF for a client with no payments; respects the `lang` argument (`es` default, `en`) without throwing
- [x] 2.2 Implement `buildPaymentHistoryPdf(data, lang?)` returning a `PDFKit.PDFDocument` (header with client name + derived status, a table of payments newest-first with date/period/method/amount, an empty-history note when there are none, `es`/`en` label map defaulting to `es`); do NOT call `.end()` inside the builder

## 3. Backend: Service export data (TDD)

- [x] 3.1 Write failing unit tests for `PaymentService.getExportData(clientId)` (returns `{ client, payments, status }` with payments newest-first and the derived status; throws `ClientNotFoundError` for an unknown client)
- [x] 3.2 Implement `getExportData` reusing `ensureClientExists`, the client repository (for the name), `findByClient`, and `computePaymentStatus`

## 4. Backend: Controller + route (TDD)

- [x] 4.1 Implement `PaymentController.exportHistory`: resolve `getExportData` first (so an unknown client returns 404 before any streaming), then set `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="payment-history-<clientId>.pdf"`, pipe the document to the response, and call `doc.end()`; read the optional `lang` query param
- [x] 4.2 Add the route `GET /export` to the client-scoped router in `routes/paymentRoutes.ts` (`/api/clients/:clientId/payments/export`, behind `authMiddleware`)
- [x] 4.3 Write integration tests (supertest) for the route: 200 with `Content-Type: application/pdf` and a non-empty body for an existing client; 404 for an unknown client; 401 when unauthenticated

## 5. Frontend: Export action

- [x] 5.1 Add `paymentService.exportPdf(clientId, lang)` (GET `/${clientId}/payments/export?lang=<lang>` on `clientsApi` with `responseType: 'blob'`) with a unit test (mocks the request and asserts the blob URL download is triggered)
- [x] 5.2 Add an "Export PDF" button to `ClientPaymentsPage` (next to "Register payment"), disabled while a download is in flight, passing the current `i18n.language`; add the `payments.exportPdf` i18n key to `es.json`/`en.json`
- [x] 5.3 Update/extend `ClientPaymentsPage` unit tests to cover the export button (renders, click calls the service); keep existing tests green

## 6. Review Unit Tests (MANDATORY)

- [x] 6.1 Review all unit tests written in sections 2-5 against `docs/backend-standards.md`/`docs/frontend-standards.md` (AAA pattern, happy path/error/edge coverage) and fill any gaps

## 7. Run Unit Tests and Verify Database State (MANDATORY)

- [x] 7.1 Capture the pre-test database baseline (`Payment`, `Client`, `Exercise` row counts)
- [x] 7.2 Run the targeted unit tests for the PDF module, service, controller, and frontend export
- [x] 7.3 Run the full backend test suite (`npm test`) and the frontend suite (`npx vitest run`); record pass/fail counts and backend coverage (90%+ threshold)
- [x] 7.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [x] 7.5 Create the report `openspec/changes/add-payment-history-export/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`
- [x] 7.6 Mark this step complete only once tests pass and the report file exists

## 8. Manual Endpoint Testing with curl (MANDATORY)

- [x] 8.1 Ensure the backend server and the Dockerized PostgreSQL database are running; log in; create a throwaway client and register a couple of payments
- [x] 8.2 Test `GET /api/clients/:clientId/payments/export` → 200, `Content-Type: application/pdf`, saving the body to a file and confirming it is a valid non-empty PDF (`file`/`%PDF` header)
- [x] 8.3 Test the export for a client with no payments → still a valid PDF; test `?lang=en` returns a valid PDF; export for an unknown client → 404; export without a session cookie → 401
- [x] 8.4 Restore the database (delete the throwaway client [cascade] and its payments, reset sequences, clear the admin reset token) and document all curl commands/responses in `openspec/changes/add-payment-history-export/reports/YYYY-MM-DD-step-8-curl-endpoint-testing.md`

## 9. E2E Testing with Playwright (MANDATORY)

- [x] 9.1 Ensure both servers are running; run E2E serially (`--workers=1`)
- [x] 9.2 Log in, create a client, open its payments page, register a payment, click "Export PDF", and verify the browser download is triggered (a non-empty `.pdf` file)
- [x] 9.3 Restore any test data created during the run and document outcomes in `openspec/changes/add-payment-history-export/reports/YYYY-MM-DD-step-9-e2e-testing.md`

## 10. Documentation (MANDATORY)

- [x] 10.1 Update `docs/api-spec.yml` with the export endpoint (`GET /api/clients/{clientId}/payments/export`, producing `application/pdf`, with the optional `lang` query param) and add a `Payments` note if needed
- [x] 10.2 Verify `docs/data-model.md` needs no change (no schema change) — confirm and note it
- [x] 10.3 Update `planning/user-stories-backlog.md` US-008 status to `in-openspec`, linking to this change
- [x] 10.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-008 content
