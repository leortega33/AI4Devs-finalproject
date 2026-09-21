# Step 4 — Unit Tests and State Verification

Change: `add-warmup-suggestions` (US-023 — Medical-aware warm-up suggestions)
Date: 2026-09-20

## 4.1 Test suites + build

| Suite | Command | Result |
| --- | --- | --- |
| Backend | `npm test` | 44 suites / 334 tests passed |
| Frontend | `npx vitest run` | 34 files / 114 tests passed |
| Frontend build | `npm run build` | ✓ built, no TypeScript errors |

New/updated tests:

- Backend
  - `warmupSuggestionService.test.ts` — groups warm-up exercises by flagged
    region, excludes `main`, empty when no flags/matches, omits a region with no
    match, propagates not-found.
  - `warmupSuggestionRoutes.test.ts` — grouped suggestions shape, empty, 404, 401.
- Frontend
  - `ClientRoutinePage.test.tsx` — the "Calentamiento sugerido" panel renders a
    suggestion grouped by region.

## 4.2 Database state

No schema change and no migration — the feature is a read-only composition over
existing data (US-022 flags + `Exercise.bodyRegions`).

| Metric | Value |
| --- | --- |
| Client | 3 |
| Exercise | 11 |

Unit tests use mocked services/repositories (no DB writes); demo data unchanged.

## Conclusion

All suites green, build clean, database untouched. Ready for Step 5.
