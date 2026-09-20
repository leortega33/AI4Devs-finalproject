## Context

The medical record (US-003) is one optional row per client (`MedicalRecord`,
unique `clientId`, cascade on client delete). `MedicalRecordService.upsert`
delegates to `PrismaMedicalRecordRepository.upsert` (`prisma.medicalRecord.upsert`
by `clientId`); `getByClientId` reads the single row. The controller exposes
`GET`/`PUT /api/clients/:clientId/medical-record`, auth-protected and nested under
the client. The frontend `MedicalRecordPage` loads the record into a form and
saves via `medicalRecordService.save`; there is no history today.

## Goals / Non-Goals

**Goals**
- Persist a full, timestamped snapshot on every save and expose the history.
- Show a read-only history (newest first) on the medical-record page.

**Non-Goals**
- No field-level diffs, no restore/rollback, no editing of past versions.
- No change to the current-state read or the upsert semantics.
- No pagination (MVP scale; newest-first full list is enough).

## Decisions

### Data model
- New Prisma model `MedicalRecordVersion`:
  - `id` (autoincrement), `clientId` (FK → `Client`, `onDelete: Cascade`),
    `createdAt @default(now())`, and a full copy of the medical fields
    (`preexistingConditions`, `injuries`, `surgeriesOrProsthetics`,
    `physicalRestrictions`, `medication`, `allergies`, `bloodType`, `notes`) all
    `String?`.
  - Index on `[clientId, createdAt]` for newest-first reads.
  - `Client` gains a `medicalRecordVersions MedicalRecordVersion[]` relation.
- Migration via `prisma migrate dev` (additive; existing rows untouched — clients
  saved before this change simply have no versions until the next save).

### Backend
- Domain: `MedicalRecordVersion` model (mirrors `MedicalRecord` fields + required
  `createdAt`).
- Repository: new `MedicalRecordVersionRepository` interface
  (`create(clientId, snapshot)`, `listByClientId(clientId): Promise<MedicalRecordVersion[]>`
  newest first) + `PrismaMedicalRecordVersionRepository`.
- Service: `MedicalRecordService` takes the version repository as a dependency.
  `upsert` writes a version snapshot **after** the record upsert succeeds (from
  the saved record's field values, so newest version == current record). New
  `getHistory(clientId)` ensures the client exists then returns the versions
  newest first.
- Controller: new `history` action returning `{ success, data: MedicalRecordVersion[] }`.
- Route: `GET /` history mounted under a nested router
  `/api/clients/:clientId/medical-record/history` (auth-protected). Wire the new
  repository in `index.ts`.

### Frontend
- `medicalRecordService`: add `MedicalRecordVersion` type and
  `getHistory(clientId): Promise<MedicalRecordVersion[]>`.
- `MedicalRecordPage`: below the form, a **history** section (MUI list/timeline)
  showing each version's timestamp (localized) and its captured values; empty
  state when there are none. Refresh the history after a successful save.
- i18n: `medicalRecord.history.*` keys (es/en): section title, empty state,
  timestamp label.

## Risks / Trade-offs
- Full snapshots duplicate field data per save (storage growth). Acceptable at
  MVP scale; revisit (diffs/pruning) only if needed.
- Two writes per save (upsert + version insert). Kept simple (sequential, version
  after upsert); a transaction is optional and not required for MVP correctness
  since the version is derived from the already-persisted record.

## Migration Plan
- Additive migration `add_medical_record_versions`; no backfill (history starts
  accumulating from the first save after deploy). All existing suites stay green;
  new tests cover version-on-save, newest-first history, empty history, and the
  history render.

## Open Questions
- None. Full snapshots, newest-first, no restore — per the enriched US-021.
