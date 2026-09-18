## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/compact-client-action-icons` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Compact action icons (TDD)

- [x] 1.1 Review the `ClientsListPage` unit test: it must still assert each action by its accessible name (`getByRole('button', { name: 'Editar' | 'Ficha médica' | 'Rutina' | 'Pagos' | 'Desactivar' | 'Reactivar' })`) and that clicking navigates/triggers the same handler; add an assertion that the action controls are `IconButton`s with a tooltip label (start from green, extend as needed)
- [x] 1.2 Implement in `pages/ClientsListPage.tsx`: replace the five text `Button`s in the `actions` column with `IconButton`s wrapped in MUI `Tooltip`, each with `aria-label` equal to the current i18n label (`common.edit`, `clients.actions.medicalRecord/routine/payments/deactivate/reactivate`); use icons `EditOutlined`, `MedicalInformationOutlined`, `FitnessCenterOutlined`, `PaymentsOutlined`, `PersonOffOutlined` (error) / `HowToRegOutlined`; reduce the column `width` (~200px)
- [x] 1.3 Run `npx vitest run` + `npm run build`; keep everything green

## 2. Review Unit Tests (MANDATORY)

- [x] 2.1 Review the updated test against `docs/frontend-standards.md` (role/name queries, a11y of icon-only buttons, tooltip usage) and fill any gaps

## 3. Run Unit Tests and Verify State (MANDATORY)

- [x] 3.1 Run the full frontend suite (`npx vitest run`) and `npm run build`; run the backend suite (`npm test`) to confirm it is unaffected
- [x] 3.2 No database/backend change — record `Client`/`Payment`/`Exercise` counts before/after as a sanity check (unchanged)
- [x] 3.3 Create the report `openspec/changes/compact-client-action-icons/reports/YYYY-MM-DD-step-3-unit-test-and-verification.md`

## 4. Manual Visual Verification (replaces the curl step — frontend only)

- [x] 4.1 Run the app on the seeded demo clients, verify the actions column shows icon buttons with tooltips, no horizontal scroll, tooltips display the correct labels on hover, and each icon triggers the same navigation/deactivate flow as before; capture notes in `openspec/changes/compact-client-action-icons/reports/YYYY-MM-DD-step-4-visual-verification.md`

## 5. E2E Testing with Playwright (MANDATORY)

- [x] 5.1 Confirm the clients E2E still passes unchanged (actions are queried by accessible name, which is preserved); run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in `openspec/changes/compact-client-action-icons/reports/YYYY-MM-DD-step-5-e2e-testing.md`

## 6. Documentation (MANDATORY)

- [x] 6.1 Update `readme.md` §1.3 (UX walkthrough) to mention the compact icon actions with tooltips on the client list
- [x] 6.2 Update `planning/user-stories-backlog.md`: add US-028 (compact client action icons) with status `in-openspec`, linking to this change
- [x] 6.3 On feature close: update `readme.md` deliverables and `prompts.md` with the icon-actions work
