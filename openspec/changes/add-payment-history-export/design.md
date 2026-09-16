## Context

US-008 builds directly on US-007's payments capability. The chronological
history (data + on-screen list) already exists: `PaymentService.listByClient`
returns a client's payments newest-first plus the derived status, and
`ClientPaymentsPage` renders them. What US-008 adds is a **PDF export** of that
history so the trainer can print or hand a client a receipt. No data model
change is needed — this reuses the existing `Payment` entity (US-007).

## Goals / Non-Goals

**Goals**
- Export a client's full payment history as a downloadable PDF (newest first),
  including the client's name and current derived payment status.
- Add an "Export PDF" action to the existing client payments page.
- Keep the endpoint behind the existing auth middleware (US-001).

**Non-Goals**
- No new list/history endpoint — the data already comes from US-007's list.
- No summary/totals view (Phase 2).
- No pixel-perfect/branded template — a clean, readable document is enough for
  the MVP.
- No data-model or migration changes.

## Decisions

### PDF library: `pdfkit`
- Use `pdfkit` (pure-JS, no native/headless-browser dependency) — the lightest
  option, per the backlog's guidance. It streams a `PDFDocument` that can be
  piped straight to the Express response, avoiding temp files.
- Rejected `puppeteer`/headless-Chromium: heavier install, slower, and overkill
  for a simple tabular document.

### Backend structure (DDD layering preserved)
- **Service**: add `PaymentService.getExportData(clientId)` returning
  `{ client, payments, status }`. It reuses `ensureClientExists` (throws
  `ClientNotFoundError` → 404), fetches the client (for the name) and the
  payments (newest first), and computes the status via the existing
  `computePaymentStatus`. This keeps the not-found check *before* any streaming.
- **PDF module**: new `infrastructure/pdf/paymentHistoryPdf.ts` exporting a pure
  builder `buildPaymentHistoryPdf(data, lang?): PDFKit.PDFDocument` that lays out
  the header (client name + status), a table of payments (date, period, method,
  amount), and an empty-history note when there are none. It returns the
  `PDFDocument` **without** calling `.end()`, so the caller controls piping and
  the builder stays unit-testable (pipe to an in-memory buffer).
- **Controller**: add `PaymentController.exportHistory` — it first calls
  `getExportData` (so a missing client surfaces as 404 via `next(error)` before
  headers are sent), then sets `Content-Type: application/pdf` and
  `Content-Disposition: attachment; filename="payment-history-<clientId>.pdf"`,
  pipes the document to `res`, and calls `doc.end()`.
- **Route**: add `GET /` export as `router.get('/export', controller.exportHistory)`
  on the existing client-scoped router (`/api/clients/:clientId/payments`),
  already mounted behind `authMiddleware`.

### Localization of the PDF
- The product is bilingual (Spanish default / English). The PDF is user-facing
  output generated server-side (outside the frontend i18n layer), so the export
  accepts an optional `lang` query param (`es` default, `en` supported). The PDF
  module holds a small `es`/`en` label map (title, column headers, status
  labels). Any unknown value falls back to `es`. Payment amounts/dates are
  formatted with the corresponding locale.

### Frontend
- Add `paymentService.exportPdf(clientId, lang)` using the existing
  `clientsApi` axios instance with `responseType: 'blob'`, requesting
  `/${clientId}/payments/export?lang=<current i18n language>`.
- On the response, create an object URL from the blob and trigger a download
  (temporary `<a download>` element), then revoke the URL.
- Add an "Export PDF" button to `ClientPaymentsPage` next to "Register payment";
  disable it while a download is in flight. Passes the current `i18n.language`.

## Risks / Trade-offs
- **Streaming + error handling**: once the PDF starts streaming, the status code
  can't change. Mitigated by resolving `getExportData` (the only expected error,
  404) *before* setting headers/piping.
- **`pdfkit` types**: ships its own types; add `pdfkit` as a dependency. Font is
  the built-in Helvetica (no extra font assets) to keep the install light.
- **Amount formatting**: amounts are numbers at the domain boundary (US-007);
  formatted with `Intl.NumberFormat` for display only — no currency symbol
  assumptions beyond a plain, locale-formatted number.

## Migration Plan
- Additive only: new dependency (`pdfkit`), one new endpoint, one new backend
  module, one new service method, and frontend additions. No DB migration, no
  breaking changes to existing endpoints.

## Open Questions
- None blocking. Currency symbol/branding on the PDF can be refined later; the
  MVP uses locale-formatted amounts and the built-in font.
