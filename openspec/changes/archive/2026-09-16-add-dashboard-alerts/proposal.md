## Why

The trainer currently has to open each client one by one to find who is overdue
on payments or whose routine has expired. A home dashboard that surfaces these
alerts at a glance — each linking straight to the relevant client screen — lets
the trainer act quickly. This is the last MVP story and ties together the
payment status (US-007/US-008) and routine expiration (US-006) already in place.

## What Changes

- Add a read-only dashboard aggregation: a new `GET /api/dashboard` endpoint that
  returns four alert groups derived at query time from existing data (no new
  domain entity):
  - **Overdue payments**: active clients whose derived payment status is overdue.
  - **Payments due soon**: active clients who are up to date but whose covered
    period ends within a configurable threshold (default 5 days).
  - **No payments**: active clients who have never registered a payment.
  - **Expiring routines**: active clients whose active routine has expired or
    will expire within the same threshold.
- Replace the placeholder landing page with a real `DashboardPage` (still headed
  "Panel") that shows the groups with counts and links to each client's
  relevant screen (payments / routine).
- The threshold is configurable via `DASHBOARD_DUE_SOON_DAYS` (default 5).
- The endpoint is protected by the existing auth middleware (US-001).

## Capabilities

### New Capabilities
- `dashboard`: aggregate active clients into overdue-payment, payment-due-soon,
  no-payment, and expiring-routine alert groups derived from clients, payments,
  and routines.

### Modified Capabilities
<!-- None: reuses payments (US-007/008) and client routines (US-006) as read-only inputs. -->

## Impact

- No data-model changes: derived at query time from `Client`, `Payment`, and
  client-assigned `RoutineTemplate` (see `docs/data-model.md`). No migration.
- New backend read model: `domain/repositories/DashboardRepository.ts` +
  `infrastructure/repositories/PrismaDashboardRepository.ts` (one aggregation
  query for active clients with their payment periods and active routine dates),
  `application/services/dashboardService.ts` (classification using the existing
  `computePaymentStatus` and `RoutineTemplate` expiration logic),
  `presentation/controllers/dashboardController.ts`, `routes/dashboardRoutes.ts`,
  wired in `index.ts`, behind `authMiddleware`.
- New frontend `services/dashboardService.ts`, `pages/DashboardPage.tsx` (landing
  page after login), and a reusable alert-group component, replacing the inline
  placeholder in `App.tsx`. New `dashboard` i18n keys in `es.json`/`en.json`.
- `docs/api-spec.yml` gains the `/api/dashboard` endpoint.

## Scope Notes

- MVP scope is the four alert groups with counts and links. General KPI numbers
  and a settings UI for the threshold are Phase 2.
- "No payments" clients (never paid) are surfaced in their own dedicated group
  (not mixed into the overdue group), so the trainer sees new/never-paid clients
  separately from those who lapsed.
