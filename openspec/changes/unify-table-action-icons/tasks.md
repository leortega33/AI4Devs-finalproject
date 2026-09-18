## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/unify-table-action-icons` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Icon actions across tables (TDD)

- [x] 1.1 Review/extend the unit tests for `ExerciseCatalogPage`, `RoutineTemplatesListPage` and `ClientPaymentsPage`: assert each row action is an icon button with the correct accessible name (`Editar`, `Duplicar`, `Eliminar`) and that clicking it still navigates/triggers the same handler (routines "Duplicar" test must stay green)
- [x] 1.2 Implement `ExerciseCatalogPage`: replace the text "Editar" button with `IconButton` + `Tooltip` (`EditOutlinedIcon`, `aria-label={t('common.edit')}`); narrow the actions column
- [x] 1.3 Implement `RoutineTemplatesListPage`: replace "Editar" + "Duplicar" text buttons with `IconButton`s + `Tooltip` (`EditOutlinedIcon` / `ContentCopyOutlinedIcon`, `aria-label` = same labels); narrow the actions column
- [x] 1.4 Implement `ClientPaymentsPage`: wrap the existing edit/delete `IconButton`s in `Tooltip` (`payments.edit` / `payments.delete`)
- [x] 1.5 Run `npx vitest run` + `npm run build`; keep everything green

## 2. Review Unit Tests (MANDATORY)

- [x] 2.1 Review the updated tests against `docs/frontend-standards.md` (role/name queries, a11y of icon-only buttons, tooltip usage) and fill any gaps

## 3. Run Unit Tests and Verify State (MANDATORY)

- [x] 3.1 Run the full frontend suite (`npx vitest run`) and `npm run build`; run the backend suite (`npm test`) to confirm it is unaffected
- [x] 3.2 No database/backend change — record `Client`/`Payment`/`Exercise` counts before/after as a sanity check (unchanged)
- [x] 3.3 Create the report `openspec/changes/unify-table-action-icons/reports/YYYY-MM-DD-step-3-unit-test-and-verification.md`

## 4. Manual Visual Verification (replaces the curl step — frontend only)

- [x] 4.1 Run the app on the seeded demo data and verify the exercise catalog, routine templates and client payments tables all render icon buttons with tooltips, no horizontal scroll, and each icon triggers the same flow as before; capture notes in `openspec/changes/unify-table-action-icons/reports/YYYY-MM-DD-step-4-visual-verification.md`

## 5. E2E Testing with Playwright (MANDATORY)

- [x] 5.1 Confirm the exercises, routines and payments E2E still pass unchanged (actions are queried by accessible name, which is preserved); run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in `openspec/changes/unify-table-action-icons/reports/YYYY-MM-DD-step-5-e2e-testing.md`

## 6. Documentation (MANDATORY)

- [x] 6.1 Update `readme.md` §1.3 (UX walkthrough) to note the consistent icon actions across all tables
- [x] 6.2 Update `planning/user-stories-backlog.md`: add US-029 (unify table action icons) with status `in-openspec`, linking to this change
- [x] 6.3 On feature close: update `readme.md` deliverables and `prompts.md` with the table-icon-unification work
