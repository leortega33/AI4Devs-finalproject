## Context

`ClientsListPage` loads clients via `clientService.list({ search, status })`
(name search + active/inactive are server-side filters). The list response
already includes each client's derived `paymentStatus` (`up_to_date` / `overdue`
/ `no_payments`, US-007), rendered as a chip column. US-014 adds a filter on that
status.

## Goals / Non-Goals

**Goals**
- A payment-status `Select` (all / up to date / overdue / no payments) that
  combines with the existing search and active/inactive filters.

**Non-Goals**
- No backend change (no `paymentStatus` query param); no data-model change.

## Decisions

- Add a `paymentFilter` state (`'all' | ClientPaymentStatus`) and an MUI `Select`
  next to the existing filters in `ClientsListPage`.
- Apply the filter **client-side**: derive `rows = clients.filter(c => filter ===
  'all' || c.paymentStatus === filter)` and feed those to the `DataGrid`. The
  server-side search/status filters still run in `load()`; the payment filter is
  layered on the returned rows (no extra request).
- Add `clients.paymentFilter*` i18n labels (reusing the existing
  `paymentUpToDate` / `paymentOverdue` / `paymentNone` strings for the options).

## Risks / Trade-offs
- Client-side filter only narrows the already-loaded page. At MVP scale (one gym,
  tens–low hundreds of clients, no pagination) this is fine; revisit with a
  backend param if pagination is added.

## Migration Plan
- Additive frontend only. All suites stay green; existing filters unchanged.

## Open Questions
- None (client-side per the enriched US-014).
