## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-notification-bell` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data hook (TDD)

- [x] 1.1 Write a failing unit test for `hooks/useDashboardAlerts` (returns the dashboard + total count from `dashboardService.get()`, mocked; total = sum of the four groups; safe empty state on error)
- [x] 1.2 Implement `hooks/useDashboardAlerts.ts` (fetch on mount + on route change via `useLocation`, expose `{ dashboard, total, loading, reload }`, swallow errors to empty)

## 2. Notification bell component (TDD)

- [x] 2.1 Write failing unit tests for `components/NotificationBell.tsx` (renders the badge count; opens the dropdown on click; lists alerts with links to `/clients/:id/payments` and `/clients/:id/routine`; shows the empty state when there are no alerts) with `dashboardService` mocked
- [x] 2.2 Implement `NotificationBell.tsx` (Badge over a bell IconButton with `aria-label`; Menu with grouped alerts as RouterLink MenuItems; empty state; closes on select) reusing the alert→item mapping shape from `DashboardPage`
- [x] 2.3 Add `notifications` i18n keys to `es.json`/`en.json`

## 3. Integration

- [x] 3.1 Mount `<NotificationBell />` in `components/AppLayout.tsx` top bar (between the language switcher and logout); keep existing controls/nav and the roles/names the tests rely on unchanged
- [x] 3.2 Update the `AppLayout` unit test if needed (only additive assertions), keeping it green

## 4. Review Unit Tests (MANDATORY)

- [x] 4.1 Review the new unit tests against `docs/frontend-standards.md` (role/name queries, happy/empty/error coverage) and fill any gaps

## 5. Run Unit Tests and Verify State (MANDATORY)

- [x] 5.1 Run the full frontend suite (`npx vitest run`) and `npm run build`; run the backend suite (`npm test`) to confirm it is unaffected
- [x] 5.2 No database/backend change — record `Client`/`Payment`/`Exercise` counts before/after as a sanity check (unchanged)
- [x] 5.3 Create the report `openspec/changes/add-notification-bell/reports/YYYY-MM-DD-step-5-unit-test-and-verification.md`

## 6. Manual Visual Verification (replaces the curl step — frontend only)

- [x] 6.1 Run the app, log in, create a client with an overdue payment, and verify the bell shows a badge count and its dropdown lists the alert with a working link; verify the empty state with no alerts; capture notes in `openspec/changes/add-notification-bell/reports/YYYY-MM-DD-step-6-visual-verification.md`

## 7. E2E Testing with Playwright (MANDATORY)

- [x] 7.1 Add/extend an E2E check: after creating an overdue payment, the top-bar bell shows a non-zero badge and its dropdown links to the client; run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in `openspec/changes/add-notification-bell/reports/YYYY-MM-DD-step-7-e2e-testing.md`

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `readme.md` §1.3 (UX walkthrough) to mention the notification bell in the top bar
- [x] 8.2 Update `planning/user-stories-backlog.md` US-013 status to `in-openspec`, linking to this change
- [x] 8.3 On feature close: update `readme.md` deliverables and `prompts.md` with the notification-bell work
