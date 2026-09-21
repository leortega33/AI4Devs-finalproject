# Step 7 — Visual + E2E Verification

Change: `add-attendance-tracking` (US-025)
Date: 2026-09-20

## 7.1 Visual verification

Opened `/clients/198/attendance` (Ana Gómez). Initially the summary panel showed
zeros (Total / Este mes / Últimos 30 días / Última asistencia —) and the empty
state.

- Clicked **Registrar asistencia** → the dialog opened with the date-time
  pre-filled to today and an optional note field.
- Added the note "Entrenó tren superior" and saved → the snackbar "Asistencia
  registrada." showed, the summary updated to Total 1 / Este mes 1 / Últimos 30
  días 1 / Última 20/9/2026, and the row appeared in the table
  (`20/9/2026, 22:15:00 — Entrenó tren superior — 🗑`).
- Clicked the delete icon → the confirm dialog "¿Eliminar esta asistencia?"
  appeared; confirming showed "Asistencia eliminada." and the list returned to the
  empty state.

## 7.2 E2E

Added `frontend/e2e/attendance.spec.ts`: creates a client, opens their attendance
from the client-list action icon, registers a check-in with a note, asserts it
lists with the updated summary, and deletes it (with the confirm dialog). The
`Asistencia` heading assertion is exact to avoid colliding with the "Última
asistencia" summary label.

Full suite run serially from a clean database (backend `RATE_LIMIT_DISABLED=true`):

```bash
npx playwright test --workers=1
# 15 passed
```

## Post-run state

Demo data restored: 3 clients, 2 payments, 11 base exercises, 0 attendance.

## Conclusion

The attendance page registers, lists (with the summary), and deletes check-ins;
the full E2E suite is green with no regressions. Ready for Step 8.
