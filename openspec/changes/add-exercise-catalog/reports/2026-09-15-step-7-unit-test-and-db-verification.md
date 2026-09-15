# Step 7 Report - Unit Test and Database Verification

- Date: 2026-09-15
- Change: add-exercise-catalog
- Agent: GitHub Copilot

## Test Environment
- PostgreSQL up via `docker compose` (`gym-postgres`).
- Node 20.19.0 (nvm).
- Command: `npx jest --coverage`.

## Pre-Test Database Baseline
Row counts captured before running the suite:

| Table | Count |
|---|---|
| Exercise | 11 |
| Client | 1 |
| User | 1 |

(The 11 exercises are the seeded base catalog; the 1 client is pre-existing
manual test data.)

## Targeted Unit Tests (exercise module)
`npx jest Exercise validator` → 4 suites, 37 tests, all passing:
- `domain/models/Exercise.test.ts` — defaults optional fields to null, keeps
  provided values.
- `infrastructure/repositories/PrismaExerciseRepository.test.ts` — create,
  findById (found/null), findAll (category + case-insensitive name search,
  no-filter), update.
- `application/services/exerciseService.test.ts` — create, findById
  (found/`ExerciseNotFoundError`), list with filters, update (incl.
  `ExerciseNotFoundError`).
- `application/validator.test.ts` — exercise schema: required
  name/muscleGroup/category, optional numeric/text fields, invalid category
  and negative sets rejected.
- `routes/exerciseRoutes.test.ts` — 401 unauthenticated, 200 list (search +
  category, invalid category ignored), 200 get + 404, 201 create + 400, 200
  update + 404 + 400.

## Full Backend Suite
`npx jest --coverage`:
- Test Suites: 20 passed, 20 total
- Tests: 132 passed, 132 total
- Coverage (all files): 98.22% statements, 93% branches, 99.02% functions,
  98.22% lines — above the 90% threshold.
- New files (`Exercise.ts`, `PrismaExerciseRepository.ts`,
  `exerciseService.ts`, `exerciseController.ts`, `exerciseRoutes.ts`) at
  ~100% coverage.

## Post-Test Database State
Row counts re-checked after the suite — unchanged from the baseline:

| Table | Count |
|---|---|
| Exercise | 11 |
| Client | 1 |
| User | 1 |

Unit tests use mocked Prisma clients, so the database was not mutated. No
restoration required.

## Outcome
- Step 7 status: PASS
- Blocking issues: none
