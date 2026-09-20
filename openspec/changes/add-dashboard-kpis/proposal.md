## Why

The dashboard (US-009) shows alert lists but no at-a-glance business numbers. To
see the state of the gym in one look, US-020 adds aggregate **KPIs**: how many
active clients there are, how they split by payment status, and the income
received this month.

## What Changes

- Extend `GET /api/dashboard` with a `kpis` object:
  - `activeClients` — number of active clients.
  - `upToDate` / `overdue` / `noPayments` — active client counts by derived
    payment status (US-007 rule, unchanged).
  - `monthlyIncome` — sum of `Payment.amount` for payments whose `paymentDate`
    falls in the current month.
- Render **KPI cards** on the dashboard above the existing alert cards.

## Impact

- Backend: `DashboardService` computes the KPIs (client status counts from the
  existing active-clients overview; monthly income via a new repository query on
  payments); `DashboardRepository` gains a `getMonthlyIncome(now)` method. Same
  endpoint, richer response. No data-model change.
- Frontend: `Dashboard` type gains `kpis`; dashboard KPI cards + i18n keys.
- Docs: `docs/api-spec.yml` (the `kpis` field on the dashboard response),
  `readme.md`/`prompts.md` on close.

## Scope Notes

- **Income** = sum of `Payment.amount` by `paymentDate` in the current month (not
  by covered period).
- Payment-status counts are over **active** clients (consistent with the existing
  alert groups).
- Simple aggregation (MVP scale); revisit indexing/caching only if slow.
