# Step 8 — Unit Tests and State Verification

Change: `add-medical-aware-exercise-warnings` (US-022 — Medical-aware exercise warnings)
Date: 2026-09-20

## 8.1 Test suites + build

| Suite | Command | Result |
| --- | --- | --- |
| Backend | `npm test` | 42 suites / 325 tests passed |
| Frontend | `npx vitest run` | 34 files / 113 tests passed |
| Frontend build | `npm run build` | ✓ built, no TypeScript errors |

New/updated tests:

- Backend
  - `validator.test.ts` — `bodyRegions` defaults to `[]`, accepts valid codes,
    rejects unknown regions.
  - `PrismaExerciseRepository.test.ts` — `bodyRegions` round-trips.
  - `exerciseRoutes.test.ts` — POST round-trips `bodyRegions`; unknown region → 400.
  - `medicalRegionDictionary.test.ts` — normalize + scan (single/multiple
    regions, case/accent-insensitive, multi-word keyword, word-boundary, no match).
  - `medicalFlagsService.test.ts` — flags + details from scanned fields, empty
    when no record/no match, ignores non-scanned fields, not-found.
  - `medicalFlagsRoutes.test.ts` — flags shape, empty, 404, 401.
  - `PrismaRoutineTemplateRepository.test.ts` — `exerciseBodyRegions`
    denormalized onto the entry.
- Frontend
  - `ExerciseFormPage.test.tsx` — selected body regions included in the payload.
  - `ClientRoutinePage.test.tsx` — advisory marker shown on overlap, hidden
    without overlap.

## 8.2 Database state

Additive migration `20260920230247_add_exercise_body_regions` (new
`Exercise.bodyRegions text[] default '{}'`). The seed tags the 11 base exercises.

| Metric | Value |
| --- | --- |
| Client | 3 |
| Exercise | 11 |
| Exercise with body regions | 11 |

Unit tests use mocked repositories (no DB writes); demo data unchanged.

## Conclusion

All suites green, build clean, base catalog tagged. Ready for Step 9.
