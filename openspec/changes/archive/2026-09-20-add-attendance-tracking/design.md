## Context

Client-scoped resources follow a consistent pattern: a domain model, a repository
interface + Prisma implementation, an application service that ensures the client
exists (`ClientNotFoundError` → 404), a zod validator, a controller, and a nested
router mounted under `/api/clients/:clientId/...` (see payments and medical
records). The client list renders per-row **action icons** (edit, medical record,
routine, payments) that navigate to a per-client page. There is no attendance
concept today.

## Goals / Non-Goals

**Goals**
- Record, list (with a frequency summary), and delete a client's check-ins.
- A per-client attendance page reached from a client-list action icon.

**Non-Goals**
- No QR/self-service, no charts, no dashboard integration, no per-day dedupe.

## Decisions

### Data model
- New Prisma model `Attendance`:
  - `id`, `clientId` (FK → `Client`, `onDelete: Cascade`), `checkInAt DateTime`,
    `note String?`, `createdAt DateTime @default(now())`.
  - Index `@@index([clientId, checkInAt])` for newest-first reads.
  - `Client` gains an `attendances Attendance[]` relation.
- Migration `add_attendance`.

### Backend
- Domain `Attendance` model (`id`, `clientId`, `checkInAt`, `note`, `createdAt`).
- `AttendanceRepository` interface: `create(clientId, { checkInAt, note })`,
  `listByClientId(clientId)` (newest first), `findById(id)`, `delete(id)`.
  Prisma implementation.
- `attendanceSchema` (zod): `checkInAt` optional ISO datetime (coerced to `Date`,
  defaults to now in the service when absent), `note` optional string
  `max(500)` → null when empty.
- `AttendanceSummary = { total, thisMonth, last30Days, lastCheckInAt }` computed
  in the service from the client's check-ins and a `now` reference:
  - `total` = count; `thisMonth` = check-ins whose month/year match `now`;
    `last30Days` = check-ins with `checkInAt >= now - 30d`; `lastCheckInAt` = the
    most recent `checkInAt` (or null).
- `AttendanceService`:
  - `record(clientId, data)` → ensure client exists → `create` with
    `checkInAt ?? now`.
  - `list(clientId, now)` → ensure client exists → `{ attendances, summary }`.
  - `remove(id)` → `findById` → `AttendanceNotFoundError` (404) if missing →
    `delete`.
- Controller + nested route `createClientAttendanceRoutes` mounted at
  `/api/clients/:clientId/attendance` (auth): `POST /`, `GET /`, `DELETE /:id`.
  Wire in `index.ts` (reuse `clientRepository`). Delete is id-scoped but mounted
  under the client path for a single nested router (`DELETE /:id`).

### Frontend
- `attendanceService`: `list(clientId)`, `create(clientId, data)`,
  `remove(clientId, id)`; types `Attendance`, `AttendanceSummary`,
  `AttendanceListResponse`.
- `ClientAttendancePage`: a summary panel (total / this month / last 30 days /
  last check-in), a **"Registrar asistencia"** button opening a dialog (date-time
  defaulting to today + optional note), and a list/`DataGrid` of check-ins with a
  delete action icon (confirm). Reuses the `BackButton`.
- Client list: a new **attendance** action icon (e.g. `EventAvailableOutlined`)
  navigating to `/clients/:id/attendance`; route added in `App.tsx`.
- i18n (es/en): an `attendance.*` block (title, summary labels, register dialog,
  delete confirm, empty state) + a `clients.actions.attendance` label.

## Risks / Trade-offs
- Summary is computed in-memory over a client's check-ins. Fine at MVP scale;
  could move to SQL aggregates if a client accrues very many rows.
- Allowing multiple check-ins per day keeps it simple; a per-day policy can be
  added later without a data change.

## Migration Plan
- Additive migration `add_attendance`; no backfill. All existing suites stay
  green; new tests cover the service (record/list/summary/delete/not-found), the
  repository, the route (shape + 401/404), the validator, and the page.

## Open Questions
- None. Manual check-in; summary = total / this month / last 30 days / last
  check-in; per-client page; no dashboard integration this iteration.
