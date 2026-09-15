## Why

With reusable routine templates in place (US-005), the trainer needs to assign
a routine to a specific client so each client has an active, trackable routine.
Assigning clones a library template into a client-owned routine that can then be
adjusted independently, keeping a full per-client routine history.

## What Changes

- Assign a routine to a client by deep-cloning a library template into a
  client-owned routine (`clientId` set, `sourceTemplateId` pointing back to the
  template, `startDate`, `durationWeeks`, `status = active`).
- Only one active routine per client: assigning a new one closes (expires) the
  previous active routine.
- Read the client's current active routine (full nested detail) with an empty
  state when none exists.
- View the client's routine history (previously assigned routines).
- Adjust the currently assigned routine (replace its sessions/entries, same
  full-replace pattern as templates), independently of the source template.
- All endpoints protected by the existing auth middleware (US-001).

## Capabilities

### New Capabilities
- `client-routine`: assign a template to a client (deep clone + close previous
  active), read the active routine, list history, and adjust the active routine.

### Modified Capabilities
- `client-management`: the client list additionally indicates, per client,
  whether they currently have an active routine assigned, so the trainer can see
  at a glance who has or lacks a routine.

## Impact

- No new tables/migration: reuses `RoutineTemplate`/`RoutineSession`/
  `RoutineExerciseEntry`, now populated with `clientId`/`sourceTemplateId`/
  `startDate`/`durationWeeks`/`status`.
- New `/api/clients/:clientId/routine` endpoints (POST assign, GET active,
  PUT adjust) and `/api/clients/:clientId/routines/history` (GET), all behind
  `authMiddleware`.
- Routine expiration is computed from `startDate + durationWeeks` at read time,
  not stored as a separate field.
- New frontend client-routine service and a dedicated client-routine page
  (assign from a template, view the active routine, view history), reachable
  from the client list, behind `ProtectedRoute`.
- The client list gains a routine-assigned indicator column (derived from each
  client's active routine) and a "Routine" action per row to open the page.
- `docs/api-spec.yml` gains the client-routine endpoints; `docs/data-model.md`
  already covers the reused entities.

## Scope Notes

- The library-template CRUD/duplicate (US-005) is unchanged. This change only
  adds the client-assignment lifecycle on top of the same entities.
