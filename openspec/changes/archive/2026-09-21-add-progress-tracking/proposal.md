## Why

The app tracks payments, routines, attendance, and medical data per client, but
not their physical evolution. US-026 adds **progress tracking by measurements**:
the trainer records a client's body measurements at dated entries and sees the
evolution, so they can tell whether the training is working.

## What Changes

- A new per-client **Progress** resource: the trainer records a dated measurement
  entry (any subset of a fixed metric set: weight, body fat %, and circumferences),
  lists the entries (newest first) with a small summary, and deletes an entry.
- A per-client **Progreso** page, reached from a client-list action icon,
  consistent with the payments/attendance pattern.

## Impact

- Data model: new `ProgressEntry` table (`clientId`, `date`, optional numeric
  metrics, `note`, `createdAt`). **Migration required.** No photo columns.
- Backend: `ProgressEntry` domain model, repository (interface + Prisma), a
  `ProgressService` (ensures the client exists, requires at least one metric,
  computes the summary), validator, controller, and a nested route
  `/api/clients/:clientId/progress` (record / list+summary / delete); wired in
  `index.ts`.
- Frontend: a `progressService`; a `ClientProgressPage` (summary panel + table +
  record dialog + delete action); a client-list action icon; routing; types +
  i18n (es/en).
- Docs: `docs/api-spec.yml` (the progress endpoints), `docs/data-model.md` (the
  `ProgressEntry` entity), `readme.md`/`prompts.md` on close.

## Scope Notes

- **Measurements only** — progress **photos** are a separate follow-up (US-026b)
  so this change needs no storage infrastructure.
- **Fixed optional metric set**: `weightKg`, `bodyFatPercent`, `chestCm`,
  `waistCm`, `hipsCm`, `armCm`, `thighCm`, plus a `note`. All optional, but an
  entry must have at least one metric.
- **Summary**: the latest weight and its change since the first recorded entry,
  plus the entry count. Charts are deferred.
- Metrics are non-negative numbers; dates stored in UTC and shown localized.

## Out of Scope (future)

- Progress photos (US-026b), charts, custom/extra metric definitions, and export.
