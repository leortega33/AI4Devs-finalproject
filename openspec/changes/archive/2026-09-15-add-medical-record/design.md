## Context

US-003 adds an optional medical file to the existing `Client` (US-002). The
backend follows the same DDD layered pattern already used for clients
(domain model → repository interface → Prisma repository → service →
controller → routes), and the frontend follows the existing service + MUI
form pattern. Auth reuses the `authMiddleware` from US-001.

## Goals / Non-Goals

**Goals**
- One optional medical record per client, viewable and editable independently
  of the client's basic data.
- Simple read + upsert API nested under the client.
- Clear empty state when a client has no record yet.

**Non-Goals**
- No history/versioning (only current state) — deferred to Phase 2.
- No automatic contraindication/routine warnings from medical data (Phase 2).
- No extra encryption at rest beyond the database itself (single admin, single
  DB) — flagged for revisit if stricter protection is required later.

## Decisions

### Data model
- `MedicalRecord` model: `id`, `clientId` (unique FK → `Client`,
  `onDelete: Cascade`), `preexistingConditions`, `injuries`,
  `surgeriesOrProsthetics`, `physicalRestrictions`, `medication`, `allergies`,
  `bloodType`, `notes`, `createdAt`, `updatedAt`. All medical fields are
  nullable strings.
- 1:1 with `Client`; add the inverse `medicalRecord MedicalRecord?` relation
  on `Client` (no data change to existing client columns).

### API shape
- `GET /api/clients/:clientId/medical-record` → `200 { success, data }` where
  `data` is the record or `null` when none exists. A non-existent client →
  `404`.
- `PUT /api/clients/:clientId/medical-record` → upsert; `200 { success, data }`
  with the saved record. Non-existent client → `404`; oversized field → `400`.
- Nested router mounted at `/api/clients/:clientId/medical-record`
  (`mergeParams: true`) and protected by `authMiddleware`, consistent with the
  existing client routes.

### Validation
- Zod `medicalRecordSchema`: every field `.string().max(1000).optional()
  .nullable()` (free text, 1000-char limit per field, adjustable);
  `bloodType` optional string. An all-empty payload is valid.

### Service behavior
- `medicalRecordService.getByClientId(clientId)`: verify the client exists
  (throw `ClientNotFoundError` otherwise), then return the record or `null`.
- `medicalRecordService.upsert(clientId, data)`: verify the client exists,
  then create-or-update the record via the repository's upsert.
- Reuse the existing `ClientNotFoundError` (already mapped to 404 by the error
  handler) so no new error mapping is needed.

### Frontend
- `services/medicalRecordService.ts`: `get(clientId)` and `save(clientId,
  data)`.
- `components/MedicalRecordForm.tsx`: MUI form with the medical fields and an
  empty state.
- `pages/MedicalRecordPage.tsx`: a dedicated page at
  `/clients/:clientId/medical-record` (behind `ProtectedRoute` + `AppLayout`)
  that loads the record on open, renders `MedicalRecordForm`, and saves through
  the medical-record service. It includes a `BackButton` to the client list and
  is reached from the client list (a "Medical record" action per row) and/or
  the client edit screen. Because a client must exist first, there is no
  medical-record entry point during client creation.
- New i18n keys under a `medicalRecord` namespace in `es.json`/`en.json`.

## Risks / Trade-offs

- **Editing UX**: a dedicated medical-record page keeps the client form focused
  on basic data and gives medical information its own space; the trade-off is
  an extra navigation step (client list → medical record) which is acceptable
  for the MVP.
- **No encryption at rest**: acceptable for a single-admin MVP; documented as a
  future revisit.

## Migration Plan

- Add the `MedicalRecord` model + inverse relation, run
  `npx prisma migrate dev --name add-medical-record`. Additive only; no
  changes to existing rows.

## Open Questions

- Field length limit fixed at 1000 chars per field for the MVP (adjustable if
  the trainer needs longer notes).
