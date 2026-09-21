## Context

`DashboardService.getDashboard(now, dueSoonDays)` returns `overduePayments`,
`paymentsDueSoon`, `noPayments`, and `expiringRoutines` (each `{ clientId,
clientName, ... }`) plus KPIs, derived from `DashboardRepository`. `EmailService`
is an interface with `sendPasswordResetEmail`; `ConsoleEmailService` logs it and
is wired in `index.ts` (also used by `AuthService`). `Client` has an optional
`email`. There is no scheduler or notification persistence today.

## Goals / Non-Goals

**Goals**
- Email clients who have a dashboard alert, on a schedule, without duplicates.
- Keep the provider pluggable (Resend in prod, console in dev) and opt-in.
- Make the job runnable on demand for testing/demo.

**Non-Goals**
- No new alert logic (reuse the dashboard rule), no WhatsApp, no template editor,
  no per-client opt-out UI, no changes to the dashboard response.

## Decisions

### Data model
- New Prisma model `NotificationLog`:
  - `id`, `clientId` (FK → `Client`, `onDelete: Cascade`), `type`
    (`NotificationType` enum: `payment_overdue | payment_due_soon |
    routine_expiring`), `referenceKey String`, `sentAt DateTime @default(now())`.
  - Unique index on `[clientId, type, referenceKey]` to enforce dedupe.
- Migration `add_notification_log`. Additive; no backfill.

### Reminder domain
- A `ReminderCandidate = { clientId; clientName; type; referenceKey; email }`.
- `referenceKey`: for payments, `\`${periodYear}-${String(periodMonth).padStart(2,'0')}\``;
  for routines, the routine `endDate` (ISO date). This makes each period/routine a
  distinct, once-only reminder.

### Backend
- Extend `EmailService` with `sendEmail(to: string, subject: string, body: string):
  Promise<void>`; `ConsoleEmailService` logs it. Add
  `ResendEmailService implements EmailService`:
  - constructed with `{ apiKey, fromEmail }`; `sendEmail` POSTs to the Resend API
    (`https://api.resend.com/emails`) via `fetch`. `sendPasswordResetEmail`
    delegates to `sendEmail` with a reset template.
- `NotificationLogRepository` (`exists(clientId, type, referenceKey)`,
  `record(clientId, type, referenceKey)`) + Prisma implementation.
- `ReminderService` (deps: `DashboardService`, `ClientRepository`,
  `NotificationLogRepository`, `EmailService`):
  - `run(now = new Date())`:
    1. `dashboard = await dashboardService.getDashboard(now)`.
    2. Build candidates from `overduePayments` (`payment_overdue`),
       `paymentsDueSoon` (`payment_due_soon`), `expiringRoutines`
       (`routine_expiring`).
    3. For each candidate: resolve the client's `email` (via
       `clientRepository.findById`); if absent → count `skippedNoEmail`. If a log
       already exists → count `skippedDuplicate`. Otherwise compose a Spanish
       subject/body per type, `emailService.sendEmail(...)`, then
       `notificationLog.record(...)` and count `sent`.
    4. Return `{ sent, skippedNoEmail, skippedDuplicate }`.
  - Message content is in Spanish (recipient language); logs are English.
- Scheduler: a `startReminderScheduler(service, cron)` using **node-cron**, called
  in `index.ts` only when `REMINDERS_ENABLED === 'true'`, scheduling
  `reminderService.run()` at `REMINDER_CRON` (default `0 9 * * *`). Errors are
  caught and logged (never crash the process).
- Manual trigger: `RemindersController.run` + route `POST /api/reminders/run`
  (auth-protected) returning `{ success, data: summary }`.
- Provider selection in `index.ts`: if `RESEND_API_KEY` is set, use
  `ResendEmailService({ apiKey, fromEmail: REMINDER_FROM_EMAIL })`; else
  `ConsoleEmailService`. The chosen provider is injected into both `AuthService`
  and `ReminderService`.

### Config / env (`.env.example`)
- `REMINDERS_ENABLED` (default `false`), `REMINDER_CRON` (default `0 9 * * *`),
  `RESEND_API_KEY` (optional), `REMINDER_FROM_EMAIL` (e.g. `no-reply@example.com`).

### Frontend
- None. This is a backend/job feature with a manual trigger; no UI in this change.

## Risks / Trade-offs
- Real sending depends on an external provider (Resend) that cannot be exercised
  in CI; the tested surface is `ReminderService` (selection/dedupe/skip/compose)
  with a mocked `EmailService`, plus the route (summary + 401). `ResendEmailService`
  is a thin adapter (unit-tested for the no-key/guard path and request shape via a
  mocked `fetch`).
- Dedupe is permanent per `(client, type, referenceKey)`; acceptable since the key
  advances with each new period/routine. A time-window policy is a future option.

## Migration Plan
- Additive migration `add_notification_log`. All existing suites stay green; new
  tests cover the reminder selection/dedupe/skip logic, the manual trigger route,
  and the Resend adapter guard. The scheduler stays disabled by default, so
  behavior is unchanged unless explicitly enabled.

## Open Questions
- None blocking. Cadence = daily (configurable); dedupe = permanent per reference
  key; `NotificationLog` added; email stays optional (clients without it are
  skipped). WhatsApp deferred.
