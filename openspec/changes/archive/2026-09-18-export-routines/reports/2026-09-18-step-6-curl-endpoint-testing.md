# Step 6 Report - Manual Endpoint Testing with curl

- Date: 2026-09-18
- Change: export-routines (US-017)
- Environment: backend :3000 (restarted with the new routes), docker gym-postgres up

## Setup

- Logged in via `POST /api/auth/login` (cookie jar).
- Created a routine template with one session (a warm-up entry + a main entry
  with kg/reps/series/notes) → id **107**.

## Commands and Results

### PDF export (authenticated)
`GET /api/routine-templates/107/export.pdf`
- **200 OK**, `Content-Type: application/pdf`,
  `Content-Disposition: attachment; filename="routine-107.pdf"`.
- Body signature `%PDF-`, 1645 bytes. `file` → "PDF document, version 1.3, 1 pages".

### Excel export (authenticated, `?lang=en`)
`GET /api/routine-templates/107/export.xlsx?lang=en`
- **200 OK**,
  `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
  `Content-Disposition: attachment; filename="routine-107.xlsx"`.
- Body signature `PK`, 6641 bytes. `file` → "Microsoft Excel 2007+".

### Not found
`GET /api/routine-templates/999999/export.pdf` → **404**.

### Unauthenticated
`GET /api/routine-templates/107/export.pdf` without the session cookie → **401**.

## Cleanup

- Deleted the test template (`RoutineTemplate` back to 0) and removed the
  downloaded files.

## Outcome

- Step 6 status: PASS
- Blocking issues: none
