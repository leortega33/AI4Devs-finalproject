# Step 6 — Manual Endpoint Testing with curl

Change: `add-attendance-tracking` (US-025)
Date: 2026-09-20

## Setup

Backend started with `RATE_LIMIT_DISABLED=true`. Demo client Ana (198).

## 6.1 Auth + register

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/clients/198/attendance
# 401

# Register with the default time
curl -s -b c.txt -X POST http://localhost:3000/api/clients/198/attendance \
  -H "Content-Type: application/json" -d '{}'                      # 201

# Register with a chosen date + note
curl -s -b c.txt -X POST http://localhost:3000/api/clients/198/attendance \
  -H "Content-Type: application/json" \
  -d '{"checkInAt":"2026-09-15T09:00:00.000Z","note":"Entrenó piernas"}'  # 201
```

## 6.2 Validation + not-found

```bash
# 501-char note
curl ... -d '{"note":"xxxx...(501)"}'   # 400

# Non-existent client
curl ... POST /api/clients/999999/attendance -d '{}'   # 404
```

## 6.3 List + summary

```bash
curl -s -b c.txt http://localhost:3000/api/clients/198/attendance
```

```
order   ['2026-09-21', '2026-09-15']   # newest first
summary { total: 2, thisMonth: 2, last30Days: 2, lastCheckInAt: '2026-09-21T...' }
```

## 6.4 Delete

```bash
curl -s -b c.txt -X DELETE http://localhost:3000/api/clients/198/attendance/1
# 204

curl -s -b c.txt -X DELETE http://localhost:3000/api/clients/198/attendance/999999
# 404

# total dropped from 2 to 1
```

## Cleanup

Cleared the test attendance rows (`Attendance = 0`).

## Conclusion

Registering (default + chosen time), the newest-first list with the frequency
summary, deletion, validation (400), not-found (404), and auth (401) all behave
as specified. Ready for Step 7.
