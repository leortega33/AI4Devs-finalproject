## Why

The trainer currently has to chase clients manually: the dashboard (US-009) shows
who has overdue/due-soon payments and expiring routines, but nothing reaches the
client. US-024 turns those same alerts into **automatic email reminders** so the
trainer doesn't have to follow up by hand.

## What Changes

- A scheduled job (**node-cron**) periodically reuses the dashboard aggregation to
  find clients with alerts and emails them via the existing `EmailService`
  abstraction.
- Add a **Resend** provider (`ResendEmailService`) selected when `RESEND_API_KEY`
  is set; otherwise the console/dev provider is used (no real send).
- Add a `NotificationLog` to **dedupe** — each specific alert (a payment period or
  a routine expiry) is emailed at most once.
- Add a manual **`POST /api/reminders/run`** trigger (auth) that runs the job on
  demand and returns a summary (sent / skipped), so it is testable without waiting
  for the schedule.

## Impact

- Data model: new `NotificationLog` (`clientId`, `type`, `referenceKey`, `sentAt`).
  **Migration required.** `Client.email` already exists (optional).
- Backend: extend `EmailService` with a generic `sendEmail(to, subject, body)`;
  `ConsoleEmailService` logs it; new `ResendEmailService`. A `ReminderService`
  reuses `DashboardService` + looks up each client's email + dedupes via
  `NotificationLog`. A node-cron scheduler (opt-in) and a `reminders` controller/
  route. Provider selected in `index.ts` by `RESEND_API_KEY`.
- Config/env: `REMINDERS_ENABLED`, `REMINDER_CRON`, `RESEND_API_KEY`,
  `REMINDER_FROM_EMAIL` (documented in `.env.example`).
- Docs: `docs/api-spec.yml` (the `reminders/run` endpoint), `docs/data-model.md`
  (`NotificationLog`), `readme.md`/`prompts.md` on close.

## Scope Notes

- **Reminders reuse the dashboard alert rule** (overdue / due-soon payments,
  expiring routines); no new alert logic.
- **Dedupe key**: `referenceKey` = the payment period (`YYYY-MM`) or the routine's
  end date, so a new period/routine produces a new reminder but the same alert is
  never re-sent.
- **Opt-in and safe by default**: the scheduler runs only when
  `REMINDERS_ENABLED=true`; without `RESEND_API_KEY` no real email is sent (the
  dev provider logs instead). Clients without an email are skipped.
- Email **content is in Spanish** (the client's language); code/logs stay English.

## Out of Scope (future)

- WhatsApp (Meta Cloud API), user-editable templates, per-client opt-out
  preferences, and a settings UI for cadence/toggles.
