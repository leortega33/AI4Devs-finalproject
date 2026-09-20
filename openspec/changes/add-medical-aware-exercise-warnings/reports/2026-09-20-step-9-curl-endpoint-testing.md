# Step 9 — Manual Endpoint Testing with curl

Change: `add-medical-aware-exercise-warnings` (US-022)
Date: 2026-09-20

## Setup

Backend started with `RATE_LIMIT_DISABLED=true npm run dev` on `PORT=3000`.
Demo client `180` (Ana Gómez) used for the medical record.

## 9.1 Exercise body regions round-trip + validation

```bash
curl -s -b gym-cookies.txt -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -d '{"name":"Zancada","muscleGroup":"Piernas","category":"main","bodyRegions":["knee","hip"]}'
# data.bodyRegions = ["knee","hip"]

curl -s -o /dev/null -w "%{http_code}" -b gym-cookies.txt -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -d '{"name":"X","muscleGroup":"Y","category":"main","bodyRegions":["spleen"]}'
# 400 (unknown region rejected)
```

## 9.2 Medical flags

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/clients/180/medical-flags
# 401 (no auth)

curl -s -b gym-cookies.txt -X PUT http://localhost:3000/api/clients/180/medical-record \
  -H "Content-Type: application/json" \
  -d '{"injuries":"Lesión de rodilla","preexistingConditions":"Asma"}'   # 200

curl -s -b gym-cookies.txt http://localhost:3000/api/clients/180/medical-flags
```

Response:

```json
{
  "success": true,
  "data": {
    "regions": ["cardio_respiratory", "knee"],
    "details": [
      { "region": "cardio_respiratory", "field": "preexistingConditions", "snippet": "asma" },
      { "region": "knee", "field": "injuries", "snippet": "rodilla" }
    ]
  }
}
```

- `injuries: "Lesión de rodilla"` → `knee` (accent-insensitive) ✓
- `preexistingConditions: "Asma"` → `cardio_respiratory` ✓
- Each flag reports its source field and matched snippet ✓

## 9.3 Empty flags + not-found

```bash
curl -s -b gym-cookies.txt http://localhost:3000/api/clients/182/medical-flags
# {"success":true,"data":{"regions":[],"details":[]}}  (Lucía, no record)

curl -s -o /dev/null -w "%{http_code}" -b gym-cookies.txt \
  http://localhost:3000/api/clients/999999/medical-flags
# 404
```

## Cleanup

Removed the test exercise and Ana's test medical record (`Exercise = 11`,
`MedicalRecord = 0`).

## Conclusion

`bodyRegions` round-trips and rejects unknown codes; `medical-flags` derives the
flagged regions (accent-insensitive) with source snippets, returns empty for a
client without a record, 404 for a missing client, and 401 without auth. Ready
for Step 10.
