## Why

The client list already shows each client's derived payment status (US-007), but
the trainer can't filter by it — so finding "who is overdue" means scanning the
whole list. US-014 adds a payment-status filter so the trainer can quickly narrow
the list.

## What Changes

- Add a **payment-status filter** (all / up to date / overdue / no payments) to
  the client list, combining with the existing name search and active/inactive
  filter.
- Since the list response already includes each client's `paymentStatus`
  (US-007), the filter is applied **client-side** — no backend change.

## Capabilities

<!-- skip_specs: true. Frontend-only: an additional client-side filter over data
     the list already returns (`paymentStatus`). No new/changed backend behavior,
     endpoint, or data model, so no spec delta. -->

## Impact

- Frontend only. No backend/API/data-model/migration change.
- Modified: `pages/ClientsListPage.tsx` (a payment-status `Select` + client-side
  filtering of the rows), `i18n` locale files (filter labels).
- Tests: extend `ClientsListPage` unit tests; all suites stay green.

## Scope Notes

- Client-side filter over the already-loaded list (MVP scale). A backend
  `paymentStatus` query param is the alternative if server-side filtering/
  pagination is needed later — out of scope here.
