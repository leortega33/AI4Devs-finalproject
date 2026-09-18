## Why

The client payments page (US-007/US-008) shows a chronological list and the
derived status chip, but no at-a-glance summary. To answer "how much has this
client paid and which periods are covered?" the trainer has to scan the whole
list. US-016 adds a small summary panel computed from the payments already loaded.

## What Changes

- Add a **summary panel** above the payment history on the client payments page
  with: **total amount paid**, **payment count**, **covered-period range**
  (first → last period), and the **current derived status** (reusing the existing
  status chip value).
- The summary is computed **client-side** from the payments already listed — no
  backend change and no change to the derived-status rule (US-007).

## Capabilities

<!-- skip_specs: true. Frontend-only aggregation of data the payments page already
     loads, rendered as summary cards. No new/changed backend behavior, endpoint,
     or data model, so no spec delta. -->

## Impact

- Frontend only. No backend/API/data-model/migration change.
- Modified: `pages/ClientPaymentsPage.tsx` (summary cards using the refreshed
  design system), a new pure aggregation helper, `i18n` locale files (labels).
- Tests: unit for the aggregation helper + the summary render.

## Scope Notes

- Fields limited to total / count / period-range / status. "Months owed" (arrears
  from the join date) is deferred (tied to US-015 follow-ups).
- The PDF export (US-008) is **not** changed here; extending it with the summary
  is a separate, optional follow-up.
