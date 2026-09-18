## Why

When registering a payment (US-007), the "Registrar pago" dialog defaults the
period to the **current month** regardless of what the client already paid. This
lets the trainer create incoherent entries (e.g. a November period while the
client only paid through July, or paying the same month twice). US-015 pre-fills
the period with the **next month the client owes** and keeps the payment date at
today, reducing mistakes while staying fully editable for late/advance payments.

## What Changes

- The "Registrar pago" dialog defaults the **period** to the next owed period:
  the client's most recent covered period **+ 1 month**, or the **current month**
  when they have no payments / are up to date with a period in the future.
- The **payment date** keeps defaulting to today (unchanged).
- The period fields stay **editable** for late or advance payments.
- Add an **optional coherence warning** when the chosen period is clearly
  inconsistent with the payment date (e.g. a period far in the future relative to
  when it is being paid). The warning does not block saving.
- The derived up-to-date/overdue status logic (covered period, US-007) is
  **unchanged**.

## Capabilities

<!-- skip_specs: true. Frontend-only UX improvement to the payment form defaults +
     a non-blocking warning, using data (the client's payments) already loaded on
     the payments page. No new/changed backend behavior, endpoint, or data model,
     so no spec delta. -->

## Impact

- Frontend only. No backend/API/data-model/migration change.
- Modified: `components/PaymentFormDialog.tsx` (default-period logic + warning),
  `pages/ClientPaymentsPage.tsx` (pass the current payments to the dialog), a new
  helper to compute the next owed period, `i18n` locale files (warning text).
- Tests: extend `PaymentFormDialog` unit tests + a unit test for the helper.

## Scope Notes

- "Next owed" is computed as **most recent covered period + 1 month**, or current
  month if none. A full gap/arrears analysis from the client's join date is out
  of scope.
- Editing an existing payment still pre-fills that payment's own period (no change
  to edit behavior).
