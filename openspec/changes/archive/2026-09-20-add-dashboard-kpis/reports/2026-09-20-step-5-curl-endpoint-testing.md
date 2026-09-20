# Step 5 — Manual Endpoint Testing with curl

Change: `add-dashboard-kpis` (US-020 — Dashboard KPIs)
Date: 2026-09-20

## Setup

Backend started with `RATE_LIMIT_DISABLED=true npm run dev` on `PORT=3000`.

## 5.1 Unauthenticated request → 401

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/dashboard
# 401
```

## 5.2 Authenticated request → kpis present

```bash
curl -s -c gym-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'
# login=200

curl -s -b gym-cookies.txt http://localhost:3000/api/dashboard | python3 -m json.tool
```

Response `data`:

```json
{
  "overduePayments": [{ "clientId": 146, "clientName": "Carlos Ruiz", "periodMonth": 7, "periodYear": 2026 }],
  "paymentsDueSoon": [],
  "noPayments": [{ "clientId": 147, "clientName": "Lucía Fernández" }],
  "expiringRoutines": [],
  "kpis": {
    "activeClients": 3,
    "overdue": 1,
    "noPayments": 1,
    "upToDate": 1,
    "monthlyIncome": 15000
  }
}
```

## Verification against demo data

- 3 active clients → `activeClients: 3` ✓
- Ana Gómez up-to-date (payment in current month) → `upToDate: 1` ✓
- Carlos Ruiz overdue (07/2026) → `overdue: 1` ✓
- Lucía Fernández no payments → `noPayments: 1` ✓
- `monthlyIncome: 15000` — only Ana's current-month payment counts; Carlos's
  payment is dated 07/2026 and is correctly excluded. ✓

## Conclusion

Endpoint returns the `kpis` object with correct aggregates; unauthenticated
requests are rejected with 401. Ready for Step 6.
