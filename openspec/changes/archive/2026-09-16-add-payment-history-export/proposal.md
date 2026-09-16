## Why

The trainer already registers payments and sees a client's list of payments
(US-007), but cannot hand a client a printable receipt or keep an offline copy
of their payment history. Being able to export/print a client's full payment
history as a PDF closes that gap — useful for reviewing past payments, resolving
disputes, and giving a client a receipt.

## What Changes

- Add a PDF export of a client's full payment history: a new
  `GET /api/clients/:clientId/payments/export` endpoint that streams a
  downloadable PDF listing the client's payments (newest first) with the client's
  name and the current derived payment status.
- Add an "Export PDF" action to the existing client payments page that downloads
  that PDF.
- The underlying chronological history list is already provided by US-007's
  "List a client's payments" requirement; no new list endpoint is introduced.
- All new endpoints protected by the existing auth middleware (US-001).

## Capabilities

### New Capabilities
<!-- None: this change extends the existing payments capability. -->

### Modified Capabilities
- `payments`: add the ability to export a client's payment history as a
  downloadable PDF document.

## Impact

- No data-model changes: reuses the existing `Payment` entity (see
  `docs/data-model.md` entity #8). No Prisma migration.
- New dependency: `pdfkit` (lightweight, pure-JS PDF generation) in the backend.
- New backend module `infrastructure/pdf/paymentHistoryPdf.ts` (builds the PDF
  document), a new export action in
  `presentation/controllers/paymentController.ts`, and a new route
  `GET /api/clients/:clientId/payments/export`, behind `authMiddleware`.
- New frontend "Export PDF" button on the existing `ClientPaymentsPage`, plus a
  service method that requests the PDF as a binary blob and triggers a browser
  download.
- `docs/api-spec.yml` gains the export endpoint (producing `application/pdf`).

## Scope Notes

- MVP scope is a simple chronological history plus its PDF export. A
  summary/totals view is Phase 2 and out of scope here.
- The history list itself (data + on-screen table) already exists from US-007;
  this change adds only the PDF export on top of it.
