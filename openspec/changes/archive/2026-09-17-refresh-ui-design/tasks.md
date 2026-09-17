## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/refresh-ui-design` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Theme & typography

- [x] 1.1 Add `@fontsource/inter` and import it in `main.tsx`; update `theme/theme.ts` to use Inter with a refined type scale/weights, keeping the leaf-green brand palette organized as tokens (primary/secondary/success/warning/error, background, divider)
- [x] 1.2 Add subtle MUI component overrides in the theme (`MuiCard`, `MuiPaper`, `MuiChip`, `MuiButton`, default `MuiDataGrid` header/hover/border) and a small elevation/radius scale; structure tokens so a future dark mode only needs a second palette (not shipped)
- [x] 1.3 Run `npm run build` + `npx vitest run` to confirm the theme change keeps everything green

## 2. Reusable primitives (TDD)

- [x] 2.1 Implement `components/PageHeader.tsx` (`{ title, actions?, backTo? }`) with a unit test (renders the title as a heading, renders actions, renders a back control when `backTo` is set)
- [x] 2.2 Implement `components/SnackbarProvider.tsx` + `useSnackbar()` (single MUI `Snackbar`/`Alert`; `notify(message, severity)`) with a unit test (notify shows the message; it can be dismissed); mount the provider once in `main.tsx`/`App`
- [x] 2.3 Implement `components/skeletons/LoadingSkeleton.tsx` (list/table/cards variants) with a unit test (renders the expected number of skeleton rows/cards)

## 3. Navigation: sidebar + top bar (TDD)

- [x] 3.1 Implement `components/Sidebar.tsx` (MUI `Drawer` + `List` of `RouterLink` items: Panel/Clientes/Ejercicios/Rutinas with icons and an active state via `useLocation`, `aria-current="page"`) with a unit test (renders links, marks the active one)
- [x] 3.2 Update `components/AppLayout.tsx`: permanent drawer on `md+`, temporary drawer toggled by a hamburger `IconButton` on mobile; keep the top `AppBar` (brand/home, language switcher, logout); render sidebar + `Outlet` responsively; add `nav` landmark and `aria-label`s; add `nav`/`common` i18n keys to `es.json`/`en.json`
- [x] 3.3 Update the `AppLayout` unit test (and any test asserting nav) to the new structure, keeping role/name-based queries; run `npx vitest run`

## 4. Per-page adoption (behavior-preserving)

- [x] 4.1 `DashboardPage`: render the four alert groups as cards (icon + large count + colored accent), keeping the "Panel" heading, the group titles, and the client links; restyle/wrap `AlertList` without changing its links/semantics; update the dashboard unit test only where markup changed
- [x] 4.2 Adopt `PageHeader` on the internal pages (Clients, Exercises, Routines, Client detail/medical/routine, Payments), preserving current heading text and button names; keep existing tests green
- [x] 4.3 Add `loading` skeletons to the data-fetching pages and fire `useSnackbar` notifications on create/edit/delete and on caught errors; update affected unit tests without weakening assertions
- [x] 4.4 Ensure responsive behavior down to ~360px (sidebar → drawer, DataGrid scroll); no functional change

## 5. Review Unit Tests (MANDATORY)

- [x] 5.1 Review the new/updated unit tests against `docs/frontend-standards.md` (roles/names, no snapshot brittleness, happy/edge coverage) and fill any gaps

## 6. Run Unit Tests and Verify State (MANDATORY)

- [x] 6.1 Run the full frontend suite (`npx vitest run`) and `npm run build`; run the backend suite (`npm test`) to confirm it is unaffected
- [x] 6.2 No database or backend change in this story — record the `Client`/`Payment`/`Exercise` counts before/after as a sanity check (should be unchanged)
- [x] 6.3 Create the report `openspec/changes/refresh-ui-design/reports/YYYY-MM-DD-step-6-unit-test-and-verification.md`

## 7. Manual Visual Verification (replaces the curl step — frontend only)

- [x] 7.1 Run the app (docker/dev), log in, and visually verify: the refreshed theme/font, the sidebar nav (desktop) collapsing to a drawer (mobile), the dashboard cards, `PageHeader` consistency, skeletons on load, and snackbars on create/edit/delete; capture notes (and optionally screenshots) in `openspec/changes/refresh-ui-design/reports/YYYY-MM-DD-step-7-visual-verification.md` — no API/curl applies

## 8. E2E Testing with Playwright (MANDATORY)

- [x] 8.1 Update E2E navigation steps for the sidebar where needed (keep role/name-based selectors); run the full suite serially (backend with `RATE_LIMIT_DISABLED=true`) from a clean DB
- [x] 8.2 Confirm all specs pass; restore any test data and document outcomes in `openspec/changes/refresh-ui-design/reports/YYYY-MM-DD-step-8-e2e-testing.md`

## 9. Documentation (MANDATORY)

- [x] 9.1 Update `readme.md` §1.3 (UX walkthrough) to describe the refreshed navigation (sidebar) and dashboard; adjust §2 wording if the shell description changed
- [x] 9.2 Update `planning/user-stories-backlog.md` US-012 status to `in-openspec`, linking to this change
- [x] 9.3 On feature close: update `readme.md` deliverables and `prompts.md` with the UI-refresh work
