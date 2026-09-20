# Step 4 — Unit Tests and State Verification

Change: `add-dashboard-kpis` (US-020 — Dashboard KPIs)
Date: 2026-09-20

## 4.1 Test suites + build

| Suite | Command | Result |
| --- | --- | --- |
| Backend | `npm test` | 37 suites / 290 tests passed |
| Frontend | `npx vitest run` | 34 files / 108 tests passed |
| Frontend build | `npm run build` | ✓ built, no TypeScript errors |

New/updated tests:

- Backend
  - `PrismaDashboardRepository.test.ts` — `getMonthlyIncome` sums `Payment.amount`
    for the current month and returns `0` when the aggregate is null.
  - `dashboardService.test.ts` — full-shape assertions include `kpis`; new
    `kpis` case asserts status counts (`activeClients`/`upToDate`/`overdue`/
    `noPayments`) and `monthlyIncome`.
  - `dashboardRoutes.test.ts` — response includes the `kpis` object.
- Frontend
  - `DashboardPage.test.tsx` — KPI cards render (`Clientes activos`,
    `Ingreso del mes`, formatted monthly income).
  - `useDashboardAlerts.test.tsx` / `NotificationBell.test.tsx` — helper
    fixtures extended with default `kpis`.

## 4.2 Database state (no schema change)

No migration in this change. Row counts are unchanged before/after.

| Table | Count |
| --- | --- |
| Client | 3 |
| Payment | 2 |
| Exercise | 11 |
| RoutineTemplate | 0 |

## Conclusion

All suites green, build clean, database untouched. Ready for Step 5.
