# Step 6 Report - Unit Test and Database Verification

- Date: 2026-09-15
- Change: assign-client-routine
- Agent: GitHub Copilot

## Test Environment
- PostgreSQL up via `docker compose` (`gym-postgres`).
- Node 20.19.0 (nvm).
- Command: `npx jest --coverage`.

## Pre-Test Database Baseline
| Table | Count |
|---|---|
| RoutineTemplate | 2 |
| Client | 0 |
| Exercise | 11 |
| User | 1 |

(The 2 templates are leftover library templates from prior dev/E2E runs; unit
tests do not touch the database, so they are irrelevant to this run and are
cleaned before curl/E2E.)

## Targeted Unit Tests (client-routine module)
`npx jest clientRoutine Routine validator` → all passing:
- `PrismaRoutineTemplateRepository.test.ts` — new methods: assign clone closes
  the previous active routine in a transaction (`updateMany` active→expired +
  nested create with clientId/sourceTemplateId/status=active), null on unknown
  template, `findActiveByClient` found/null, `findHistoryByClient` non-active
  summaries.
- `RoutineTemplate.test.ts` — computed `endDate` (startDate + durationWeeks*7)
  and `isExpired` before/after the end date; null for library templates.
- `validator.test.ts` — `assignRoutineSchema`: templateId positive, startDate
  required (coerced), durationWeeks positive.
- `clientRoutineService.test.ts` — assign (client-not-found, template-not-found,
  clone+close), getActive (found/null/not-found), getHistory, adjust
  (no-active-not-found, replace nested, unknown-exercise rejection).
- `clientRoutineRoutes.test.ts` — 401 unauthenticated, 201 assign (+ computed
  fields) / 400 missing / 404 client / 404 template, 200 active (routine and
  null), 200 history, 200 adjust / 404 no-active.
- `PrismaClientRepository.test.ts` — client list now returns `hasActiveRoutine`
  (true when the client has an active routine), with the filtered include.

## Full Backend Suite
`npx jest --coverage`:
- Test Suites: 26 passed, 26 total
- Tests: 203 passed, 203 total
- Coverage (all files): 98.43% statements, 92.59% branches, 99.4% functions,
  98.42% lines — above the 90% threshold.
- New files (`clientRoutineService.ts`, `clientRoutineController.ts`,
  `clientRoutineRoutes.ts`) at ~100%/93%.

## Post-Test Database State
Unchanged from baseline (RoutineTemplate = 2, Client = 0, Exercise = 11). Unit
tests use mocked Prisma clients; the database was not mutated.

## Outcome
- Step 6 status: PASS
- Blocking issues: none
