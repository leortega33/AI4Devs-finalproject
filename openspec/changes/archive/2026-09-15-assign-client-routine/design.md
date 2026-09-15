## Context

US-006 adds the client-assignment lifecycle on top of the routine entities from
US-005 (`RoutineTemplate`/`RoutineSession`/`RoutineExerciseEntry`). No new
tables: a client routine is a `RoutineTemplate` row with `clientId`,
`sourceTemplateId`, `startDate`, `durationWeeks`, and `status` populated. It
follows the existing DDD layered pattern and reuses the routine repository's
nested mapping and deep-clone helpers. Auth reuses `authMiddleware` (US-001).

## Goals / Non-Goals

**Goals**
- Assign a template to a client as an independent deep clone.
- Enforce exactly one active routine per client (assigning closes the previous).
- Read the active routine (with empty state), list history, and adjust the
  active routine.

**Non-Goals**
- No changes to library-template CRUD/duplicate (US-005).
- No stored `expiresAt`: expiration is computed from `startDate + durationWeeks`
  at read time.
- No routine progress/attendance tracking (Phase 2).

## Decisions

### Data usage
- Client routine = `RoutineTemplate` with `clientId` set, `sourceTemplateId` =
  the library template id, `startDate`, `durationWeeks`, `status = active`.
- "Closing" a routine sets `status = expired`.
- History = the client's routines with `status != active`.
- `status = draft` remains the library-template default; client routines are
  `active`/`expired` only.

### API shape (nested under a client)
- `POST /api/clients/:clientId/routine` — body `{ templateId, startDate,
  durationWeeks }`; deep-clones the template, closes the previous active
  routine, returns the new active routine (201). `404` for unknown client;
  `400`/`404` for unknown template; `400` for missing/invalid fields.
- `GET /api/clients/:clientId/routine` — returns the active routine or `null`
  (200). `404` for unknown client.
- `GET /api/clients/:clientId/routines/history` — returns closed routine
  summaries (200). `404` for unknown client.
- `PUT /api/clients/:clientId/routine` — replaces the active routine's
  sessions/entries (same payload as templates); `404` when the client has no
  active routine; `400` on validation error.
- Mounted as a nested `mergeParams` router at `/api/clients/:clientId`,
  protected by `authMiddleware`, consistent with the medical-record routes.

### Validation
- Zod `assignRoutineSchema`: `templateId` positive int, `startDate` coercible
  date (required), `durationWeeks` positive int.
- Adjust reuses `routineTemplateSchema` (the nested payload) and the existing
  exercise-existence check.

### Repository additions (on the existing routine repository)
- `assignCloneToClient(clientId, templateId, startDate, durationWeeks)`: in a
  transaction — set the client's current active routine to `expired`, load the
  source template with nested data, then create a client-owned deep clone
  (`status = active`). Returns `null` if the template does not exist.
- `findActiveByClient(clientId)`: the client's `active` routine with nested
  detail, or `null`.
- `findHistoryByClient(clientId)`: summaries of the client's non-active
  routines, ordered by `startDate` desc.
- Adjust reuses `replaceNested(activeRoutineId, data)` (it only rewrites the
  scalar template fields + sessions/entries, preserving `clientId`/`status`/
  `startDate`/`durationWeeks`).

### Service behavior
- `ClientRoutineService(routineTemplateRepository, clientRepository,
  exerciseRepository)`.
- `assign(clientId, data)`: verify the client exists → `ClientNotFoundError`;
  clone via the repository → `RoutineTemplateNotFoundError` if the template is
  missing.
- `getActive(clientId)`: verify the client exists; return the active routine or
  `null` (attaches computed `endDate`/`isExpired` in the response mapping).
- `getHistory(clientId)`: verify the client exists; return history summaries.
- `adjust(clientId, data)`: verify the active routine exists → else
  `RoutineTemplateNotFoundError`; validate exercise references; replace nested.

### Computed expiration
- The response for the active routine includes a computed `endDate`
  (`startDate + durationWeeks * 7 days`) and `isExpired` flag, derived at read
  time; nothing extra is stored.

### Client list routine indicator (modifies client-management)
- The client list (`GET /api/clients`) additionally returns `hasActiveRoutine`
  per client, derived from whether the client has a `RoutineTemplate` with
  `status = active`. Implemented by including a filtered active-routine lookup
  in `PrismaClientRepository.findAll` and exposing `hasActiveRoutine` on the
  `Client` list mapping (create/findById are unaffected).
- The frontend client list gains a "Rutina" column showing an
  assigned/not-assigned chip, plus a "Rutina" row action that opens the
  client-routine page.

### Frontend
- `services/clientRoutineService.ts`: `getActive`, `assign`, `adjust`,
  `getHistory`.
- `pages/ClientRoutinePage.tsx` at `/clients/:clientId/routine` (behind
  `ProtectedRoute` + `AppLayout`, `BackButton` to the client list, reached via a
  "Routine" action per row in the client list): shows the active routine (or an
  empty state), an "Assign routine" control (a template picker dialog + start
  date + duration), and a history list. Reuses read-only rendering of the nested
  routine.
- `components/TemplatePickerDialog.tsx`: lists library templates to choose from
  when assigning.
- New i18n keys under a `clientRoutine` namespace (Spanish-first).

## Risks / Trade-offs

- **Single active routine invariant**: enforced by closing the previous active
  routine inside the same transaction as the new clone, avoiding a window with
  two active routines.
- **Computed expiration**: avoids data duplication but means `isExpired` is
  always derived; acceptable and simpler for the MVP.
- **Reusing `replaceNested` for adjust**: safe because it does not touch the
  client/status/date fields; covered by a test asserting the source template is
  unchanged.

## Open Questions

- None. Expiration-from-duration and full-replace adjust are confirmed in the
  backlog.
