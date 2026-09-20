## Context

`DashboardService.getDashboard(now, dueSoonDays)` returns four alert arrays
(`overduePayments`, `paymentsDueSoon`, `noPayments`, `expiringRoutines`) computed
from `DashboardRepository.getActiveClientsOverview()` → `DashboardClientRow[]`
(active clients with their payments' `{ periodMonth, periodYear }` and one active
routine). Payment status is derived with `computePaymentStatus`/`coveredPeriodEnd`
(US-007). The controller calls `getDashboard(new Date(), dueSoonDays)` and returns
`{ success, data }`. The frontend `Dashboard` type + `DashboardPage` render the
four `AlertList` cards; `useDashboardAlerts` fetches on mount + route change.

Monthly income needs `Payment.amount` + `paymentDate`, which the overview does
**not** load, so a dedicated repository query is required.

## Goals / Non-Goals

**Goals**
- Add a `kpis` object to the dashboard response and KPI cards on the page.

**Non-Goals**
- No data-model change; no change to the alert groups or the derived-status rule;
  no caching (MVP scale).

## Decisions

### Backend
- Extend the `Dashboard` interface with
  `kpis: { activeClients; upToDate; overdue; noPayments; monthlyIncome }`.
- Compute `activeClients`/`upToDate`/`overdue`/`noPayments` in
  `DashboardService` by classifying each active-client row with the same
  `computePaymentStatus` used for the alert groups (counts over active clients).
- Add `DashboardRepository.getMonthlyIncome(now: Date): Promise<number>` and a
  Prisma implementation: `payment.aggregate({ _sum: { amount }, where: { paymentDate: { gte: monthStart, lt: nextMonthStart } } })`,
  returning `Number(_sum.amount ?? 0)`. `getDashboard` calls it with `now` and
  puts the result in `kpis.monthlyIncome`.
- Controller/routes unchanged (same endpoint; `now` already passed).

### Frontend
- `dashboardService` `Dashboard` type gains the `kpis` object (+ default in
  `EMPTY_DASHBOARD`).
- `DashboardPage`: a row of compact **KPI stat cards** above the alert grid —
  Active clients, Up to date, Overdue, Monthly income. A small local `StatCard`
  (MUI `Card` with a label + big number), consistent with the refreshed design.
- Add `dashboard.kpi.*` i18n keys (es/en): `activeClients`, `upToDate`,
  `overdue`, `monthlyIncome`, and a section title.

## Risks / Trade-offs
- Two repository round-trips (overview + income). Fine at MVP scale; could be a
  single query later if needed.
- Income counts all payments in the month regardless of client status (money
  received), while the status counts are over active clients — documented so the
  two are not conflated.

## Migration Plan
- Additive: richer response + new UI cards. All existing suites stay green; new
  tests cover the KPI aggregation (counts + monthly income + empty month) and the
  KPI cards render.

## Open Questions
- None. Income by `paymentDate` in the current month; status counts over active
  clients, per the enriched US-020.
