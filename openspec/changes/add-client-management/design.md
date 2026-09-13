## Context

Builds directly on the foundation created in US-001 (see `proposal.md` - Why):
the DDD-layered backend, the auth middleware, the Prisma setup, and the
React/MUI frontend with `ProtectedRoute` all already exist. The `Client`
entity is already described in `docs/data-model.md` (entity #2). This design
only covers the decisions specific to client management on top of that.

## Goals / Non-Goals

**Goals:**
- Establish the CRUD + list pattern (repository/service/controller/routes on
  the backend, list + form pages on the frontend) that US-003 through US-008
  will reuse.
- Decide how emergency contact and logical deactivation are modeled.

**Non-Goals:**
- Medical record (US-003), routines (US-005/006), and payments (US-007) — only
  the `Client` base entity is in scope here.
- Pagination and payment-status filtering (Phase 2, see the backlog).
- Multi-tenant scoping.

## Decisions

**1. Emergency contact stored as embedded columns on `Client`, not a separate
table.**
Per `docs/backend-standards.md` (Value Objects) and `docs/data-model.md`, the
emergency contact has no independent identity or lifecycle, so it lives as
`emergencyContactName/Phone/Relationship` columns on `Client`. A separate
table was rejected as unnecessary normalization for a one-to-one value object.

**2. Logical deactivation via a `status` enum-like field (`active` /
`inactive`), no hard delete and no deactivation reason.**
The API exposes no `DELETE`; deactivation is a dedicated status transition.
This preserves the history that payments/medical records/routines will depend
on. A `deletedAt` soft-delete timestamp was considered but rejected: an
explicit `active`/`inactive` status matches the domain language ("active
client") and drives the list filter directly.

**3. DNI is unique; validation mirrors creation on edit.**
DNI uniqueness is enforced at the database level (unique constraint) and
surfaced as a conflict error. Create and edit share the same validation
schema to avoid divergence.

**4. Status change is a dedicated endpoint (`PATCH .../status`), separate from
the general update.**
Keeps the activate/deactivate action explicit and auditable, and avoids
accidentally flipping status through a generic edit. A boolean body
(`{ status: 'active' | 'inactive' }`) keeps it simple.

**5. No pagination in the MVP.**
Expected client volume is low (single gym). The list endpoint returns all
matching clients. Revisit if the list grows large (noted in the backlog).

**6. Required vs optional fields (confirmed with the user).**
Required at creation and edit: `firstName`, `lastName`, `dni`, `phone`,
`email`, `birthDate`. Optional: `address`, `goal`, and the emergency contact
fields. `dni` is additionally unique across clients.

## Risks / Trade-offs

- **[Risk]** No pagination could become slow with a very large client list →
  **[Mitigation]** acceptable at single-gym MVP scale; the list endpoint's
  contract (search + status filter) already leaves room to add pagination
  later without breaking callers.
- **[Risk]** Case/accent-sensitive name search could miss expected matches →
  **[Mitigation]** implement search as case-insensitive `contains`; accent
  normalization is out of scope for the MVP and noted as a possible follow-up.

## Migration Plan

Single additive Prisma migration creating the `Client` table. No existing data
to migrate. Rollback is the standard Prisma migration down for that migration.
