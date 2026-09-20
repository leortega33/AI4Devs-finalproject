# Step 7 Report - Manual Visual + E2E Testing

- Date: 2026-09-19
- Change: add-exercise-media (US-019)

## Manual visual verification

Environment: backend :3000, frontend :5173, admin logged in.

1. **Exercise catalog** (`/exercises`): the DataGrid now has a **"Media"** column.
   After setting a video and image URL on "Sentadilla", its row shows two links:
   **"Ver video"** (→ `https://youtu.be/squat-demo`) and **"Ver imagen"**
   (→ `https://example.com/squat.png`); exercises without media show an empty
   cell. PASS
2. **Exercise form**: video/image URL fields present (`type="url"`). PASS
   (also covered by unit test + E2E).
3. **Client routine video link**: covered by the `ClientRoutinePage` unit test
   (a `▶` "Ver video" link renders next to an entry whose exercise has a video
   URL). PASS

## E2E

- Extended `e2e/exercises.spec.ts`: when creating an exercise, fill the video URL
  and assert the catalog row shows a **"Ver video"** link.
- Ran the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean
  DB: **14/14 passed** (22.8s). No regressions.

## Cleanup

- Reset the seeded exercises' media to null; re-seeded the demo clients (Ana
  up_to_date, Carlos overdue, Lucía no_payments). Exercise catalog back to 11.

## Outcome

- Step 7 status: PASS
- Blocking issues: none
