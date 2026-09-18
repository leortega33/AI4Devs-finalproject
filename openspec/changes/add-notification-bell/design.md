## Context

US-009 added `GET /api/dashboard` (four alert groups) and a `DashboardPage` that
renders them. US-012 refreshed the shell with a top bar + sidebar. US-013 adds a
**notification bell** in that top bar so the trainer sees alerts from any screen.
It is frontend-only and reuses `dashboardService.get()` — no backend change.

## Goals / Non-Goals

**Goals**
- A bell + badge count in the top bar, on every authenticated screen.
- A dropdown listing the alerts grouped, each linking to the client.
- Refresh on mount and on navigation.

**Non-Goals**
- No backend/API/data change; no polling interval; no per-alert read/dismiss
  state; no change to the dashboard page itself.

## Decisions

### Data: `hooks/useDashboardAlerts.ts`
- A hook that calls `dashboardService.get()`, stores the `Dashboard`, and exposes
  `{ dashboard, total, loading, reload }`. `total` = sum of the four groups'
  lengths.
- Refetch on mount and whenever the route changes (`useLocation().pathname` in a
  dependency), so the badge reflects recent create/edit/delete. Errors are
  swallowed to a safe empty state (the bell must never break the shell).
- No interval (out of scope) — kept simple and testable.

### UI: `components/NotificationBell.tsx`
- A `Badge` (badgeContent = total, color error, hidden when 0) over an
  `IconButton` with a bell icon, `aria-label` from i18n.
- Clicking opens a `Menu` anchored to the button; the menu lists the alerts
  grouped by type with a small header per non-empty group and `MenuItem`s that
  are `RouterLink`s to `/clients/:id/payments` or `/clients/:id/routine`
  (reusing the same mapping as the dashboard). Selecting an item closes the menu.
- Empty state: a single disabled item with the "no alerts" message.
- Item mapping mirrors `DashboardPage` (payment alerts → payments screen with the
  covered period; routine alerts → routine screen with expired/expires detail).

### Integration
- Mount `<NotificationBell />` in `AppLayout`'s top bar, between the language
  switcher and logout. Additive — no change to existing controls, nav, or the
  roles/names the tests rely on.
- New `notifications` i18n keys: `title`/`aria` label, `empty`, and reuse the
  existing `dashboard.*` group titles/detail strings for consistency.

## Risks / Trade-offs
- **Extra fetch on navigation**: one lightweight GET per route change. Acceptable
  at MVP scale; can be debounced/cached later.
- **Duplication with the dashboard mapping**: the alert→item mapping is small; if
  it grows, extract a shared helper. For now, keep a local mapping in the bell to
  avoid premature abstraction.

## Migration Plan
- Additive frontend only. No DB/API changes. All suites stay green; the bell is a
  new control that does not alter existing selectors.

## Open Questions
- None blocking (badge counts all four groups; no interval for now).
