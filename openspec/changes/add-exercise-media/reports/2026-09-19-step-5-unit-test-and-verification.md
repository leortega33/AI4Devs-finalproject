# Step 5 Report - Unit Tests and Verification

- Date: 2026-09-19
- Change: add-exercise-media (US-019)
- Agent: GitHub Copilot (backend + frontend)

## Commands

- Backend: `npx jest`
- Frontend: `npx vitest run`, `npm run build`
- Migration: `npx prisma migrate dev --name add_exercise_media`

## Results

- **Backend: 37 suites, 286 passed** (was 283; +3: validator accepts valid media
  URLs, treats empty as null, rejects a malformed URL; the routine repository
  test also asserts the exercise's video URL is carried into the entry). Also
  hardened `parseOrThrow` typing to be transform-safe.
- **Frontend: 34 files, 108 passed** (was 106; +2: the exercise form includes the
  media URLs in the payload, the catalog renders a video link). The client
  routine test also asserts the video link. Build clean.
- **Migration applied**: `Exercise` has `videoUrl`/`imageUrl` columns; 11
  exercises intact.
- **Database (demo data)**: Client=3, Payment=2, Exercise=11, RoutineTemplate=0.
  Stray "Rutina Test" routines left from earlier manual testing were removed to
  restore a clean baseline.

## Notes

- Additive migration (`videoUrl String?`, `imageUrl String?` on Exercise). Old
  exercises read back with null media.
- Backend: domain `Exercise` + `ExerciseInput` fields; validator `optionalUrl`
  (empty → null, else a valid http(s) URL); routine nested read carries the
  exercise's `videoUrl` into `RoutineExerciseEntry.exerciseVideoUrl`. The exercise
  repository maps the columns automatically (spread) — no repo change.
- Frontend: exercise form video/image URL fields; catalog media column (video /
  image icon links); client routine video link; i18n (es/en).

## Outcome

- Step 5 status: PASS
- Blocking issues: none
