# Step 6 — Visual + E2E Verification

Change: `add-warmup-suggestions` (US-023)
Date: 2026-09-20

## 6.1 Visual verification

Setup (via API): Ana Gómez (client 189) given a medical record with
`injuries: "Dolor de hombro y lesión de rodilla"` (flags `shoulder` + `knee`).

Opened `/clients/189/routine`. Below the active-routine area, the **Calentamiento
sugerido** panel renders, grouped by flagged region:

> **Hombro** — Movilidad de hombro
> **Rodilla** — Caminata lateral con banda

- Suggestions are the mobility/activation exercises for each flagged region.
- `Sentadilla` (main, also knee-tagged) does not appear — main-category exercises
  are excluded.
- The panel is advisory guidance (nothing is auto-added; assigning/saving is
  unaffected) and appears independently of whether a routine is assigned.

## 6.2 E2E

Extended the client-routine E2E to assert the **Calentamiento sugerido** panel
lists a warm-up for a flagged region after saving a knee/shoulder medical record.

Full suite run serially from a clean database (backend `RATE_LIMIT_DISABLED=true`):

```bash
npx playwright test --workers=1
# all passed
```

## Post-run state

Demo data restored: 3 clients, 2 payments, 11 base exercises (tagged); no medical
records or routines left from testing.

## Conclusion

The suggested warm-up panel renders grouped by region, excludes main-category
exercises, is advisory-only, and the full E2E suite is green. Ready for Step 7.
