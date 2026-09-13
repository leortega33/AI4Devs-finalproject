## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [ ] 0.1 Create feature branch `feature/add-bilingual-ui` from `main` and verify it is checked out (`git branch --show-current`)
- [ ] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Frontend: i18n Foundation

- [ ] 1.1 Add `react-i18next`, `i18next`, `i18next-browser-languagedetector` to the frontend and verify `npm install` succeeds
- [ ] 1.2 Create `src/i18n/index.ts` (i18next config: stored preference → browser language → Spanish fallback, localStorage persistence) and initialize it in the app entry point
- [ ] 1.3 Create `src/i18n/locales/es.json` and `src/i18n/locales/en.json` with the initial key namespaces (`common`, `auth`, `clients`, `errors`)

## 2. Frontend: Language Switcher

- [ ] 2.1 Implement `components/LanguageSwitcher.tsx` (switch between es/en, persists via i18next) with a unit test
- [ ] 2.2 Place the switcher on the authenticated screens (e.g. the dashboard header), reachable from within the app after login (not on the login page)

## 3. Frontend: Retrofit Auth Screens (US-001)

- [ ] 3.1 Replace hardcoded strings in `LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage` and the dashboard with `t()` keys; add the strings to both locale files
- [ ] 3.2 Map auth error codes (`INVALID_CREDENTIALS`, `INVALID_RESET_TOKEN`, `VALIDATION_ERROR`) to localized messages

## 4. Frontend: Retrofit Client Screens (US-002)

- [ ] 4.1 Replace hardcoded strings in `ClientsListPage`, `ClientFormPage`, `DeactivateClientDialog` with `t()` keys; add the strings to both locale files
- [ ] 4.2 Map client error codes (`DUPLICATE_DNI`, `NOT_FOUND`, `VALIDATION_ERROR`) and the form validation messages to localized text

## 5. Frontend: Update Existing Unit Tests

- [ ] 5.1 Update all existing unit tests that assert on English copy to assert on the Spanish (default) translations, keeping them green; wrap rendered components with the i18n provider as needed
- [ ] 5.2 Add a unit test asserting a representative screen renders no raw translation keys (no missing translations)

## 6. Frontend: Run Unit Tests and Verify (MANDATORY - AGENT MUST EXECUTE)

- [ ] 6.1 Run the full frontend test suite (`npm test`) and confirm all pass
- [ ] 6.2 Run the backend test suite to confirm no regression (no backend change expected) and note that the database is untouched by this change
- [ ] 6.3 Create the report `openspec/changes/add-bilingual-ui/reports/YYYY-MM-DD-step-6-unit-test-verification.md` (note: curl endpoint testing is N/A — this change adds no backend endpoints and no DB changes)

## 7. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [ ] 7.1 Ensure both the frontend and backend servers are running
- [ ] 7.2 Verify the app loads in the browser language (or Spanish fallback) by default
- [ ] 7.3 Switch to the other language via the switcher and verify the interface updates across at least the dashboard and clients screens
- [ ] 7.4 Reload the app and verify the selected language persists
- [ ] 7.5 Update the existing auth/clients E2E specs to use language-appropriate selectors (or set a fixed language) so they keep passing
- [ ] 7.6 Restore any test data created during the run and document outcomes in `openspec/changes/add-bilingual-ui/reports/YYYY-MM-DD-step-7-e2e-testing.md`

## 8. Documentation (MANDATORY)

- [ ] 8.1 Update `docs/frontend-standards.md` to document the i18n setup, key-naming convention, and the English-keys/translated-values rule
- [ ] 8.2 Update `planning/user-stories-backlog.md` US-010 status to `in-openspec`, linking to this change
- [ ] 8.3 On feature close: update `readme.md` and `prompts.md` deliverables with US-010 content
