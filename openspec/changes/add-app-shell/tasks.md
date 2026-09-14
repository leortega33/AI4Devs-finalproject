## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-app-shell` from `main` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Asset & Theme

- [x] 1.1 Confirm the gym logo is placed at `frontend/src/assets/logo.png` (provided by the user); if missing, proceed with a text brand fallback and note it
- [x] 1.2 Create `theme/theme.ts` (MUI `createTheme` with the brand palette — leaf green primary, near-black AppBar surface, light background — and typography) and apply it via `ThemeProvider` in `main.tsx`

## 2. App Shell

- [x] 2.1 Implement `components/AppLayout.tsx`: a persistent `AppBar` with the brand ("SPORT – FITNESS") + logo, the language switcher, and logout, plus an `<Outlet />` for content; add a unit test
- [x] 2.2 Implement back/home navigation (a `BackButton` and/or breadcrumbs; the brand acts as a home link) with a unit test
- [x] 2.3 Implement a lightweight branded header (logo + name, no nav actions) for the pre-login screens

## 3. Retrofit Screens

- [x] 3.1 Wrap the authenticated routes with `AppLayout` in `App.tsx`; remove the ad-hoc language switcher and logout from `DashboardPage` (now provided by the AppBar)
- [x] 3.2 Add back navigation to the client screens (`ClientsListPage`, `ClientFormPage`) so the user can return to the dashboard/list
- [x] 3.3 Apply the branded header to `LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`

## 4. Update Existing Tests

- [x] 4.1 Update unit tests that locate the language switcher/logout in the dashboard body to find them in the AppBar; keep them green
- [x] 4.2 Add unit tests: shell renders brand/logo (or fallback) and nav controls; back navigation triggers the expected route change

## 5. Frontend: Run Unit Tests and Verify (MANDATORY - AGENT MUST EXECUTE)

- [x] 5.1 Run the full frontend test suite (`npm test`) and confirm all pass
- [x] 5.2 Run the backend test suite to confirm no regression (no backend change) and note the database is untouched
- [x] 5.3 Create the report `openspec/changes/add-app-shell/reports/YYYY-MM-DD-step-5-unit-test-verification.md` (note: curl endpoint testing is N/A — no backend endpoints/DB changes)

## 6. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 Ensure both the frontend and backend servers are running
- [x] 6.2 Verify the AppBar (brand + logo) appears on authenticated screens and the language switcher/logout work from there
- [x] 6.3 Verify back navigation from the clients screens returns to the dashboard/list
- [x] 6.4 Update the existing auth/clients/i18n E2E specs for the relocated controls so they keep passing
- [x] 6.5 Restore any test data created during the run and document outcomes in `openspec/changes/add-app-shell/reports/YYYY-MM-DD-step-6-e2e-testing.md`

## 7. Documentation (MANDATORY)

- [x] 7.1 Update `docs/frontend-standards.md` to document the theme, `AppLayout`, and navigation pattern
- [x] 7.2 Update `ai-specs/agents/frontend-developer.md` to reference MUI (not React Bootstrap) and the app-shell/theme conventions
- [x] 7.3 Update `planning/user-stories-backlog.md` US-011 status to `in-openspec`, linking to this change
- [x] 7.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-011 content (including section 1.3 Diseño y experiencia de usuario)
