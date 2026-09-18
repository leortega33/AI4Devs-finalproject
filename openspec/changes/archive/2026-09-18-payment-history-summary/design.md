## Context

`ClientPaymentsPage` loads `payments: Payment[]` and a derived `status` from
`paymentService.list`, renders a status chip and a `DataGrid` of the payments (or
an empty-state `Alert`). US-016 adds a summary panel above the list. Each
`Payment` has `amount`, `periodMonth`, `periodYear`. The refreshed design system
(US-012) provides MUI `Card` styling and theme tokens.

## Goals / Non-Goals

**Goals**
- Show total paid, payment count, covered-period range, and current status in a
  compact card panel above the history.

**Non-Goals**
- No backend change; no change to the derived-status rule; no PDF change; no
  arrears/"months owed" computation.

## Decisions

- Add a pure helper `frontend/src/utils/paymentSummary.ts`:
  - `summarizePayments(payments): { totalPaid, count, firstPeriod, lastPeriod }`
    where `firstPeriod`/`lastPeriod` are `{ month, year }` for the min/max covered
    period (by `year*12 + month`), or `null` when there are no payments.
  - A small `formatPeriod({month, year})` → `MM/YYYY` (zero-padded month) for
    display, or reuse the existing period formatting used by the grid.
- `ClientPaymentsPage`: when `payments.length > 0`, render a summary panel of MUI
  `Card`s (total paid, payment count, "period range" first→last) plus the existing
  status chip, above the `DataGrid`. Hidden in the empty state.
- Amount formatting: reuse the current display style of the grid's amount column
  (plain number) to stay consistent; the total is the numeric sum.
- Add `payments.summary.*` i18n keys (es/en): `totalPaid`, `count`,
  `periodRange`, and a title.

## Risks / Trade-offs
- Summary is over the loaded list only (no pagination server-side today), which
  is the full set at MVP scale — correct for now.

## Migration Plan
- Additive frontend only. All suites stay green; the derived status is untouched.

## Open Questions
- None (fields fixed per the enriched US-016).
