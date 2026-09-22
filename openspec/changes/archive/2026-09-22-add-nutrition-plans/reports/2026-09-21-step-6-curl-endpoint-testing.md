# Step 6 Report - Manual Endpoint Testing with curl

- Date: 2026-09-21
- Change: add-nutrition-plans (US-027)
- Agent: GitHub Copilot

## Environment

- Backend on `http://localhost:3000` (`RATE_LIMIT_DISABLED=true`), Dockerized
  PostgreSQL. Authenticated cookie via `POST /api/auth/login` (admin). Demo
  client id = 1.

## Cases and Outcomes

| # | Case | Request | Result |
|---|------|---------|--------|
| 1 | Get empty plan | `GET /clients/1/nutrition-plan` | **200**; `{ dailyCalories:null, proteinTargetG:null, generalNotes:null, meals:[] }` |
| 2 | Create plan | `PUT` with targets + 2 meals (Desayuno[Avena,Huevos], Almuerzo[Pollo]) | **200**; returned in order, `dailyCalories:2200` |
| 3 | Replace on later save | `PUT` with only `{ meals:[Cena[Pescado]] }` | **200**; meals now `[Cena]`, targets cleared to null |
| 4 | Version history | `GET .../versions` | **200**; 2 snapshots — newest `[Cena]`, oldest `[Desayuno,Almuerzo]` |
| 5 | Negative target | `PUT { dailyCalories:-1, meals:[] }` | **400** |
| 6 | Nameless meal | `PUT { meals:[{ name:"", items:[] }] }` | **400** |
| 7 | Unauthenticated | `GET` without cookie | **401** |
| 8 | Missing client | `GET /clients/999999/nutrition-plan` | **404** |

## Notes

- The upsert **replaces** the whole plan (meals + items) and clears omitted
  scalar targets, matching the whole-document design.
- Each save appended a version; history is newest-first with the first version
  matching the current plan.
- Meal and food-item order round-trips as submitted.

All curl cases passed. Test data (plan + versions) was cleaned from the dev DB.
