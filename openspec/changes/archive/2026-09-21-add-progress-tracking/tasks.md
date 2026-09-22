## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-progress-tracking` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data Model + Migration

- [x] 1.1 Add a `ProgressEntry` model to `schema.prisma` (`id`, `clientId` FK → `Client` `onDelete: Cascade`, `date`, optional `weightKg`/`bodyFatPercent`/`chestCm`/`waistCm`/`hipsCm`/`armCm`/`thighCm` (Float?), `note String?`, `createdAt @default(now())`) with `@@index([clientId, date])`; add the `progressEntries` relation on `Client`
- [x] 1.2 Create the migration (`prisma migrate dev --name add_progress_entry`) and regenerate the client; confirm existing rows are untouched

## 2. Backend progress (TDD)

- [x] 2.1 Add the `ProgressEntry` domain model (with a unit test) and a `ProgressEntryRepository` interface (`create`, `listByClientId` newest first, `findById`, `delete`) + its Prisma implementation with a repository test
- [x] 2.2 Add `progressSchema` to the validator (`date` optional coerced; each metric non-negative optional; `note` optional `max(500)`; at least one metric required) + `validateProgress`; add validator tests (accepts a subset, defaults, empty rejected, negative rejected) — start failing
- [x] 2.3 Add a `ProgressService` (`record` requiring ≥1 metric and defaulting the date to now; `list` with the `{ latestWeightKg, weightChangeKg, entryCount }` summary; `remove` with `ProgressEntryNotFoundError`; ensure the client exists) with unit tests (record, list newest-first + summary/weight-delta math incl. entries without weight, empty summary, empty-entry rejected, not-found on record and delete) — start failing
- [x] 2.4 Add the controller + nested route `createClientProgressRoutes` (`POST /`, `GET /`, `DELETE /:id`) mounted at `/api/clients/:clientId/progress` (auth-protected); map `ProgressEntryNotFoundError` to 404 in the error handler; wire it in `index.ts`; add the route test (register + list+summary shape, delete, 400, 401, 404)
- [x] 2.5 Run the backend suite (`npm test`); keep everything green

## 3. Frontend progress (TDD)

- [x] 3.1 Add a `progressService` (`list`, `create`, `remove`) + types (`ProgressEntry`, `ProgressSummary`)
- [x] 3.2 Add a `ClientProgressPage` (summary panel + table + **Registrar medición** dialog defaulting to today with the optional metric fields + note + delete action with confirm, using a plain MUI `Table`); add the route in `App.tsx` and a **progress** action icon on the client list; add `progress.*` and `clients.actions.progress` i18n keys (es/en); add the page test (record an entry, summary shows, delete an entry) — start failing
- [x] 3.3 Run `npx vitest run` + `npm run build`; keep everything green

## 4. Review Unit Tests (MANDATORY)

- [x] 4.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (summary/delta math, at-least-one-metric rule, render, a11y) and fill any gaps

## 5. Run Unit Tests and Verify State (MANDATORY)

- [x] 5.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 5.2 Record `Client`/`ProgressEntry` counts before/after (unit tests use mocks; no DB writes)
- [x] 5.3 Create the report `openspec/changes/add-progress-tracking/reports/YYYY-MM-DD-step-5-unit-test-and-verification.md`

## 6. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 With the backend running and an authenticated cookie: record two entries for a client (one with weight only, one with several metrics + a note on an earlier date), `GET` the progress and confirm newest-first order and the summary (`latestWeightKg`, `weightChangeKg`, `entryCount`); delete one and confirm it is gone; confirm 400 for an empty entry and a negative metric, 401 without auth, and 404 for a non-existent client. Document commands + outcomes in `openspec/changes/add-progress-tracking/reports/YYYY-MM-DD-step-6-curl-endpoint-testing.md`

## 7. Manual Visual + E2E Testing (MANDATORY)

- [x] 7.1 In the browser: open a client's progress, record a measurement, verify it appears with the updated summary, and delete it. Capture notes in `openspec/changes/add-progress-tracking/reports/YYYY-MM-DD-step-7-visual-verification.md`
- [x] 7.2 Add a progress E2E (record an entry, assert it lists with the summary, delete it); run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in a step-7 E2E report

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `docs/api-spec.yml` with the progress endpoints and schemas
- [x] 8.2 Update `docs/data-model.md` with the `ProgressEntry` entity
- [x] 8.3 Update `planning/user-stories-backlog.md` US-026 status to `in-openspec`, linking to this change
- [x] 8.4 On feature close: update `readme.md` §1.3 (progress page) and `prompts.md` with this work
