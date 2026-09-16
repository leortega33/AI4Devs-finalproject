## Context

US-009 is the last MVP story. It adds a home dashboard that surfaces actionable
alerts by aggregating data that already exists: payment status (US-007/US-008)
and routine expiration (US-006). It introduces no new domain entity and no
migration — it is a read model computed at query time. The landing page after
login currently is an inline placeholder in `App.tsx` headed "Panel"; this
change replaces it with a real dashboard while keeping the "Panel" heading (the
E2E login helper asserts it).

## Goals / Non-Goals

**Goals**
- One endpoint returning four alert groups: overdue payments, payments due
  soon, no payments, and expiring/expired routines — for active clients only.
- A dashboard landing page rendering the groups with counts and links to each
  client's relevant screen.
- Configurable "due soon" threshold (default 5 days).

**Non-Goals**
- No general KPIs/metrics, no charts, no threshold settings UI (Phase 2).
- No new persisted entity, no caching (straightforward query at MVP scale).
- No change to the payment/routine domain logic — it is reused as-is.

## Decisions

### Read model over a dedicated repository
- Add `domain/repositories/DashboardRepository.ts` with a single method
  `getActiveClientsOverview(): Promise<DashboardClientRow[]>`, where a row is a
  purpose-built read shape:
  `{ id, firstName, lastName, payments: { periodMonth, periodYear }[],
     activeRoutine: { startDate, durationWeeks } | null }`.
- `infrastructure/repositories/PrismaDashboardRepository.ts` implements it with
  one query: active clients, including their payments' periods and their active
  routine's `startDate`/`durationWeeks` (`routines where status = active`,
  `take 1`). This mirrors the include already used by `PrismaClientRepository`.
- Rationale: the existing `ClientRepository.findAll` exposes `paymentStatus` and
  `hasActiveRoutine` but not the routine end date nor the covered period needed
  for "due soon", so a dedicated read model is cleaner than overloading it.

### Classification in the service (domain logic reused)
- `application/services/dashboardService.ts` `getDashboard(now, dueSoonDays)`:
  - Reuse `computePaymentStatus(payments, now)` (domain) for the overdue group.
  - **Overdue**: `paymentStatus === 'overdue'`.
  - **Due soon**: `paymentStatus === 'up_to_date'` AND the end of the most recent
    covered month is within `[now, now + dueSoonDays]`. The end-of-covered-month
    is computed the same way as in `computePaymentStatus`
    (`new Date(year, month, 0, 23,59,59,999)`); a small shared domain helper
    `coveredPeriodEnd(payments)` (in `Payment.ts`) exposes it to avoid
    duplicating the date math.
  - **No payments**: `paymentStatus === 'no_payments'` (client never paid) — its
    own group, kept out of the overdue group.
  - **Expiring routines**: build a `RoutineTemplate` from `activeRoutine` and use
    its `endDate`; include the client when `isExpired(now)` OR
    `endDate <= now + dueSoonDays`.
- Each alert item is `{ clientId, clientName, ... }` plus a small detail:
  overdue/due-soon carry the covered `periodMonth`/`periodYear`; no-payments
  items carry just the client; routine items carry the `endDate` and an
  `expired` boolean.

### API shape
- `GET /api/dashboard` → `200 { success, data: { overduePayments: Alert[],
  paymentsDueSoon: Alert[], noPayments: Alert[], expiringRoutines: RoutineAlert[]
  } }`, behind `authMiddleware`. `401` when unauthenticated.
- Threshold from `process.env.DASHBOARD_DUE_SOON_DAYS` (default 5), read once at
  wiring time and passed into the service call.

### Frontend
- `services/dashboardService.ts`: `get()` → the three groups (typed).
- `pages/DashboardPage.tsx` replaces the inline placeholder in `App.tsx`; keeps
  the `t('auth.dashboard.title')` ("Panel") heading, renders the four sections
  with a count each, an empty state per section, and a list of clickable
  clients. Payment alerts (overdue / due soon / no payments) link to
  `/clients/:id/payments`; routine alerts link to `/clients/:id/routine`.
- A small reusable `components/AlertList.tsx` renders one group (title, count,
  items with a link). New `dashboard` i18n keys in `es.json`/`en.json`.

## Risks / Trade-offs
- **N clients scale**: one query returns all active clients with nested payments
  and the active routine; classification is in-memory. Fine at MVP scale (tens
  to low hundreds); revisit with indexed queries/pagination if it grows.
- **Threshold semantics**: "due soon" only flags clients still up to date whose
  coverage ends within the window; already-overdue clients are in the overdue
  group instead, avoiding double-listing.

## Migration Plan
- Additive: new capability, one endpoint, backend read-model + service +
  controller + route, and frontend dashboard. No DB migration, no breaking
  changes.

## Open Questions
- None blocking. `DASHBOARD_DUE_SOON_DAYS` default 5 is assumed per the backlog;
  a settings UI is Phase 2.
