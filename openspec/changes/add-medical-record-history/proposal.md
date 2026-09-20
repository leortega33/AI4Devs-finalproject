## Why

Today a client's medical record (US-003) stores only the **current** state: every
save is an upsert that overwrites the previous values, so there is no way to see
how a client's condition evolved. US-021 adds **versioning**: each save keeps a
full snapshot of the prior state, and the medical record screen shows a history of
past versions with timestamps.

## What Changes

- On every medical-record save (create or update), the system SHALL record a
  full **snapshot** of the resulting record as an immutable version with its own
  timestamp.
- Add `GET /api/clients/:clientId/medical-record/history` returning the client's
  versions, newest first.
- The medical-record screen SHALL show a **history** (timeline) of past versions
  with timestamps, alongside the current editable record.

## Impact

- Data model: new `MedicalRecordVersion` table (full snapshot of the record
  fields + `createdAt`, FK to `Client`). **Migration required.**
- Backend: version model/repository; the medical-record service writes a version
  on each save and exposes the history; new controller action + route. The
  existing upsert behavior and current-state read are unchanged.
- Frontend: `medicalRecordService` gains `getHistory`; the medical-record page
  renders a history section; types + i18n (es/en).
- Docs: `docs/api-spec.yml` (history endpoint + `MedicalRecordVersion` schema),
  `docs/data-model.md` (new entity), `readme.md`/`prompts.md` on close.

## Scope Notes

- **Full snapshots**, not field-level diffs (simpler, easy to display) — the
  enriched US-021 open decision resolved this way.
- A version is written **after** the upsert succeeds, capturing the saved state
  (so the newest version equals the current record).
- History is read-only and newest-first; no editing or restoring of past
  versions in this change.
- Storage growth is acceptable at MVP scale (one row per save).
