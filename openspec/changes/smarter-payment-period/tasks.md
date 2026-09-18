## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/smarter-payment-period` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Next-owed period default (TDD)

- [x] 1.1 Add unit tests for the new helper `utils/paymentPeriod.ts`: `nextOwedPeriod` returns current month when there are no payments; returns most-recent-covered + 1 month (rolling over December) when there are payments; returns current month when the most recent period is already current/future. Add tests for `isIncoherentPeriod` (advance > 1 month and > 12 months old) (start failing)
- [x] 1.2 Implement `utils/paymentPeriod.ts` (`nextOwedPeriod`, `isIncoherentPeriod`)
- [x] 1.3 Extend `PaymentFormDialog` unit tests: opening for a new payment pre-fills the period from `nextOwedPeriod(payments)` and the date to today; the field stays editable; the coherence warning shows for an incoherent period/date and hides otherwise; editing an existing payment still pre-fills that payment's period (start failing)
- [x] 1.4 Implement `PaymentFormDialog`: accept a `payments` prop, seed the new-payment period from `nextOwedPeriod`, render a non-blocking `Alert` warning via `isIncoherentPeriod`; add `payments.form.periodWarning` i18n key (es/en)
- [x] 1.5 Update `ClientPaymentsPage` to pass `payments={payments}` to the dialog
- [x] 1.6 Run `npx vitest run` + `npm run build`; keep everything green

## 2. Review Unit Tests (MANDATORY)

- [x] 2.1 Review the updated tests against `docs/frontend-standards.md` (helper coverage, dialog default/warning cases) and fill any gaps

## 3. Run Unit Tests and Verify State (MANDATORY)

- [x] 3.1 Run the full frontend suite (`npx vitest run`) and `npm run build`; run the backend suite (`npm test`) to confirm it is unaffected
- [x] 3.2 No database/backend change — record `Client`/`Payment`/`Exercise` counts before/after as a sanity check (unchanged)
- [x] 3.3 Create the report `openspec/changes/smarter-payment-period/reports/YYYY-MM-DD-step-3-unit-test-and-verification.md`

## 4. Manual Visual Verification (replaces the curl step — frontend only)

- [x] 4.1 Run the app on the seeded demo data and verify: opening "Registrar pago" for a client with a covered period pre-fills the next owed month and today's date; for a client with no payments it defaults to the current month; changing the period to a clearly incoherent value shows the warning; saving still works. Capture notes in `openspec/changes/smarter-payment-period/reports/YYYY-MM-DD-step-4-visual-verification.md`

## 5. E2E Testing with Playwright (MANDATORY)

- [x] 5.1 Extend/confirm the payments E2E: registering a payment still works with the new defaults (adjust the spec if it asserted a specific default period); run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in `openspec/changes/smarter-payment-period/reports/YYYY-MM-DD-step-5-e2e-testing.md`

## 6. Documentation (MANDATORY)

- [x] 6.1 Update `readme.md` §1.3 (UX walkthrough) to mention the pre-filled next-owed period and today's date on the payment form
- [x] 6.2 Update `planning/user-stories-backlog.md` US-015 status to `in-openspec`, linking to this change
- [x] 6.3 On feature close: update `readme.md` deliverables and `prompts.md` with the smarter-payment-period work
