# Step 5 Report - E2E Testing with Playwright

- Date: 2026-09-18
- Change: payment-history-summary (US-016)

## Setup

- Servers restarted from a clean DB (0 clients, 0 payments, 11 exercises).
- Backend started with `RATE_LIMIT_DISABLED=true`.
- Command: `npx playwright test --workers=1`.

## Change to the suite

The new summary panel renders the covered-period range as "MM/YYYY – MM/YYYY",
which contains the same "MM/YYYY" substring the payments spec asserted after
registering a payment — causing a strict-mode multiple-match. Fixed the
assertion to target the grid cell specifically:
`page.getByRole('gridcell', { name: 'MM/YYYY' })`.

## Result

- First run: 13 passed, 1 failed (the ambiguous `getByText('MM/YYYY')`).
- After the fix: **14/14 passed** in a single serial run (22.6s). No regressions,
  including both payments specs.

## Cleanup

- E2E-created data removed; demo clients re-seeded (Ana = up_to_date, Carlos =
  overdue 07/2026, Lucía = no_payments). Exercise catalog back to 11.

## Outcome

- Step 5 status: PASS
- Blocking issues: none
