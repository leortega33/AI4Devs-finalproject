## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-automated-reminders` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Data Model + Migration

- [x] 1.1 Add a `NotificationType` enum (`payment_overdue`, `payment_due_soon`, `routine_expiring`) and a `NotificationLog` model to `schema.prisma` (`id`, `clientId` FK → `Client` `onDelete: Cascade`, `type`, `referenceKey`, `sentAt @default(now())`) with a unique index on `[clientId, type, referenceKey]`; add the relation on `Client`
- [x] 1.2 Create the migration (`prisma migrate dev --name add_notification_log`) and regenerate the client; confirm existing rows are untouched

## 2. Email provider (TDD)

- [x] 2.1 Extend the `EmailService` interface with `sendEmail(to, subject, body)`; implement it on `ConsoleEmailService` (logs) and have `sendPasswordResetEmail` reuse it; update the existing email tests if needed — keep green
- [x] 2.2 Add `ResendEmailService implements EmailService` (POSTs to the Resend API via `fetch`); add unit tests (throws/no-ops without an API key path per the design; posts the expected payload with a key using a mocked `fetch`) — start failing

## 3. Notification log + reminder service (TDD)

- [x] 3.1 Add a `NotificationLogRepository` interface (`exists`, `record`) and its Prisma implementation; add the repository test
- [x] 3.2 Add a `ReminderService` (deps: `DashboardService`, `ClientRepository`, `NotificationLogRepository`, `EmailService`) with `run(now)` building candidates from the dashboard alerts, resolving each client's email, deduping via the log, composing Spanish messages, sending, recording, and returning `{ sent, skippedNoEmail, skippedDuplicate }`; add unit tests (sends for overdue/due-soon/routine, dedupe skips, skip when no email, summary counts) — start failing
- [x] 3.3 Run the backend suite (`npm test`); keep everything green

## 4. Scheduler + manual trigger (TDD)

- [x] 4.1 Add `node-cron` (+ `@types/node-cron`); add a `startReminderScheduler(service, cron)` helper (schedules `run()`, catches/logs errors) and wire it in `index.ts` behind `REMINDERS_ENABLED`; select the email provider by `RESEND_API_KEY` and inject it into `AuthService` and `ReminderService`
- [x] 4.2 Add a `RemindersController.run` + route `POST /api/reminders/run` (auth-protected); wire it in `index.ts`; add the route test (summary shape + 401)
- [x] 4.3 Update `.env.example` with `REMINDERS_ENABLED`, `REMINDER_CRON`, `RESEND_API_KEY`, `REMINDER_FROM_EMAIL`
- [x] 4.4 Run the backend suite (`npm test`); keep everything green

## 5. Review Unit Tests (MANDATORY)

- [x] 5.1 Review the new tests against `docs/backend-standards.md` (selection/dedupe correctness, provider guard, secret handling, structured logs) and fill any gaps

## 6. Run Unit Tests and Verify State (MANDATORY)

- [x] 6.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 6.2 Record `Client`/`Payment`/`NotificationLog` counts before/after (log grows only when reminders are sent)
- [x] 6.3 Create the report `openspec/changes/add-automated-reminders/reports/YYYY-MM-DD-step-6-unit-test-and-verification.md`

## 7. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 With the backend running (console provider, no `RESEND_API_KEY`) and an authenticated cookie: seed a client with an overdue payment and an email, `POST /api/reminders/run` and confirm the summary reports one sent and the backend logs the email; run it again and confirm the same alert is deduped (skippedDuplicate); confirm a client without an email is skipped; confirm 401 without auth. Document commands + outcomes in `openspec/changes/add-automated-reminders/reports/YYYY-MM-DD-step-7-curl-endpoint-testing.md`

## 8. Documentation (MANDATORY)

- [x] 8.1 Update `docs/api-spec.yml` with the `POST /api/reminders/run` endpoint and summary schema
- [x] 8.2 Update `docs/data-model.md` with the `NotificationLog` entity
- [x] 8.3 Update `planning/user-stories-backlog.md` US-024 status to `in-openspec`, linking to this change
- [x] 8.4 On feature close: update `readme.md` (automated reminders + env) and `prompts.md` with this work
