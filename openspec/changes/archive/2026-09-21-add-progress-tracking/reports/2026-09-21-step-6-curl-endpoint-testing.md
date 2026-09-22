# Step 6 — Manual Endpoint Testing with curl

Change: `add-progress-tracking` (US-026)
Date: 2026-09-21

## Setup

Backend started with `RATE_LIMIT_DISABLED=true`. Demo client Ana (218).

## 6.1 Auth + record

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/clients/218/progress
# 401

# Older entry (weight 82, waist 90, note)
curl -s -b c.txt -X POST http://localhost:3000/api/clients/218/progress \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-08-01","weightKg":82,"waistCm":90,"note":"Inicio"}'   # 201

# Recent entry (weight 78, waist 85)
curl -s -b c.txt -X POST http://localhost:3000/api/clients/218/progress \
  -H "Content-Type: application/json" -d '{"weightKg":78,"waistCm":85}'   # 201
```

## 6.2 Validation + not-found

```bash
curl ... -d '{"note":"solo nota"}'   # 400 (no metric)
curl ... -d '{"weightKg":-1}'        # 400 (negative)
curl ... POST /api/clients/999999/progress -d '{"weightKg":80}'   # 404
```

## 6.3 List + summary

```bash
curl -s -b c.txt http://localhost:3000/api/clients/218/progress
```

```
order   [('2026-09-22', 78), ('2026-08-01', 82)]   # newest first
summary { latestWeightKg: 78, weightChangeKg: -4, entryCount: 2 }
```

- Latest weight = 78; change since the first weighed entry (82) = **-4 kg** ✓

## 6.4 Delete

```bash
curl -s -b c.txt -X DELETE http://localhost:3000/api/clients/218/progress/2   # 204
curl -s -b c.txt -X DELETE http://localhost:3000/api/clients/218/progress/999999   # 404

# After deleting the recent entry, the summary recomputes:
# { latestWeightKg: 82, weightChangeKg: null, entryCount: 1 }   (only one weighed entry → no change)
```

## Cleanup

Cleared the test progress rows (`ProgressEntry = 0`).

## Conclusion

Recording (subset of metrics, default date), the newest-first list with the weight
summary/delta, deletion, validation (400 for empty/negative), not-found (404), and
auth (401) all behave as specified. Ready for Step 7.
