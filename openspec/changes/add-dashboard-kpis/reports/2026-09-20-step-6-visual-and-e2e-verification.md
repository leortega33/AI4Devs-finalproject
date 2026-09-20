# Step 6 — Visual + E2E Verification

Change: `add-dashboard-kpis` (US-020 — Dashboard KPIs)
Date: 2026-09-20

## 6.1 Visual verification

Logged in as admin and opened the dashboard (`/`). The KPI card row renders above
the alert grid with the correct figures for the demo data:

| KPI | Value |
| --- | --- |
| Clientes activos | 3 |
| Al día | 1 |
| Vencidos | 1 |
| Ingreso del mes | 15.000 |

`Ingreso del mes` is formatted with the Spanish locale (`15.000`) and reflects only
the current-month payment (Ana). Carlos's 07/2026 payment is correctly excluded.

## 6.2 E2E

Extended `frontend/e2e/dashboard.spec.ts` to assert the `Clientes activos` and
`Ingreso del mes` KPI headings are visible after login.

Because the new KPI heading `Clientes activos` collides with the substring matcher
`getByRole('heading', { name: 'Clientes' })` used by other specs, those assertions
were made exact (`exact: true`) in `auth.spec.ts`, `clients.spec.ts`, and
`medical-record.spec.ts`.

Full suite run serially from a clean database:

```bash
npx playwright test --workers=1
# 14 passed (21.9s)
```

Backend ran with `RATE_LIMIT_DISABLED=true` (verified: 12 consecutive logins → 200).

## Post-run state

Demo data restored: 3 clients (Ana up-to-date, Carlos overdue 07/2026, Lucía no
payments), 2 payments, 11 base exercises (Sentadilla demo `videoUrl` restored).

## Conclusion

KPI cards verified visually and via E2E; full suite green with no regressions.
Ready for Step 7.
