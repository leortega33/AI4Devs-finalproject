# Step 6 Report - Manual Endpoint Testing with curl

- Date: 2026-09-19
- Change: add-weekly-progression (US-018)
- Environment: backend :3000 (restarted with the nested-weeks code), docker gym-postgres up

## Setup

- Logged in via `POST /api/auth/login` (cookie jar).

## Commands and Results

### Create with a weekly progression
`POST /api/routine-templates` with an entry whose `weeks` is
`[{week:1,kg:60,…},{week:2,kg:62.5,…}]` → **201**, template id 115.

### Round-trip on read
`GET /api/routine-templates/115` →
`sessions[0].entries[0].weeks = [{"id":1,"week":1,"kg":60,"reps":8,"series":4},{"id":2,"week":2,"kg":62.5,"reps":8,"series":4}]`
— the weeks come back in week order. PASS

### Update replaces the weeks
`PUT /api/routine-templates/115` with a single week `[{week:1,kg:70,reps:6,series:5}]`
→ **200**; re-reading shows `weeks = [{"id":3,"week":1,"kg":70,"reps":6,"series":5}]`
(the previous two weeks were replaced). PASS

### Duplicate week rejected
`POST /api/routine-templates` with `weeks:[{week:1},{week:1}]` → **400**
(validator rejects duplicate week numbers). PASS

## Cleanup

- Deleted the test templates (`RoutineTemplate` back to 0) and removed the temp
  cookie/id files.

## Outcome

- Step 6 status: PASS
- Blocking issues: none
