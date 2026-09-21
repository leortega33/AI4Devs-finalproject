# Step 5 — Manual Endpoint Testing with curl

Change: `add-warmup-suggestions` (US-023)
Date: 2026-09-20

## Setup

Backend started with `RATE_LIMIT_DISABLED=true npm run dev` on `PORT=3000`.
Demo client `189` (Ana Gómez).

## 5.1 Unauthenticated → 401

```bash
curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:3000/api/clients/189/warmup-suggestions
# 401
```

## 5.2 Suggestions grouped by flagged region

```bash
curl -s -b gym-cookies.txt -X PUT http://localhost:3000/api/clients/189/medical-record \
  -H "Content-Type: application/json" \
  -d '{"injuries":"Dolor de hombro y lesión de rodilla"}'   # 200

curl -s -b gym-cookies.txt http://localhost:3000/api/clients/189/warmup-suggestions
```

Result:

```
regions ['shoulder', 'knee']
shoulder -> [('Movilidad de hombro', 'mobility')]
knee     -> [('Caminata lateral con banda', 'activation')]
```

- `shoulder` → `Movilidad de hombro` (mobility) ✓
- `knee` → `Caminata lateral con banda` (activation) ✓
- `Sentadilla` (main, also knee-tagged) is correctly **excluded** — main-category
  exercises are never suggested ✓

## 5.3 Empty + not-found

```bash
curl -s -b gym-cookies.txt http://localhost:3000/api/clients/191/warmup-suggestions
# {"success":true,"data":{"regions":[],"suggestions":[]}}  (Lucía, no record)

curl -s -o /dev/null -w "%{http_code}" -b gym-cookies.txt \
  http://localhost:3000/api/clients/999999/warmup-suggestions
# 404
```

## Cleanup

Removed Ana's test medical record (`MedicalRecord = 0`).

## Conclusion

`warmup-suggestions` returns the mobility/activation exercises for each flagged
region grouped by region, excludes main-category exercises, returns empty when
there are no flags, 404 for a missing client, and 401 without auth. Ready for
Step 6.
