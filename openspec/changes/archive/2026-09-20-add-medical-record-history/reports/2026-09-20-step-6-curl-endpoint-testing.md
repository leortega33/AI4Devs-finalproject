# Step 6 — Manual Endpoint Testing with curl

Change: `add-medical-record-history` (US-021 — Medical record change history)
Date: 2026-09-20

## Setup

Backend started with `RATE_LIMIT_DISABLED=true npm run dev` on `PORT=3000`.
Demo client `171` (Ana Gómez) used for the save flow.

## 6.1 Unauthenticated → 401

```bash
curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:3000/api/clients/1/medical-record/history
# 401
```

## 6.2 Save twice, then read the history

```bash
curl -s -c gym-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'   # 200

curl -s -b gym-cookies.txt -X PUT http://localhost:3000/api/clients/171/medical-record \
  -H "Content-Type: application/json" \
  -d '{"injuries":"Rodilla","bloodType":"O+"}'                    # 200

curl -s -b gym-cookies.txt -X PUT http://localhost:3000/api/clients/171/medical-record \
  -H "Content-Type: application/json" \
  -d '{"injuries":"Rodilla y hombro","bloodType":"O+","medication":"Ibuprofeno"}' # 200

curl -s -b gym-cookies.txt http://localhost:3000/api/clients/171/medical-record/history
```

History (newest first):

```json
{
  "success": true,
  "data": [
    { "id": 2, "clientId": 171, "injuries": "Rodilla y hombro", "medication": "Ibuprofeno", "bloodType": "O+", "createdAt": "2026-09-20T15:47:26.951Z" },
    { "id": 1, "clientId": 171, "injuries": "Rodilla", "bloodType": "O+", "createdAt": "2026-09-20T15:47:26.932Z" }
  ]
}
```

- Two versions after two saves ✓
- Newest first, and the newest matches the latest saved state (`Rodilla y
  hombro` + `Ibuprofeno`) ✓

## 6.3 Empty history + not-found

```bash
curl -s -b gym-cookies.txt http://localhost:3000/api/clients/173/medical-record/history
# {"success":true,"data":[]}  (status 200 — client 173 never saved)

curl -s -o /dev/null -w "%{http_code}" -b gym-cookies.txt \
  http://localhost:3000/api/clients/999999/medical-record/history
# 404  (non-existent client)
```

## Cleanup

Removed the test record and versions for client 171 to restore the demo baseline
(`MedicalRecord = 0`, `MedicalRecordVersion = 0`).

## Conclusion

The history endpoint records a version on each save, returns versions newest
first (newest == current state), returns an empty list for a never-saved client,
404 for a non-existent client, and 401 without auth. Ready for Step 7.
