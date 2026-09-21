## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-attendance-tracking` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data Model + Migration

- [x] 1.1 Add an `Attendance` model to `schema.prisma` (`id`, `clientId` FK → `Client` `onDelete: Cascade`, `checkInAt`, `note String?`, `createdAt @default(now())`) with `@@index([clientId, checkInAt])`; add the `attendances` relation on `Client`
- [x] 1.2 Create the migration (`prisma migrate dev --name add_attendance`) and regenerate the client; confirm existing rows are untouched

## 2. Backend attendance (TDD)

- [x] 2.1 Add the `Attendance` domain model (with a unit test) and an `AttendanceRepository` interface (`create`, `listByClientId` newest first, `findById`, `delete`) + its Prisma implementation with a repository test
- [x] 2.2 Add `attendanceSchema` to the validator (`checkInAt` optional ISO datetime, `note` optional `max(500)` → null when empty) with validator tests (defaults, oversized note rejected) — start failing
- [x] 2.3 Add an `AttendanceService` (`record`, `list` with the `{ total, thisMonth, last30Days, lastCheckInAt }` summary, `remove`; ensure the client exists; `AttendanceNotFoundError` for a missing check-in) with unit tests (record defaults to now, list newest first + summary math across month/30-day boundaries, empty summary, not-found on record and delete) — start failing
- [x] 2.4 Add the controller + nested route `createClientAttendanceRoutes` (`POST /`, `GET /`, `DELETE /:id`) mounted at `/api/clients/:clientId/attendance` (auth-protected); wire it in `index.ts`; add the route test (register + list+summary shape, delete, 401, 404)
- [x] 2.5 Run the backend suite (`npm test`); keep everything green

## 3. Frontend attendance (TDD)

- [x] 3.1 Add an `attendanceService` (`list`, `create`, `remove`) + types (`Attendance`, `AttendanceSummary`)
- [x] 3.2 Add a `ClientAttendancePage` (summary panel + list + **Registrar asistencia** dialog defaulting to today + optional note + delete action with confirm); add the route in `App.tsx` and an **attendance** action icon on the client list; add `attendance.*` and `clients.actions.attendance` i18n keys (es/en); extend/add the page test (register a check-in, summary shows, delete an entry) — start failing
- [x] 3.3 Run `npx vitest run` + `npm run build`; keep everything green

## 4. Review Unit Tests (MANDATORY)

- [x] 4.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (summary math, newest-first, render, a11y) and fill any gaps

## 5. Run Unit Tests and Verify State (MANDATORY)

- [x] 5.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 5.2 Record `Client`/`Attendance` counts before/after (attendance grows only when check-ins are recorded in tests, which use mocks)
- [x] 5.3 Create the report `openspec/changes/add-attendance-tracking/reports/YYYY-MM-DD-step-5-unit-test-and-verification.md`

## 6. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 6.1 With the backend running and an authenticated cookie: record two check-ins for a client (one with the default time, one with a chosen date + note), `GET` the attendance and confirm newest-first order and the summary (total/thisMonth/last30Days/lastCheckInAt); delete one and confirm it is gone; confirm 401 without auth, 404 for a non-existent client, and 400 for an oversized note. Document commands + outcomes in `openspec/changes/add-attendance-tracking/reports/YYYY-MM-DD-step-6-curl-endpoint-testing.md`

## 7. Manual Visual + E2E Testing (MANDATORY)

- [x] 7.1 In the browser: open a client's attendance, register a check-in, verify it appears with the updated summary, and delete it. Capture notes in `openspec/changes/add-attendance-tracking/reports/YYYY-MM-DD-step-7-visual-verification.md`
- [x] 7.2 Add an attendance E2E (register a check-in, assert it lists with the summary, delete it); run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in a step-7 E2E report

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `docs/api-spec.yml` with the attendance endpoints and schemas
- [x] 8.2 Update `docs/data-model.md` with the `Attendance` entity
- [x] 8.3 Update `planning/user-stories-backlog.md` US-025 status to `in-openspec`, linking to this change
- [x] 8.4 On feature close: update `readme.md` §1.3 (attendance page) and `prompts.md` with this work
