## Why

With authentication in place (US-001), the trainer needs a single place to
manage their clients' basic data. Client management is the foundation for the
rest of the MVP: medical records (US-003), assigned routines (US-006), and
payments (US-007) all attach to a client, so this capability must exist before
them.

## What Changes

- Add a `Client` entity with full CRUD: create, view, list, edit.
- Deactivate/reactivate a client via a logical status flag (no hard delete),
  preserving history for future payments/medical records/routines.
- List clients with search by name and filter by status (active/inactive).
- All endpoints protected by the existing auth middleware (US-001).

## Capabilities

### New Capabilities
- `client-management`: CRUD and logical activation/deactivation of gym client
  profiles, plus a searchable/filterable client list.

### Modified Capabilities
<!-- None. Reuses the auth middleware from admin-authentication without
     changing its requirements. -->

## Impact

- New `Client` table added via a Prisma migration (model already described in
  `docs/data-model.md` entity #2).
- New `/api/clients` endpoints, all behind the existing `authMiddleware`.
- New frontend client list and client form pages, plus a client service and
  routing, all behind `ProtectedRoute`.
- `docs/api-spec.yml` gains the client endpoints; `docs/data-model.md` already
  defines `Client` (verify/adjust during implementation).
