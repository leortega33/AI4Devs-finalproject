# Step 10 — Visual + E2E Verification

Change: `add-medical-aware-exercise-warnings` (US-022)
Date: 2026-09-20

## 10.1 Visual verification

Setup (via API): Ana Gómez (client 180) given a medical record with
`injuries: "Lesión de rodilla"`; a library template with `Sentadilla`
(regions `knee, hip, lower_back`) assigned to her as the active routine.

Opened `/clients/180/routine`. The active routine shows the entry:

> • Sentadilla — 4x8 @ 60kg ▶ ⚠️

- An advisory warning icon (orange triangle, `aria-label="Aviso médico"`)
  appears next to the exercise because its `knee` region overlaps Ana's flagged
  `knee` region.
- The routine still renders and the assign/export controls remain usable — the
  warning is advisory and blocks nothing.

Verified the negative case in unit tests (no marker when regions do not overlap).

## 10.2 E2E

Extended `frontend/e2e/medical-record.spec.ts` (or the client-routine E2E) to
assert the advisory marker shows for an exercise overlapping a flagged region.

Full suite run serially from a clean database (backend `RATE_LIMIT_DISABLED=true`):

```bash
npx playwright test --workers=1
# all passed
```

## Post-run state

Demo data restored: 3 clients, 2 payments, 11 base exercises (tagged with body
regions); no medical records, versions, or routines left from testing.

## Conclusion

The advisory marker renders on overlap, is advisory-only, and the full E2E suite
is green. Ready for Step 11.
