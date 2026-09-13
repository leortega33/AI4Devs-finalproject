## Why

The gym management MVP has no authentication yet, and no backend/frontend
project scaffolding exists at all. Every other MVP capability (clients,
medical records, exercise catalog, routines, payments, dashboard) requires
data that only the gym owner/trainer should be able to see, so a single-admin
login must exist before any of those capabilities can be safely built. This
is also the first change in the repository, so it establishes the initial
backend/frontend project structure the rest of the MVP will build on.

## What Changes

- Add a single, pre-seeded admin `User` account (no self-registration screen).
- Add login (`POST /api/auth/login`) that validates credentials and starts a
  session via an httpOnly JWT cookie.
- Add logout (`POST /api/auth/logout`) and current-user (`GET /api/auth/me`).
- Add password recovery: `POST /api/auth/forgot-password` (always returns a
  generic response) and `POST /api/auth/reset-password`.
- Add an auth middleware that will protect every other route added by future
  changes.
- Add a seed script that creates the admin user from `ADMIN_EMAIL` /
  `ADMIN_PASSWORD` env vars.
- Scaffold the initial `backend/` (Node.js, Express, TypeScript, Prisma,
  DDD layered structure per `docs/backend-standards.md`) and `frontend/`
  (Vite, React, TypeScript, MUI per `docs/frontend-standards.md`) projects,
  since none exist yet.

## Capabilities

### New Capabilities
- `admin-authentication`: single-admin login/logout/session-check and
  password recovery, plus the auth middleware that protects all other
  capabilities.

### Modified Capabilities
<!-- None: greenfield repo, no existing specs yet. -->

## Impact

- New `backend/` and `frontend/` projects created from scratch (first change
  in the repo) — no existing code is modified.
- New `User` table added via a Prisma migration.
- New environment variables: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`,
  `ADMIN_PASSWORD`, plus password-reset email provider credentials (provider
  TBD, see open technical decision in `planning/user-stories-backlog.md`
  US-001).
- Establishes the auth middleware and `ProtectedRoute` pattern that every
  future capability (US-002 through US-009) will depend on.
