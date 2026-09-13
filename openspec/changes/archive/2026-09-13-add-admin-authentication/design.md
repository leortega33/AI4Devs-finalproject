## Context

This is the first implemented change in the repository: no `backend/` or
`frontend/` project exists yet (see `proposal.md` - Impact). The technical
context (stack, layering, standards) is already fixed in
`docs/backend-standards.md`, `docs/frontend-standards.md`, and
`docs/data-model.md`, which already describe the `User` entity and the
target DDD layered backend structure. This design focuses on the
authentication-specific decisions on top of that already-decided foundation.

## Goals / Non-Goals

**Goals:**
- Decide the session mechanism, password storage, and reset-token handling.
- Decide how the admin account is provisioned without a registration UI.
- Establish the auth middleware pattern every later change will reuse to
  protect its own routes.

**Non-Goals:**
- Multi-user support, roles, or permissions (single admin only, see
  `proposal.md`).
- Choosing a specific transactional email provider (tracked as an open
  question below; the integration is abstracted so the choice doesn't affect
  this design).
- Full CI/CD or production deployment setup (see "Deployment" in
  `docs/backend-standards.md`, still an open decision at the project level).

## Decisions

**1. Session mechanism: JWT in an httpOnly cookie, not a server-side session
store.**
A signed JWT stored in an httpOnly, secure, `sameSite=strict` cookie is
sufficient for a single-admin, single-instance Express app. A server-side
session store (e.g. Redis-backed `express-session`) was considered and
rejected: it would add an extra piece of infrastructure with no benefit at
this scale, since there is exactly one possible session at a time.

**2. Password hashing: bcrypt.**
`bcrypt` (cost factor ≥ 10) is the de-facto standard in the Node/Express
ecosystem, has first-class TypeScript support, and is sufficient for this
threat model. `argon2` was considered as a stronger alternative but adds
native-build complexity without a meaningful benefit for a single-account
system.

**3. Password-reset tokens: random token, only its hash persisted.**
The reset endpoint generates a random token, returns it only in the email
link, and stores solely its hash (`passwordResetTokenHash`) plus an
expiration (1 hour) in the `User` row (per `docs/data-model.md`). This way a
database leak alone cannot be used to reset the password. The token is
single-use: it's cleared once consumed.

**4. Admin provisioning: seed script from env vars, no registration UI.**
`prisma/seed.ts` creates the single admin user from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` env vars, failing fast if either is missing. A hardcoded
migration was considered and rejected: env-var-driven seeding keeps
credentials out of migration history and lets the same seed script run
safely in different environments.

**5. Rate limiting: middleware-based, in-memory.**
A lightweight middleware (e.g. `express-rate-limit`) on `/api/auth/login`
and `/api/auth/forgot-password` is enough to slow down brute-force attempts
at this traffic scale. A distributed/Redis-backed limiter was considered and
rejected as unnecessary operational overhead for a single-instance MVP.

**6. This change also creates the initial project scaffolding.**
Since no `backend/` or `frontend/` project exists yet, implementing this
capability includes creating the base Express/TypeScript/Prisma backend
project and the base Vite/React/TypeScript/MUI frontend project (structure
per `docs/backend-standards.md` / `docs/frontend-standards.md`). This was
judged the right place to do it because authentication is the first
capability that touches both layers end-to-end.

## Risks / Trade-offs

- **[Risk]** No email provider is chosen yet for password-reset emails →
  **[Mitigation]** implement `emailService` behind a small interface
  (`sendPasswordResetEmail(to, resetUrl)`) so swapping providers later
  doesn't touch `authService`; log the reset link to the console as a
  fallback in local development instead of failing.
- **[Risk]** httpOnly-cookie auth requires matching CORS/cookie
  configuration between the Vite dev server and the Express API during local
  development → **[Mitigation]** configure CORS with `credentials: true` and
  environment-appropriate `secure`/`sameSite` cookie settings, documented in
  `docs/development_guide.md`.
- **[Risk]** Weak or accidentally-default admin credentials in an
  environment → **[Mitigation]** `ADMIN_EMAIL`/`ADMIN_PASSWORD` are required
  at seed time with no built-in default; the seed script throws if either is
  missing.

## Migration Plan

This is the first change, so there is no existing data to migrate. The only
migration is the initial `prisma migrate dev` creating the `User` table.
Rollback, if ever needed, is the standard Prisma migration `down` for that
single migration; the seed script only ever affects the `User` table.

## Open Questions

- Which email provider to use for password-reset emails (e.g. Resend,
  Brevo) — deferred without risk since `emailService` is implemented behind
  an interface (see Risks / Trade-offs above); does not change this design,
  the spec, or the task breakdown.
