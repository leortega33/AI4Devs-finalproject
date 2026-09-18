# Step 7 Report - E2E Testing with Playwright

- Date: 2026-09-18
- Change: export-routines (US-017)

## Setup

- Servers restarted from a clean DB (0 clients, 0 payments, 11 exercises).
- Backend started with `RATE_LIMIT_DISABLED=true`.
- Command: `npx playwright test --workers=1`.

## Change to the suite

Extended `e2e/routines.spec.ts` ("build, list, edit and duplicate a routine
template"): after building a routine, click the row's **Exportar PDF** and
**Exportar Excel** icon buttons and assert a download starts with the expected
filename (`routine-<id>.pdf` / `routine-<id>.xlsx`) via
`page.waitForEvent('download')`.

## Result

- **14/14 passed** in a single serial run (23.4s). No regressions; the routines
  spec now also exercises the PDF and Excel exports end-to-end (download events
  fire with the correct filenames).

## Cleanup

- E2E-created data removed; demo clients re-seeded (Ana = up_to_date, Carlos =
  overdue 07/2026, Lucía = no_payments). Exercise catalog back to 11.

## Outcome

- Step 7 status: PASS
- Blocking issues: none
