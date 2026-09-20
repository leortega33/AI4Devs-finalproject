## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-dashboard-kpis` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend KPIs (TDD)

- [x] 1.1 Add `getMonthlyIncome(now: Date): Promise<number>` to `DashboardRepository` and its Prisma implementation (aggregate sum of `Payment.amount` where `paymentDate` in the current month); add/extend the repository test
- [x] 1.2 Extend the `Dashboard` interface with a `kpis` object (`activeClients`, `upToDate`, `overdue`, `noPayments`, `monthlyIncome`) and compute it in `DashboardService.getDashboard` (status counts over active-client rows via `computePaymentStatus`; `monthlyIncome` from the repository); extend `dashboardService.test.ts` (correct counts + monthly income + zero when no payments this month) — start failing
- [x] 1.3 Confirm the controller/route return the `kpis` (same endpoint); extend the dashboard route test to assert the `kpis` shape
- [x] 1.4 Run the backend suite (`npm test`); keep everything green

## 2. Frontend KPI cards (TDD)

- [x] 2.1 Extend the frontend `Dashboard` type with `kpis` (+ `EMPTY_DASHBOARD` default)
- [x] 2.2 Render a row of KPI stat cards on `DashboardPage` (Active clients, Up to date, Overdue, Monthly income) above the alert grid; add `dashboard.kpi.*` i18n keys (es/en); extend the `DashboardPage` test (the KPI figures render) — start failing
- [x] 2.3 Run `npx vitest run` + `npm run build`; keep everything green

## 3. Review Unit Tests (MANDATORY)

- [x] 3.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (aggregation correctness, render, a11y) and fill any gaps

## 4. Run Unit Tests and Verify State (MANDATORY)

- [x] 4.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 4.2 No database change — record `Client`/`Payment`/`Exercise` counts before/after (unchanged)
- [x] 4.3 Create the report `openspec/changes/add-dashboard-kpis/reports/YYYY-MM-DD-step-4-unit-test-and-verification.md`

## 5. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 5.1 With the backend running and an authenticated cookie, `GET /api/dashboard` and confirm the `kpis` object is present with correct `activeClients`, status counts, and `monthlyIncome` for the seeded demo data; confirm 401 without auth. Document commands + outcomes in `openspec/changes/add-dashboard-kpis/reports/YYYY-MM-DD-step-5-curl-endpoint-testing.md`

## 6. Manual Visual + E2E Testing (MANDATORY)

- [x] 6.1 In the browser, verify the dashboard shows the KPI cards with correct figures for the demo data. Capture notes in `openspec/changes/add-dashboard-kpis/reports/YYYY-MM-DD-step-6-visual-verification.md`
- [x] 6.2 Extend the dashboard E2E to assert a KPI card is visible; run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in a step-6 E2E report

## 7. Documentation (MANDATORY)

- [x] 7.1 Update `docs/api-spec.yml` with the `kpis` field on the dashboard response
- [x] 7.2 Update `readme.md` §1.3 to mention the dashboard KPI cards
- [x] 7.3 Update `planning/user-stories-backlog.md` US-020 status to `in-openspec`, linking to this change
- [x] 7.4 On feature close: update `readme.md` deliverables and `prompts.md` with the dashboard-KPI work
