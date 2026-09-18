## Context

`PaymentFormDialog` (US-007) initializes its form via `emptyForm()`, which
defaults the period to `now`'s month/year and the payment date to today. It has no
knowledge of the client's existing payments, so the period default ignores what
is actually owed. `ClientPaymentsPage` already holds the client's `payments`
(and derived `status`) in state and renders the dialog.

The covered period / derived status logic lives in the backend
(`computePaymentStatus` / `coveredPeriodEnd`, US-007) and is unchanged here; the
frontend only needs to mirror the "most recent covered period" idea to pick a
sensible default.

## Goals / Non-Goals

**Goals**
- Pre-fill the period with the next owed month; keep the date at today.
- Keep the period editable; add a non-blocking coherence warning.

**Non-Goals**
- No change to the derived-status rule or any backend code.
- No full arrears analysis from the join date; no auto-advance on save.

## Decisions

- Add a helper `frontend/src/utils/paymentPeriod.ts`:
  - `nextOwedPeriod(payments, now = new Date()): { month, year }` — take the
    payment with the max `(periodYear, periodMonth)`; return that period + 1
    month (rolling year over December). If there are no payments, or the most
    recent covered period is already in the current month or the future, return
    the **current** month/year. This keeps the default at "the next month you'd
    normally charge".
  - `isIncoherentPeriod(period, paymentDate): boolean` — true when the selected
    period starts **more than one month after** the payment date's month (paying
    well in advance) or **more than 12 months before** it (suspiciously old).
- `PaymentFormDialog`: accept a new `payments: Payment[]` prop. In the
  new-payment branch of the open effect, seed `periodMonth`/`periodYear` from
  `nextOwedPeriod(payments)` instead of `now`. The edit branch is unchanged.
- Render a non-blocking `Alert severity="warning"` under the period fields when
  `isIncoherentPeriod` is true for the current form values; it never prevents
  submit.
- `ClientPaymentsPage`: pass `payments={payments}` to the dialog.
- Add one i18n key `payments.form.periodWarning` (es/en).

## Risks / Trade-offs
- The "next owed" heuristic is intentionally simple; it can still be wrong for
  clients with gaps, but the field stays editable and the warning covers the
  clearly-incoherent cases.

## Migration Plan
- Additive frontend only. All suites stay green; the derived status is untouched.

## Open Questions
- None (heuristic fixed above per the enriched US-015).
