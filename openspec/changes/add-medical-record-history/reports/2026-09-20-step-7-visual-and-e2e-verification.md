# Step 7 — Visual + E2E Verification

Change: `add-medical-record-history` (US-021 — Medical record change history)
Date: 2026-09-20

## 7.1 Visual verification

Opened `/clients/171/medical-record` (Ana Gómez). Initially the **Historial de
cambios** section showed the empty state ("Todavía no hay versiones guardadas.").

- Saved with `Lesiones: Rodilla` → the history listed one version:
  `Guardado el 20/9/2026, 12:48:19 — Lesiones: Rodilla`.
- Edited (added `Medicación: Ibuprofeno`) and saved again → the history listed
  two versions, newest first:
  1. `Guardado el 20/9/2026, 12:48:34 — Lesiones: Rodilla · Medicación: Ibuprofeno`
  2. `Guardado el 20/9/2026, 12:48:19 — Lesiones: Rodilla`

Timestamps are localized; each save appends a version without altering the
current record.

## 7.2 E2E

Extended `frontend/e2e/medical-record.spec.ts` to assert the history section
shows a version after saving.

Full suite run serially from a clean database (backend `RATE_LIMIT_DISABLED=true`):

```bash
npx playwright test --workers=1
# 14 passed
```

## Post-run state

Demo data restored: 3 clients, 2 payments, 11 base exercises; no medical records
or versions left from testing.

## Conclusion

The history renders correctly (newest first, localized timestamps, empty state)
and the full E2E suite is green with no regressions. Ready for Step 8.
