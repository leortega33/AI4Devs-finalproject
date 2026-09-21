## Why

The app tracks payments, medical records, and routines per client, but not
whether the client actually shows up. US-025 adds **attendance tracking**: the
trainer records a client's check-ins and sees their frequency, so they can tell
how regularly each client trains.

## What Changes

- A new per-client **Attendance** resource: the trainer records a check-in
  (timestamp defaults to now, optional note), lists a client's check-ins (newest
  first) with a **frequency summary**, and deletes a check-in to fix mistakes.
- A per-client **Asistencia** page, reached from a client-list action icon,
  consistent with the payments/medical-record pattern.

## Impact

- Data model: new `Attendance` table (`clientId`, `checkInAt`, `note`,
  `createdAt`). **Migration required.**
- Backend: `Attendance` domain model, repository (interface + Prisma), an
  `AttendanceService` (ensures the client exists, computes the summary),
  validator, controller, and a nested route
  `/api/clients/:clientId/attendance` (register / list+summary / delete); wired in
  `index.ts`.
- Frontend: an `attendanceService`; a `ClientAttendancePage` (summary panel +
  list + register dialog + delete action); a client-list action icon; routing;
  types + i18n (es/en).
- Docs: `docs/api-spec.yml` (the attendance endpoints), `docs/data-model.md`
  (the `Attendance` entity), `readme.md`/`prompts.md` on close.

## Scope Notes

- **Manual check-in by the trainer** — no QR/self-service (there is no
  client-facing app).
- **Summary metrics**: total, this month, last 30 days, and the last check-in
  date, computed server-side.
- Multiple check-ins per day are allowed (no per-day de-duplication).
- Timestamps stored in UTC and shown localized.

## Out of Scope (future)

- QR/self-service check-in, attendance charts, dashboard integration (e.g.
  inactivity alerts), and per-day de-duplication.
