## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/payment-history-summary` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Payment summary (TDD)

- [x] 1.1 Add unit tests for the helper `utils/paymentSummary.ts`: `summarizePayments` returns zero/empty for no payments; correct `totalPaid`, `count`, and min/max `firstPeriod`/`lastPeriod` for a set of payments; `formatPeriod` zero-pads the month (start failing)
- [x] 1.2 Implement `utils/paymentSummary.ts` (`summarizePayments`, `formatPeriod`)
- [x] 1.3 Extend the `ClientPaymentsPage` unit test: when payments exist, the summary panel shows the total paid, the payment count, and the covered-period range; it is hidden in the empty state (start failing)
- [x] 1.4 Implement in `pages/ClientPaymentsPage.tsx`: a summary card panel (total paid, count, period range) above the `DataGrid`, using the derived status chip; add `payments.summary.*` i18n keys (es/en)
- [x] 1.5 Run `npx vitest run` + `npm run build`; keep everything green

## 2. Review Unit Tests (MANDATORY)

- [x] 2.1 Review the updated tests against `docs/frontend-standards.md` (helper coverage, summary render assertions, a11y) and fill any gaps

## 3. Run Unit Tests and Verify State (MANDATORY)

- [x] 3.1 Run the full frontend suite (`npx vitest run`) and `npm run build`; run the backend suite (`npm test`) to confirm it is unaffected
- [x] 3.2 No database/backend change — record `Client`/`Payment`/`Exercise` counts before/after as a sanity check (unchanged)
- [x] 3.3 Create the report `openspec/changes/payment-history-summary/reports/YYYY-MM-DD-step-3-unit-test-and-verification.md`

## 4. Manual Visual Verification (replaces the curl step — frontend only)

- [x] 4.1 Run the app on the seeded demo data and verify: a client with payments shows the summary panel (correct total, count, period range, status) above the list; a client with no payments shows only the empty state (no summary). Capture notes in `openspec/changes/payment-history-summary/reports/YYYY-MM-DD-step-4-visual-verification.md`

## 5. E2E Testing with Playwright (MANDATORY)

- [x] 5.1 Extend/confirm the payments E2E: after registering a payment, the summary panel reflects it (or confirm the existing spec still passes); run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in `openspec/changes/payment-history-summary/reports/YYYY-MM-DD-step-5-e2e-testing.md`

## 6. Documentation (MANDATORY)

- [x] 6.1 Update `readme.md` §1.3 (UX walkthrough) to mention the payment summary panel
- [x] 6.2 Update `planning/user-stories-backlog.md` US-016 status to `in-openspec`, linking to this change
- [x] 6.3 On feature close: update `readme.md` deliverables and `prompts.md` with the payment-summary work
