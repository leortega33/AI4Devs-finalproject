## Context

Client-scoped resources follow a consistent pattern (see payments and attendance,
US-025): a domain model, a repository interface + Prisma implementation, an
application service that ensures the client exists (`ClientNotFoundError` → 404)
and computes a summary, a zod validator, a controller, and a nested router mounted
under `/api/clients/:clientId/...`. The client list renders per-row **action
icons** navigating to a per-client page. There is no progress concept today.

## Goals / Non-Goals

**Goals**
- Record, list (with an evolution summary), and delete a client's measurement
  entries.
- A per-client progress page reached from a client-list action icon.

**Non-Goals**
- No photos (US-026b), no charts, no custom metrics, no export.

## Decisions

### Data model
- New Prisma model `ProgressEntry`:
  - `id`, `clientId` (FK → `Client`, `onDelete: Cascade`), `date DateTime`,
    `weightKg Float?`, `bodyFatPercent Float?`, `chestCm Float?`, `waistCm Float?`,
    `hipsCm Float?`, `armCm Float?`, `thighCm Float?`, `note String?`,
    `createdAt DateTime @default(now())`.
  - Index `@@index([clientId, date])` for newest-first reads.
  - `Client` gains a `progressEntries ProgressEntry[]` relation.
- Migration `add_progress_entry`.

### Backend
- Domain `ProgressEntry` model mirroring the columns.
- `ProgressEntryRepository` interface: `create(clientId, data)`,
  `listByClientId(clientId)` (newest first), `findById(id)`, `delete(id)`. Prisma
  implementation.
- `progressSchema` (zod): `date` optional (coerced, defaults to now in the
  service); each metric `z.number().nonnegative().optional().nullable()`; `note`
  optional `max(500)`. A `.refine` (or the service) enforces **at least one
  metric present**.
- `ProgressSummary = { latestWeightKg: number | null, weightChangeKg: number |
  null, entryCount: number }`:
  - `latestWeightKg` = the `weightKg` of the most recent entry that has one.
  - `weightChangeKg` = latest weight minus the `weightKg` of the earliest entry
    that has one (null when fewer than two weighed entries).
  - `entryCount` = total entries.
- `ProgressService`:
  - `record(clientId, data)` → ensure client exists → require at least one metric
    (throw `ValidationError` otherwise) → `create` with `date ?? now`.
  - `list(clientId)` → ensure client exists → `{ entries, summary }`.
  - `remove(id)` → `findById` → `ProgressEntryNotFoundError` (404) if missing →
    `delete`.
- Controller + nested route `createClientProgressRoutes` mounted at
  `/api/clients/:clientId/progress` (auth): `POST /`, `GET /`, `DELETE /:id`.
  Map `ProgressEntryNotFoundError` to 404 in the error handler. Wire in
  `index.ts` (reuse `clientRepository`).

### Frontend
- `progressService`: `list(clientId)`, `create(clientId, data)`,
  `remove(clientId, id)`; types `ProgressEntry`, `ProgressSummary`.
- `ClientProgressPage`: a summary panel (latest weight / weight change / entry
  count), a **"Registrar medición"** button opening a dialog (date defaulting to
  today, the optional metric fields, and a note), and a table of entries with a
  delete action (confirm). Reuses `BackButton`. Uses a plain MUI `Table` (not
  DataGrid) for deterministic rendering and testable row actions (per the US-025
  learning).
- Client list: a new **progress** action icon (e.g. `MonitorWeightOutlined`)
  navigating to `/clients/:id/progress`; route added in `App.tsx`.
- i18n (es/en): a `progress.*` block (title, summary labels, metric labels,
  record dialog, delete confirm, empty state) + a `clients.actions.progress`
  label.

## Risks / Trade-offs
- Summary is computed in-memory over a client's entries. Fine at MVP scale.
- The fixed metric set is intentionally small; adding metrics later is a purely
  additive migration + form/labels change.

## Migration Plan
- Additive migration `add_progress_entry`; no backfill. All existing suites stay
  green; new tests cover the service (record/list/summary/delete/validation/
  not-found), the repository, the route (shape + 400/401/404), the validator, and
  the page.

## Open Questions
- None. Measurements-only; fixed optional metric set; table + latest-weight
  summary; photos (US-026b) and charts deferred.
