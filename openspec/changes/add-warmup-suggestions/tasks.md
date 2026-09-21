## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-warmup-suggestions` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend warm-up suggestions (TDD)

- [x] 1.1 Add a `WarmupSuggestionService` (deps: `MedicalFlagsService`, `ExerciseRepository`) with `getSuggestions(clientId)` — derive flagged regions (reusing `MedicalFlagsService`, which enforces client-exists), load `mobility`+`activation` exercises, keep those whose `bodyRegions` intersect a flagged region, and group by region (drop regions with no matches); return `{ regions, suggestions: [{ region, exercises }] }`; add unit tests (grouping, excludes `main`, empty when no flags/matches, not-found) — start failing
- [x] 1.2 Add the controller action + nested route `GET /api/clients/:clientId/warmup-suggestions` (auth-protected); wire the service in `index.ts`; add the route test (shape + 401 + 404)
- [x] 1.3 Run the backend suite (`npm test`); keep everything green

## 2. Frontend suggestions panel (TDD)

- [x] 2.1 Add a `warmupSuggestionService.get(clientId)` + types (`{ regions, suggestions: [{ region, exercises }] }`)
- [x] 2.2 Render a **"Calentamiento sugerido"** panel on `ClientRoutinePage` (grouped by region, localized labels reusing `exercises.regions.*`, exercise names with their media links, empty state); fetch on load; add `clientRoutine.warmup.*` i18n keys (es/en); extend the `ClientRoutinePage` test (panel lists a suggestion; empty state) — start failing
- [x] 2.3 Run `npx vitest run` + `npm run build`; keep everything green

## 3. Review Unit Tests (MANDATORY)

- [x] 3.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (grouping correctness, advisory/non-blocking behavior, render, a11y) and fill any gaps

## 4. Run Unit Tests and Verify State (MANDATORY)

- [x] 4.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 4.2 No database change — record `Client`/`Exercise` counts before/after (unchanged)
- [x] 4.3 Create the report `openspec/changes/add-warmup-suggestions/reports/YYYY-MM-DD-step-4-unit-test-and-verification.md`

## 5. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 5.1 With the backend running and an authenticated cookie: give a client a medical record flagging a region (e.g. "dolor de hombro"), then `GET /api/clients/:clientId/warmup-suggestions` and confirm the mobility/activation exercises for that region are grouped under it and no main-category exercise appears; confirm empty suggestions for a client without flags; confirm 401 without auth and 404 for a missing client. Document commands + outcomes in `openspec/changes/add-warmup-suggestions/reports/YYYY-MM-DD-step-5-curl-endpoint-testing.md`

## 6. Manual Visual + E2E Testing (MANDATORY)

- [x] 6.1 In the browser: give a client a shoulder/knee flag, open their routine, and verify the "Calentamiento sugerido" panel lists the relevant mobility/activation exercises grouped by region (and that assigning/saving still works). Capture notes in `openspec/changes/add-warmup-suggestions/reports/YYYY-MM-DD-step-6-visual-verification.md`
- [x] 6.2 Extend the client-routine E2E to assert the suggestions panel shows a warm-up for a flagged region; run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in a step-6 E2E report

## 7. Documentation (MANDATORY)

- [x] 7.1 Update `docs/api-spec.yml` with the `warmup-suggestions` endpoint and response schema
- [x] 7.2 Update `planning/user-stories-backlog.md` US-023 status to `in-openspec`, linking to this change
- [x] 7.3 On feature close: update `readme.md` §1.3 (suggested warm-up panel) and `prompts.md` with this work
