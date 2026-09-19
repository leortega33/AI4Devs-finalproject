# Step 7 Report - Manual Visual + E2E Testing

- Date: 2026-09-19
- Change: add-weekly-progression (US-018)

## Manual visual verification

Environment: backend :3000, frontend :5173, admin logged in, demo data.

1. **Builder** (`/routines/new`): built "Mesociclo Demo" with a session and a
   main exercise (Sentadilla). Each entry shows a **"Progresión semanal
   (opcional)"** section with an **"Agregar semana"** button. Added two weeks
   ("Sem. 1" = 60 kg, "Sem. 2" = 62.5 kg) and saved. PASS
2. **Assign to client**: assigned "Mesociclo Demo" to Ana (start 2026-09-19,
   4 weeks). PASS
3. **Client routine view** (`/clients/:id/routine`): the active routine renders
   the per-week progression:
   - `• Sentadilla`
   - `Sem. 1: -x- @ 60kg`
   - `Sem. 2: -x- @ 62.5kg`
   (reps/series shown as `-` since only kg was entered). PASS
4. **Backward compatibility**: single-value routines (no weeks) still render the
   single-value line as before. PASS

## E2E

- Extended `e2e/routines.spec.ts`: after adding an exercise, click **"Agregar
  semana"** and fill its kg before saving; the routine still saves and appears in
  the list.
- Ran the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean
  DB: **14/14 passed** (22.9s). No regressions.

## Cleanup

- Removed the demo routine + its client assignment; re-seeded the demo clients
  (Ana up_to_date, Carlos overdue, Lucía no_payments). Exercise catalog back to
  11; RoutineTemplate back to 0.

## Outcome

- Step 7 status: PASS
- Blocking issues: none
