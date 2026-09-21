# Step 6 — Unit Tests and State Verification

Change: `add-automated-reminders` (US-024 — Automated email reminders)
Date: 2026-09-20

## 6.1 Test suites + build

| Suite | Command | Result |
| --- | --- | --- |
| Backend | `npm test` | 48 suites / 348 tests passed |
| Frontend | `npx vitest run` | 34 files / 114 tests passed |
| Frontend build | `npm run build` | ✓ built, no TypeScript errors |

New/updated tests:

- Backend
  - `emailService.test.ts` — `ConsoleEmailService.sendEmail` logs the recipient +
    subject.
  - `resendEmailService.test.ts` — requires an API key, POSTs the expected payload
    (mocked `fetch`), throws on a non-OK response.
  - `PrismaNotificationLogRepository.test.ts` — `exists`/`record` by the composite
    key.
  - `reminderService.test.ts` — sends overdue/due-soon/routine reminders, dedupes
    an already-logged alert, skips a client without an email, zero summary with no
    alerts.
  - `reminderRoutes.test.ts` — the manual trigger returns the summary; 401 without
    auth.
  - `authService.test.ts` — email mock extended with `sendEmail`.

## 6.2 Database state

Additive migration `20260921001305_add_notification_log` (new `NotificationLog`
table + `NotificationType` enum). No backfill.

| Table | Count |
| --- | --- |
| Client | 3 |
| Payment | 2 |
| NotificationLog | 0 |

Unit tests use mocked repositories/services (no DB writes). The log grows only
when reminders are actually sent (verified in Step 7).

## Conclusion

All suites green, build clean, scheduler disabled by default. Ready for Step 7.
