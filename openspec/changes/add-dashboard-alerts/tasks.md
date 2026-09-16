## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-dashboard-alerts` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: Domain helper (TDD)

- [x] 1.1 Write failing unit tests for a `coveredPeriodEnd(payments, now?)` helper in `domain/models/Payment.ts` (returns the end-of-month Date of the most recent covered period; `null` when there are no payments), then implement it and refactor `computePaymentStatus` to reuse it (keep existing tests green)

## 2. Backend: Read-model repository (TDD)

- [x] 2.1 Define `domain/repositories/DashboardRepository.ts` with `getActiveClientsOverview(): Promise<DashboardClientRow[]>` and the `DashboardClientRow` read shape (`id`, `firstName`, `lastName`, `payments: { periodMonth, periodYear }[]`, `activeRoutine: { startDate, durationWeeks } | null`)
- [x] 2.2 Write failing unit tests for `PrismaDashboardRepository` (maps the Prisma result to `DashboardClientRow`: active clients only, payment periods included, active routine dates or `null`), then implement it with a single `findMany` (status `active`, include payments periods + `routines where status='active' take 1`)

## 3. Backend: Dashboard service (TDD)

- [x] 3.1 Write failing unit tests for `dashboardService.getDashboard(now, dueSoonDays)` classification: overdue (status `overdue`), due-soon (up to date but covered period ends within the window), no-payments (status `no_payments`, its own group), expiring routines (expired or end date within the window), and a client with no alerts omitted
- [x] 3.2 Implement `application/services/dashboardService.ts` reusing `computePaymentStatus`/`coveredPeriodEnd` and `RoutineTemplate.endDate`/`isExpired`, returning `{ overduePayments, paymentsDueSoon, noPayments, expiringRoutines }` with `{ clientId, clientName, ... }` items

## 4. Backend: Controller, route & wiring (TDD)

- [x] 4.1 Implement `presentation/controllers/dashboardController.ts` (`get` → `200 { success, data }`) and `routes/dashboardRoutes.ts` (`GET /` behind `authMiddleware`); wire `app.use('/api/dashboard', ...)` in `index.ts`, reading `DASHBOARD_DUE_SOON_DAYS` (default 5)
- [x] 4.2 Write integration tests (supertest) for the route: 200 with the three groups for an authenticated request; 401 when unauthenticated
- [x] 4.3 Add `DASHBOARD_DUE_SOON_DAYS` to `backend/.env.example` with a comment

## 5. Frontend: Dashboard page

- [x] 5.1 Add `services/dashboardService.ts` (`get()` returning the three typed groups) with a unit test
- [x] 5.2 Implement `components/AlertList.tsx` (one group: title, count, items with a link) with a unit test
- [x] 5.3 Implement `pages/DashboardPage.tsx` (replaces the inline placeholder in `App.tsx`): keep the "Panel" heading, render the four groups with counts/empty states, payment alerts (overdue / due soon / no payments) linking to `/clients/:id/payments` and routine alerts to `/clients/:id/routine`; add `dashboard` i18n keys to `es.json`/`en.json`
- [x] 5.4 Wire `DashboardPage` into `App.tsx` at `/` (behind `ProtectedRoute` + `AppLayout`), removing the placeholder; keep existing tests green (adjust the auth/landing expectations if needed while preserving the "Panel" heading)

## 6. Review Unit Tests (MANDATORY)

- [x] 6.1 Review all unit tests written in sections 1-5 against `docs/backend-standards.md`/`docs/frontend-standards.md` (AAA pattern, happy path/error/edge coverage) and fill any gaps

## 7. Run Unit Tests and Verify Database State (MANDATORY)

- [x] 7.1 Capture the pre-test database baseline (`Client`, `Payment`, `Exercise` row counts)
- [x] 7.2 Run the targeted unit tests for the dashboard repository, service, controller, and frontend
- [x] 7.3 Run the full backend test suite (`npm test`) and the frontend suite (`npx vitest run`); record pass/fail counts and backend coverage (90%+ threshold)
- [x] 7.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [x] 7.5 Create the report `openspec/changes/add-dashboard-alerts/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`
- [x] 7.6 Mark this step complete only once tests pass and the report file exists

## 8. Manual Endpoint Testing with curl (MANDATORY)

- [x] 8.1 Ensure the backend server and the Dockerized PostgreSQL database are running; log in; create throwaway clients covering each case (overdue payment, due-soon payment, no payment, expiring routine, and a no-alert client)
- [x] 8.2 Test `GET /api/dashboard` → 200 and verify each client lands in the correct group (overdue / due soon / no payments / expiring routine) and no-alert clients are absent
- [x] 8.3 Verify `no_payments` clients appear in the no-payments group and not in the overdue group; verify `GET /api/dashboard` without a session cookie → 401
- [x] 8.4 Restore the database (delete the throwaway clients [cascade] and their payments/routines, reset sequences, clear the admin reset token) and document all curl commands/responses in `openspec/changes/add-dashboard-alerts/reports/YYYY-MM-DD-step-8-curl-endpoint-testing.md`

## 9. E2E Testing with Playwright (MANDATORY)

- [x] 9.1 Ensure both servers are running (backend with `RATE_LIMIT_DISABLED=true`); run E2E serially (`--workers=1`)
- [x] 9.2 Add an E2E spec: log in, land on the dashboard (heading "Panel"), create a client with an overdue payment, and verify the client appears in the overdue group with a working link to their payments
- [x] 9.3 Run the full E2E suite to confirm no regressions; restore any test data created during the run and document outcomes in `openspec/changes/add-dashboard-alerts/reports/YYYY-MM-DD-step-9-e2e-testing.md`

## 10. Documentation (MANDATORY)

- [x] 10.1 Update `docs/api-spec.yml` with the `GET /api/dashboard` endpoint (response schema for the three groups) and add a `Dashboard` tag
- [x] 10.2 Verify `docs/data-model.md` needs no change (no schema change) — confirm and note it
- [x] 10.3 Update `planning/user-stories-backlog.md` US-009 status to `in-openspec`, linking to this change
- [x] 10.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-009 content
