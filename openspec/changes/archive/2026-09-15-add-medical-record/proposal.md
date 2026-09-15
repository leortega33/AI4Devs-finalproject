## Why

With client management in place (US-002), the trainer needs each client's
medical information to design safe routines and react correctly in an
emergency. Today this data lives on paper or in the trainer's memory. The
medical record attaches to an existing client and is the natural next step
before routines (US-005/US-006) are built on top of client data.

## What Changes

- Add an optional, one-to-one `MedicalRecord` per `Client` (pre-existing
  conditions, injuries, surgeries/prosthetics, physical restrictions,
  medication, allergies, blood type, free-text notes).
- The record is NOT required at client registration; it can be filled in
  later and edited independently of the client's basic data.
- Only the current state is stored (no history/versioning in the MVP).
- Two endpoints nested under a client: read the record (`null` when none
  exists yet) and create-or-update it (upsert).
- A "Medical record" section in the client detail/edit screen with an empty
  state when no record exists yet.
- All endpoints protected by the existing auth middleware (US-001).

## Capabilities

### New Capabilities
- `medical-record`: view and upsert a single client's optional medical file.

### Modified Capabilities
<!-- None. Reuses the auth middleware from admin-authentication and the
     Client entity from client-management without changing their requirements. -->

## Impact

- New `MedicalRecord` table added via a Prisma migration (model already
  described in `docs/data-model.md` entity #3), 1:1 with `Client` via a unique
  `clientId`, `ON DELETE CASCADE`.
- New `/api/clients/:clientId/medical-record` endpoints (GET, PUT), all behind
  the existing `authMiddleware`; a missing client returns 404.
- New frontend medical-record service and a form/section reachable from the
  client edit screen, behind `ProtectedRoute`.
- `docs/api-spec.yml` gains the medical-record endpoints; `docs/data-model.md`
  already defines `MedicalRecord` (verify/adjust during implementation).
