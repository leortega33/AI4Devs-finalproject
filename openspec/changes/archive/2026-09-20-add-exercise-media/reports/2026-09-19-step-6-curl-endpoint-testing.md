# Step 6 Report - Manual Endpoint Testing with curl

- Date: 2026-09-19
- Change: add-exercise-media (US-019)
- Environment: backend :3000 (restarted with the new code), docker gym-postgres up

## Commands and Results

Logged in via `POST /api/auth/login` (cookie jar).

### Create with media
`POST /api/exercises` with `videoUrl: https://youtu.be/demo`,
`imageUrl: https://example.com/x.png` → **201**, id 36.

### Read back
`GET /api/exercises/36` → `videoUrl: https://youtu.be/demo`,
`imageUrl: https://example.com/x.png` (round-trip OK).

### Empty media → null
`PUT /api/exercises/36` with `videoUrl: ""`, `imageUrl: ""` →
`videoUrl: null`, `imageUrl: null` (empty treated as no media).

### Malformed URL rejected
`POST /api/exercises` with `videoUrl: "not-a-url"` → **400**.

## Cleanup

- Deleted the test exercise; catalog back to 11.

## Outcome

- Step 6 status: PASS
- Blocking issues: none
