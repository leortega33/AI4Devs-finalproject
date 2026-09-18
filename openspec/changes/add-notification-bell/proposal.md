## Why

The dashboard (US-009) surfaces client alerts, but only when the trainer is on
the home screen. A persistent **notification bell** in the top bar with a badge
count and a dropdown lets the trainer see who needs attention from **any**
screen — a "push"/at-a-glance complement to the dashboard (US-013). It reuses the
existing `GET /api/dashboard` aggregation, so there is no backend change.

## What Changes

- Add a **notification bell** to the app top bar (`AppLayout`): a `Badge` over a
  bell `IconButton` showing the total number of active alerts (overdue +
  due-soon + no-payment + expiring-routine), and a dropdown (`Menu`/`Popover`)
  that lists the alerts grouped, each linking to the client's payments/routine
  screen. Empty state when there are none.
- Add a small hook (`useDashboardAlerts`) that fetches the dashboard via the
  existing `dashboardService`, exposes the groups + total count, and refetches on
  mount and on route change.
- New `notifications` i18n keys (es/en).

## Capabilities

<!-- skip_specs: true. Frontend-only presentation of the existing `dashboard`
     capability (US-009): the bell renders the same aggregation from a different
     place. No new backend behavior, endpoint, or data model, so no spec delta. -->

## Impact

- Frontend only. No backend change, no API, no data model, no migration.
- New: `components/NotificationBell.tsx`, `hooks/useDashboardAlerts.ts`.
- Modified: `components/AppLayout.tsx` (mount the bell in the top bar),
  `i18n` locale files (`notifications` namespace).
- Tests: unit tests for the bell and the hook; all existing suites stay green.
  The bell is additive (no change to existing nav/roles the E2E rely on).

## Scope Notes

- **Out of scope**: a slow background polling interval (refetch on mount + route
  change is enough for the MVP; an interval can be added later), and any
  per-alert read/dismiss state.
- The badge counts all four groups (matching the dashboard).
