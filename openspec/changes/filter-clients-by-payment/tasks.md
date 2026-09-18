## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/filter-clients-by-payment` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Payment-status filter (TDD)

- [x] 1.1 Extend the `ClientsListPage` unit test: selecting a payment-status filter narrows the rows, and it combines with the existing name search / active-inactive filter (start failing)
- [x] 1.2 Implement in `pages/ClientsListPage.tsx`: a `paymentFilter` state + MUI `Select` (all / up to date / overdue / no payments), and client-side row filtering fed to the `DataGrid`; add `clients.paymentFilter*` i18n keys to `es.json`/`en.json`
- [x] 1.3 Run `npx vitest run` + `npm run build`; keep everything green

## 2. Review Unit Tests (MANDATORY)

- [x] 2.1 Review the updated test against `docs/frontend-standards.md` (role/name queries, filter combinations) and fill any gaps

## 3. Run Unit Tests and Verify State (MANDATORY)

- [x] 3.1 Run the full frontend suite (`npx vitest run`) and `npm run build`; run the backend suite (`npm test`) to confirm it is unaffected
- [x] 3.2 No database/backend change — record `Client`/`Payment`/`Exercise` counts before/after as a sanity check (unchanged)
- [x] 3.3 Create the report `openspec/changes/filter-clients-by-payment/reports/YYYY-MM-DD-step-3-unit-test-and-verification.md`

## 4. Manual Visual Verification (replaces the curl step — frontend only)

- [x] 4.1 Run the app, create a few clients with different payment statuses, and verify the filter narrows the list correctly and combines with search/status; capture notes in `openspec/changes/filter-clients-by-payment/reports/YYYY-MM-DD-step-4-visual-verification.md`

## 5. E2E Testing with Playwright (MANDATORY)

- [x] 5.1 Extend the clients E2E (or add a focused check): after creating clients with different payment statuses, selecting the payment filter narrows the list; run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in `openspec/changes/filter-clients-by-payment/reports/YYYY-MM-DD-step-5-e2e-testing.md`

## 6. Documentation (MANDATORY)

- [x] 6.1 Update `readme.md` §1.3 (UX walkthrough) to mention the payment-status filter on the client list
- [x] 6.2 Update `planning/user-stories-backlog.md` US-014 status to `in-openspec`, linking to this change
- [x] 6.3 On feature close: update `readme.md` deliverables and `prompts.md` with the payment-filter work
