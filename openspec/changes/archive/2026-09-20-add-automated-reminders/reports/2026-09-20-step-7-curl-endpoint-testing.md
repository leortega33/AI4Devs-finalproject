# Step 7 — Manual Endpoint Testing with curl

Change: `add-automated-reminders` (US-024)
Date: 2026-09-20

## Setup

Backend started with `RATE_LIMIT_DISABLED=true` and **no `RESEND_API_KEY`** (so the
console provider is used — emails are logged, not sent). Demo clients: Ana (198,
paid 09/2026), Carlos (199, overdue 07/2026), Lucía (200).

## 7.1 Unauthenticated → 401

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/reminders/run
# 401
```

## 7.2 Run the job — one reminder sent

```bash
curl -s -b gym-cookies.txt -X POST http://localhost:3000/api/reminders/run
# {"success":true,"data":{"sent":1,"skippedNoEmail":0,"skippedDuplicate":0}}
```

Backend log (console provider):

```
[email:dev] To: carlos@example.com | Subject: Recordatorio: pago vencido
```

- Carlos has an overdue payment (07/2026) and an email → one reminder sent.
- Ana is up to date and Lucía has no payment → no reminder (only overdue/due-soon
  payments and expiring routines are emailed).

## 7.3 Run again — deduped

```bash
curl -s -b gym-cookies.txt -X POST http://localhost:3000/api/reminders/run
# {"success":true,"data":{"sent":0,"skippedNoEmail":0,"skippedDuplicate":1}}
```

`NotificationLog`:

```
clientId | type            | referenceKey
199      | payment_overdue | 2026-07
```

## 7.4 Skip a client without an email

Blanked Lucía's email and gave her an overdue payment (06/2026), then ran again:

```bash
curl -s -b gym-cookies.txt -X POST http://localhost:3000/api/reminders/run
# {"success":true,"data":{"sent":0,"skippedNoEmail":1,"skippedDuplicate":1}}
```

- Lucía (overdue, no email) → `skippedNoEmail` ✓
- Carlos (already logged) → `skippedDuplicate` ✓

## Cleanup

Cleared `NotificationLog`, removed Lucía's test payment, restored her email
(`NotificationLog = 0`, `Payment = 2`).

## Conclusion

The manual trigger sends one reminder per unsent alert (logging the email via the
console provider), dedupes already-sent alerts, skips clients without an email,
and rejects unauthenticated calls with 401. The scheduler stays disabled by
default. Ready for Step 8.
