## Why

Two polish issues surfaced while testing the exercise catalog (US-004):

1. The seeded base catalog is in English (exercise names, muscle groups,
   equipment), but the trainer works in Spanish — the base content should read
   naturally in the trainer's language.
2. The exercise form lets the user type negative values for default sets/reps.
   The backend already rejects them, but the UI should prevent negative input
   and give a clear message instead of a generic save failure.

## What Changes

- Seed the base exercise catalog in Spanish (names, muscle groups, equipment
  values), keeping code, identifiers, and comments in English per the language
  standards. Only the stored data content changes.
- Prevent negative default sets/reps in the exercise form (numeric inputs with
  a `min` of 0) and reject them with a clear client-side validation message,
  matching the backend's non-negative rule.

## Capabilities

### Modified Capabilities
- `exercise-catalog`: refine the "Create exercise" requirement (explicit
  non-negative sets/reps, prevented at input) and the "Seeded base catalog"
  requirement (seeded in the trainer's language, Spanish).

## Impact

- `prisma/seed.ts` base catalog data translated to Spanish (idempotency
  preserved via find-or-create by name; the previous English rows, if present,
  remain and can be cleaned manually in dev — the seed does not delete).
- `frontend/src/pages/ExerciseFormPage.tsx` numeric inputs get `min: 0` and a
  client-side non-negative validation with a localized message; new i18n key.
- Tests updated: backend seed-content assertions (if any) stay seed-agnostic;
  frontend gains a negative-value validation test.
- No API/schema changes; no migration.
