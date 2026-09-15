# Gym Management System — User Stories Backlog (Draft)

> Working document for rough/vague user stories. Once a story has enough
> description, run the `enrich-us` skill on it (direct input mode), then
> move it into the formal OpenSpec flow (`/new` → `/ff` → `/apply` → `/verify`
> → `/adversarial-review` → `/archive` → `/commit`).

## Status legend

- `draft` — just captured, needs more detail
- `ready-to-enrich` — has enough description to run `enrich-us`
- `enriched` — processed by `enrich-us`, ready for OpenSpec `/new`+`/ff`
- `in-openspec` — has a corresponding change under `openspec/changes/`

---

## MVP Scope (Phase 1)

Single-user gym management MVP. All features below are in scope for Phase 1
and will be turned into fully-detailed OpenSpec changes one at a time.

## US-001: Basic authentication (single admin user)

- **Status:** done (archived — see `openspec/changes/archive/2026-09-13-add-admin-authentication/` and `openspec/specs/admin-authentication/`)

**User story:** As a gym owner/trainer (single admin user), I want to log in
with email/password and recover my password if I forget it, so that only I
can access client data, medical records, and payments.

**Functional description:** single hardcoded admin account (no
self-registration screen), persistent session (no forced expiration) once
logged in. All other endpoints in the system must be protected behind this
authentication.

**Data model (Prisma):** `User` — `id`, `email` (unique), `passwordHash`,
`passwordResetTokenHash` (nullable), `passwordResetExpiresAt` (nullable),
`createdAt`, `updatedAt`.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Validates credentials, sets an httpOnly session cookie (JWT) |
| POST | `/api/auth/logout` | Clears the session cookie |
| GET | `/api/auth/me` | Returns current authenticated user (used by the frontend on app load) |
| POST | `/api/auth/forgot-password` | Accepts `{ email }`, always returns a generic success response, sends reset email only if it matches the admin account |
| POST | `/api/auth/reset-password` | Accepts `{ token, newPassword }`, validates token + expiration, updates password |

**Files/modules to create:**

*Backend* (`backend/src/...`, DDD layers per
[docs/backend-standards.md](../docs/backend-standards.md)):
- `domain/models/User.ts` — entity
- `domain/repositories/UserRepository.ts` — interface (`findByEmail`,
  `updatePasswordHash`, `setPasswordResetToken`, `findByValidResetToken`)
- `infrastructure/repositories/PrismaUserRepository.ts` — Prisma implementation
- `infrastructure/email/emailService.ts` — sends the reset email (provider
  TBD, evaluate free-tier options)
- `application/services/authService.ts` — login (bcrypt compare + JWT sign),
  requestPasswordReset, resetPassword
- `application/validator.ts` — add login/forgot/reset request schemas
- `presentation/controllers/authController.ts` — HTTP handlers
- `routes/authRoutes.ts` — route wiring
- `middleware/authMiddleware.ts` — verifies JWT cookie, attaches `req.user`,
  used to protect every other route in the app
- `prisma/schema.prisma` — add `User` model
- `prisma/seed.ts` — creates the single admin user from
  `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars

*Frontend* (`frontend/src/...`):
- `services/authService.ts` — axios calls for the 5 endpoints above
- `context/AuthContext.tsx` — auth state + `login`/`logout`, checks
  `/api/auth/me` on app load
- `components/ProtectedRoute.tsx` — route guard, redirects to `/login` if
  unauthenticated
- `pages/LoginPage.tsx`, `pages/ForgotPasswordPage.tsx`,
  `pages/ResetPasswordPage.tsx`

**Definition of done:**
- All 5 endpoints implemented, protected routes reject unauthenticated requests.
- Seed script creates the admin user from env vars; documented in
  `docs/development_guide.md`.
- Frontend login/forgot/reset pages functional; authenticated state persists
  across reloads.
- `docs/api-spec.yml` updated with the 5 endpoints.

**Tests:**
- `authService`: successful login, wrong password, unknown email, reset
  request for matching/non-matching email (same response either way), reset
  with valid/expired/invalid token.
- `authMiddleware`: rejects missing/invalid/expired token.
- Frontend: login form validation, redirect when unauthenticated.

**Non-functional requirements:**
- Passwords hashed with bcrypt (cost ≥ 10), never logged.
- JWT signed with a secret from an env var, stored in an httpOnly, secure,
  `sameSite=strict` cookie.
- Reset tokens stored hashed, expire in 1 hour, single-use.
- Basic rate limiting on `/login` and `/forgot-password` to slow down brute force.

**Open technical decisions:**
- Email provider for password reset (pending — evaluate free tiers, e.g.
  Resend/Brevo).

## US-002: Client management (CRUD)

- **Status:** done (archived — see `openspec/changes/archive/2026-09-13-add-client-management/` and `openspec/specs/client-management/`)

**User story:** As a gym owner/trainer, I want to create, view, edit, and
deactivate client profiles, so that I have a single place with all my
clients' basic data.

**Functional description:** full CRUD over client profiles (full name, DNI,
phone, email, birth date, address, goal/notes, emergency contact, join date,
status). Deactivation is logical (status flag), not a hard delete, to
preserve payment/medical/routine history. The client list is searchable by
name and filterable by status; filtering by payment status is Phase 2.

**Data model (Prisma):** `Client` — see
[docs/data-model.md](../docs/data-model.md) entity #2 (already defined):
`id`, `firstName`, `lastName`, `dni`, `phone`, `email`, `birthDate`,
`address`, `goal`, `emergencyContactName/Phone/Relationship`, `joinDate`,
`status`, `createdAt`, `updatedAt`.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/clients` | List clients, query params `search` (by name) and `status` |
| GET | `/api/clients/:id` | Get a client's full detail |
| POST | `/api/clients` | Create a client |
| PUT | `/api/clients/:id` | Update a client's data |
| PATCH | `/api/clients/:id/status` | Activate/deactivate (`{ status: 'active' \| 'inactive' }`) |

**Files/modules to create:**

*Backend*: `domain/models/Client.ts`, `domain/repositories/ClientRepository.ts`,
`infrastructure/repositories/PrismaClientRepository.ts`,
`application/services/clientService.ts`, `application/validator.ts`
(additions), `presentation/controllers/clientController.ts`,
`routes/clientRoutes.ts`, `prisma/schema.prisma` (`Client` model).

*Frontend*: `services/clientService.ts`, `pages/ClientsListPage.tsx` (MUI
`DataGrid` with search + status filter), `pages/ClientFormPage.tsx`
(shared create/edit form), `components/DeactivateClientDialog.tsx`.

**Definition of done:**
- All 5 endpoints implemented and protected by the auth middleware (US-001).
- Client list page: search by name, filter by status, link to detail/edit.
- Create/edit form with validation matching backend rules.
- Deactivate action available with a confirmation dialog.
- `docs/api-spec.yml` updated with the 5 endpoints.

**Tests:**
- `clientService`: create (valid/invalid data), update, `findById`
  (found/not found), list with search/status filter combinations,
  deactivate/reactivate.
- `validator`: required fields (firstName, lastName, dni, phone), DNI/email/
  phone format.
- Controller tests: request/response mapping, error handling.
- Frontend: form validation, list search/filter behavior.

**Non-functional requirements:**
- All endpoints require authentication (reuse `authMiddleware` from US-001).
- No pagination in the MVP (expected low client volume); revisit if the list
  grows large.

**Open technical decisions:**
- Confirm DNI format/validation rule (assuming Argentine DNI: 7-8 numeric
  digits).

## US-003: Client medical record (ficha médica)

- **Status:** in-openspec (implemented — see `openspec/changes/add-medical-record/`)

**User story:** As a gym owner/trainer, I want to load and update each
client's medical file, so that I can design safe routines and react properly
in an emergency.

**Functional description:** an optional, one-to-one medical record per
client (pre-existing conditions, injuries, surgeries/prosthetics, physical
restrictions, medication, allergies, blood type, free-text notes). Not
required at client registration; can be filled in later. Only current state
is stored (no history/versioning in the MVP).

**Data model (Prisma):** `MedicalRecord` — see
[docs/data-model.md](../docs/data-model.md) entity #3 (already defined),
1:1 with `Client` via `clientId`.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/clients/:clientId/medical-record` | Get the client's medical record (`null` if not created yet) |
| PUT | `/api/clients/:clientId/medical-record` | Create or update it (upsert) |

**Files/modules to create:**

*Backend*: `domain/models/MedicalRecord.ts`,
`domain/repositories/MedicalRecordRepository.ts`,
`infrastructure/repositories/PrismaMedicalRecordRepository.ts`,
`application/services/medicalRecordService.ts`, `application/validator.ts`
(additions), `presentation/controllers/medicalRecordController.ts`,
`routes/medicalRecordRoutes.ts` (nested under client routes),
`prisma/schema.prisma` (`MedicalRecord` model).

*Frontend*: `services/medicalRecordService.ts`, a "Medical record" tab/section
in the client detail page, `components/MedicalRecordForm.tsx`.

**Definition of done:**
- Both endpoints implemented, protected by the auth middleware.
- Client detail view has a medical record section that can be viewed and
  edited independently of basic client data, with an empty state when none
  exists yet.
- `docs/api-spec.yml` updated.

**Tests:**
- `medicalRecordService`: create when none exists (upsert), update existing,
  `findByClientId` (found/not found — `null` is not an error).
- `validator`: all fields optional, length limits enforced.
- Controller tests.
- Frontend: form saves correctly, shows empty state when no record yet.

**Non-functional requirements:**
- Endpoint protected by the auth middleware.
- No extra encryption at rest beyond the database itself for the MVP
  (single admin user, single DB) — flagged for revisit if stricter
  protection is required later.

**Open technical decisions:**
- Field length limits for free-text fields (proposing 1000 characters max
  per field, adjustable).

## US-004: Exercise catalog

- **Status:** in-openspec (implemented — see `openspec/changes/add-exercise-catalog/`; polish in `openspec/changes/refine-exercise-catalog/`: Spanish base seed + non-negative sets/reps)

**User story:** As a gym owner/trainer, I want a reusable catalog of
exercises, so that I can build routines faster without retyping exercises
every time.

**Functional description:** a create/edit-only catalog (no hard delete, to
avoid breaking routines that reference an exercise), pre-seeded with a base
set at launch. Each exercise has a category (mobility/activation/main) so
the routine builder (US-005) can filter warm-up vs main exercises.

**Data model (Prisma):** `Exercise` — see
[docs/data-model.md](../docs/data-model.md) entity #4 (already defined).

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/exercises` | List, query params `category` and `search` (by name) |
| GET | `/api/exercises/:id` | Get exercise detail |
| POST | `/api/exercises` | Create an exercise |
| PUT | `/api/exercises/:id` | Update an exercise |

**Files/modules to create:**

*Backend*: `domain/models/Exercise.ts`,
`domain/repositories/ExerciseRepository.ts`,
`infrastructure/repositories/PrismaExerciseRepository.ts`,
`application/services/exerciseService.ts`, `application/validator.ts`
(additions), `presentation/controllers/exerciseController.ts`,
`routes/exerciseRoutes.ts`, `prisma/schema.prisma` (`Exercise` model),
`prisma/seed.ts` (extend to seed the base exercise catalog).

*Frontend*: `services/exerciseService.ts`, `pages/ExerciseCatalogPage.tsx`
(MUI `DataGrid`, filterable by category), `pages/ExerciseFormPage.tsx`.

**Definition of done:**
- All 4 endpoints implemented and protected by the auth middleware.
- Catalog page lists exercises, filterable by category, searchable by name.
- Create/edit form.
- Seed script populates a base set of common exercises (covering
  mobility/activation/main categories) on first run.
- `docs/api-spec.yml` updated.

**Tests:**
- `exerciseService`: create, update, `findAll` with category filter/search,
  `findById`.
- `validator`: required fields (name, muscleGroup, category enum).
- Controller tests.
- Frontend: catalog filter/search behavior, form validation.

**Non-functional requirements:**
- Endpoints protected by the auth middleware.
- No hard delete supported (no `DELETE` route exposed at the API level).

**Open technical decisions:**
- Exact list of base seeded exercises (to be finalized during
  implementation — e.g. squat, deadlift, bench press, plus common
  mobility/activation drills).

## US-005: Routine templates (create/duplicate/reuse)

- **Status:** in-openspec (implemented — see `openspec/changes/add-routine-templates/`)

**User story:** As a gym owner/trainer, I want to build reusable routine
templates composed of one or more sessions, and duplicate an existing
template, so that I don't have to build a routine from scratch for every
client.

**Functional description:** this is the main "automation" piece of the MVP.
A template has a name, description, objective/level, and free-text general
considerations. It has one or more sessions (e.g. Session A/B/C); each
session has a structured warm-up (general prescription + mobility/activation
exercise lists) and a main exercises list (exercise, optional block/superset
label, KG/REPS/SERIES, optional notes). No weekly progression in the MVP.
Structure validated against a real training plan shared by the user. Sessions
and exercise entries are edited as part of the template's nested payload
(no separate CRUD endpoints for them), to keep the API simple for the MVP.

**Data model (Prisma):** `RoutineTemplate`, `RoutineSession`,
`RoutineExerciseEntry` — see [docs/data-model.md](../docs/data-model.md)
entities #5–#7 (already defined). A template with `clientId = null` is a
reusable library template.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/routine-templates` | List library templates (`clientId` is null) |
| GET | `/api/routine-templates/:id` | Get a template with its sessions and exercise entries |
| POST | `/api/routine-templates` | Create a template (with nested sessions/entries) |
| PUT | `/api/routine-templates/:id` | Update a template (replaces its nested sessions/entries) |
| POST | `/api/routine-templates/:id/duplicate` | Deep-clone a template into a new independent library template |

**Files/modules to create:**

*Backend*: `domain/models/RoutineTemplate.ts`,
`domain/models/RoutineSession.ts`, `domain/models/RoutineExerciseEntry.ts`,
`domain/repositories/RoutineTemplateRepository.ts`,
`infrastructure/repositories/PrismaRoutineTemplateRepository.ts`,
`application/services/routineTemplateService.ts` (includes duplicate/deep-clone
logic), `application/validator.ts` (additions),
`presentation/controllers/routineTemplateController.ts`,
`routes/routineTemplateRoutes.ts`, `prisma/schema.prisma`
(`RoutineTemplate`/`RoutineSession`/`RoutineExerciseEntry` models).

*Frontend*: `services/routineTemplateService.ts`,
`pages/RoutineTemplatesListPage.tsx`, `pages/RoutineTemplateBuilderPage.tsx`
(add sessions, add warm-up/main exercises from the catalog, set
block/kg/reps/series), `components/ExercisePickerDialog.tsx` (search the
exercise catalog by category).

**Definition of done:**
- All 5 endpoints implemented and protected by the auth middleware.
- Routine builder page: create/edit a template with multiple sessions, each
  with warm-up (mobility+activation) and main exercises.
- Duplicate action creates an independent deep copy (editing the copy never
  affects the original).
- `docs/api-spec.yml` updated.

**Tests:**
- `routineTemplateService`: create with nested sessions/entries, update
  (replace nested data), duplicate (verify deep clone independence),
  `findById`, `findAll`.
- `validator`: template requires a name and at least one session; each
  entry references a valid `exerciseId`.
- Controller tests.
- Frontend: builder adds/removes sessions and exercises correctly; duplicate
  flow.

**Non-functional requirements:**
- Endpoints protected by the auth middleware.
- Updating a template replaces its full session/entry list inside a single
  DB transaction (avoid partial updates leaving inconsistent state).

**Open technical decisions:**
- Confirmed approach: "update" fully replaces nested sessions/entries
  (delete+recreate in a transaction) rather than diffing, for MVP simplicity.

## US-006: Assign routine to client

- **Status:** enriched

**User story:** As a gym owner/trainer, I want to assign a routine to a
specific client by cloning a template, with a start date and a fixed
duration, so that each client has an active, trackable routine.

**Functional description:** assigning a routine clones the chosen template
(deep copy of sessions/entries) into a client-owned `RoutineTemplate` row
(`clientId` set, `sourceTemplateId` pointing back to the library template),
which can then be adjusted independently. Only one active routine per client;
assigning a new one closes the previous one. Full routine history per client
is kept and viewable.

**Data model (Prisma):** reuses `RoutineTemplate`/`RoutineSession`/
`RoutineExerciseEntry` (see [docs/data-model.md](../docs/data-model.md)) —
no new tables, just populated with `clientId`/`sourceTemplateId`/`startDate`/
`durationWeeks`/`status` set.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/api/clients/:clientId/routine` | Assign a routine: `{ templateId, startDate, durationWeeks }` — clones the template, closes any previous active routine |
| GET | `/api/clients/:clientId/routine` | Get the client's current active routine (full detail) |
| GET | `/api/clients/:clientId/routines/history` | List previously assigned routines for that client |
| PUT | `/api/clients/:clientId/routine` | Adjust the currently assigned routine (replaces its sessions/entries, same pattern as templates) |

**Files/modules to create:**

*Backend*: `application/services/clientRoutineService.ts` (assign, getActive,
getHistory, adjust — orchestrates cloning + closing the previous routine),
`presentation/controllers/clientRoutineController.ts`, route additions under
client routes (reuses `RoutineTemplate` domain model/repository from US-005).

*Frontend*: `services/clientRoutineService.ts`, a "Routine" tab in the
client detail page showing the active routine + "Assign routine" action
(picks a template) + "Routine history" view.

**Definition of done:**
- All 4 endpoints implemented and protected by the auth middleware.
- Client detail page shows the active routine (or an empty state), lets you
  assign one from a template, and view history.
- Assigning a new routine correctly closes the previous one (never two active
  routines for the same client).
- `docs/api-spec.yml` updated.

**Tests:**
- `clientRoutineService`: assign (creates clone, closes previous),
  `getActive` (found/none), `getHistory`, adjust.
- `validator`: `templateId` must reference an existing library template;
  `startDate` required; `durationWeeks` positive integer.
- Controller tests.
- Frontend: assign flow, history view.

**Non-functional requirements:**
- Endpoints protected by the auth middleware.
- Cloning must be a full deep copy (sessions + entries), never a shared
  reference, per `docs/data-model.md`.

**Open technical decisions:**
- Confirmed approach: routine expiration is computed from
  `startDate + durationWeeks` rather than stored as a separate `expiresAt`
  field, to avoid data duplication.

## US-007: Payment registration

- **Status:** enriched

**User story:** As a gym owner/trainer, I want to register a payment for a
client and edit or delete it later if I made a mistake, so that I can keep
track of who has paid and for which period.

**Functional description:** manual payment entry only (no online gateway),
fixed monthly periodicity (one payment = one calendar month). Payments are
editable/deletable (not an immutable ledger). A client's payment status
(up to date/overdue) is derived automatically from the latest payment's
covered period vs. the current date — never manually flagged.

**Data model (Prisma):** `Payment` — see
[docs/data-model.md](../docs/data-model.md) entity #8 (already defined).

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| POST | `/api/clients/:clientId/payments` | Register a payment |
| PUT | `/api/payments/:id` | Edit a payment |
| DELETE | `/api/payments/:id` | Delete a payment |

(The list endpoint, `GET /api/clients/:clientId/payments`, is documented
under US-008 since it's shared with the payment history view.)

**Files/modules to create:**

*Backend*: `domain/models/Payment.ts`,
`domain/repositories/PaymentRepository.ts`,
`infrastructure/repositories/PrismaPaymentRepository.ts`,
`application/services/paymentService.ts` (includes a `computePaymentStatus`
helper), `application/validator.ts` (additions),
`presentation/controllers/paymentController.ts`, `routes/paymentRoutes.ts`,
`prisma/schema.prisma` (`Payment` model).

*Frontend*: `services/paymentService.ts`, `components/PaymentFormDialog.tsx`
(register/edit), used within the client detail page's "Payments" tab
(shared with US-008's history list).

**Definition of done:**
- All 3 endpoints implemented and protected by the auth middleware.
- Client detail page has a "Payments" section: register a new payment,
  edit/delete existing ones.
- Client's payment status (up to date/overdue) reflects the latest payment
  automatically.
- `docs/api-spec.yml` updated.

**Tests:**
- `paymentService`: create, update, delete, `computePaymentStatus` (up to
  date, overdue, no payments yet).
- `validator`: amount > 0, method enum, valid period month/year.
- Controller tests.
- Frontend: payment form validation, edit/delete flow.

**Non-functional requirements:**
- Endpoints protected by the auth middleware.
- Editing/deleting a payment recalculates the client's derived payment
  status immediately (no caching/staleness).

**Open technical decisions:**
- Overdue rule: a client is considered overdue if today's date is past the
  end of the month covered by their most recent payment.

## US-008: Payment history per client

- **Status:** enriched

**User story:** As a gym owner/trainer, I want to see the full chronological
payment history of a client and export/print it, so that I can review past
payments, resolve disputes, and hand a client a payment receipt when needed.

**Functional description:** a simple chronological list for the MVP (a
summary view with totals is Phase 2), plus a PDF export of that history.
Depends on US-007 for the underlying payment records.

**Data model (Prisma):** reuses `Payment` (see US-007 /
[docs/data-model.md](../docs/data-model.md)) — no new tables.

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/clients/:clientId/payments` | Full chronological payment history (newest first) |
| GET | `/api/clients/:clientId/payments/export` | Export/download the history as a PDF |

**Files/modules to create:**

*Backend*: extends `paymentService` (list by client, sorted desc by date),
`infrastructure/pdf/paymentHistoryPdf.ts` (generates the PDF), export action
in `presentation/controllers/paymentController.ts`, route addition.

*Frontend*: `components/PaymentHistoryTable.tsx` (MUI table/`DataGrid`)
within the client detail "Payments" tab, "Export PDF" button.

**Definition of done:**
- Both endpoints implemented and protected by the auth middleware.
- Client detail "Payments" tab shows the full chronological history.
- "Export PDF" button downloads a PDF with the client's payment history.
- `docs/api-spec.yml` updated.

**Tests:**
- `paymentService.listByClient`: chronological order, empty state.
- PDF generation: smoke test (produces a non-empty file with the expected
  number of rows), not pixel-perfect.
- Frontend: history table renders, export button triggers download.

**Non-functional requirements:**
- Endpoint protected by the auth middleware.

**Open technical decisions:**
- PDF generation library (e.g. `pdfkit` vs. a headless-browser-based
  approach like the one used for `planning/documento-funcional-fase1-fase2.pdf`)
  — evaluate during implementation, favor the simplest/lightest option.

## US-009: Dashboard with alerts

- **Status:** enriched

**User story:** As a gym owner/trainer, I want a home dashboard showing
clients with overdue/upcoming payments and expiring routines, each linking
directly to the client's profile, so that I can act quickly without checking
every client one by one.

**Functional description:** a read-model aggregation over existing data
(clients, payments, routines) — no new domain entity. Three alert groups:
overdue payments, payments due soon (configurable threshold, default a few
days), and expired/expiring routines. Depends on US-006 (routine expiration)
and US-007/US-008 (payment status). General KPI numbers are Phase 2.

**Data model (Prisma):** none new — derived at query time from `Client`,
`Payment`, and `RoutineTemplate` (client instances).

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard` | Returns clients with overdue payments, payments due soon, and expiring/expired routines |

**Files/modules to create:**

*Backend*: `application/services/dashboardService.ts` (aggregates from
`clientService`/`paymentService`/`clientRoutineService`),
`presentation/controllers/dashboardController.ts`, `routes/dashboardRoutes.ts`.
Threshold configurable via an env var (e.g. `DASHBOARD_DUE_SOON_DAYS`,
default 5).

*Frontend*: `services/dashboardService.ts`, `pages/DashboardPage.tsx` (the
landing page after login), `components/AlertList.tsx` (renders each alert
group with links to client profiles).

**Definition of done:**
- Endpoint implemented and protected by the auth middleware.
- Dashboard is the landing page after login, showing the three alert groups
  with counts and clickable links to each client.
- `docs/api-spec.yml` updated.

**Tests:**
- `dashboardService`: correctly classifies clients into overdue/due-soon/
  routine-expiring buckets given various payment/routine states.
- Controller test.
- Frontend: renders alert groups, links navigate to the right client.

**Non-functional requirements:**
- Endpoint protected by the auth middleware.
- Straightforward aggregation query is fine at MVP scale (single gym, tens
  to low hundreds of clients); revisit indexing/caching if it becomes slow.

**Open technical decisions:**
- Default "due soon" threshold: proposing 5 days as a simple configurable
  constant for now (a full settings UI is Phase 2 unless requested sooner).

## US-010: Bilingual UI (i18n Spanish/English)

- **Status:** done (archived — see `openspec/changes/archive/2026-09-13-add-bilingual-ui/` and `openspec/specs/internationalization/`)

**User story:** As a gym owner/trainer, I want the app's interface available
in Spanish and English with a language switcher, so that I can use it in my
own language.

**Functional description:** internationalize the frontend with `react-i18next`.
All user-facing copy moves to translation files (`es` and `en`); a language
selector lets the user switch, and the choice persists (localStorage). Default
language: Spanish (the target user is Spanish-speaking). Retrofit the existing
auth and client screens (US-001, US-002); all future stories add their strings
to the translation files from the start.

**Important constraint:** per `docs/base-standards.md`, all code stays in
English — this includes translation KEYS, variable/function names, comments,
commits, and docs. Only the display strings (the values in the `es`/`en`
resource files) are translated. Backend error `code`s stay English; the
frontend maps them to localized messages.

**Files/modules to create/modify (frontend):**
- `src/i18n/index.ts` (i18next config), `src/i18n/locales/es.json`,
  `src/i18n/locales/en.json`
- `components/LanguageSwitcher.tsx`
- Replace hardcoded strings in all existing pages/components with `t()` calls

**Definition of done:**
- Language switcher toggles es/en across the whole app; choice persists.
- Default language is Spanish.
- All existing screens (login, forgot/reset password, dashboard, clients
  list/form, dialogs) fully translated with no leftover hardcoded copy.
- Unit test for the switcher and for a representative translated screen.

**Non-functional requirements:**
- No backend change required (error codes already language-agnostic).
- Adds `react-i18next` + `i18next` as frontend dependencies.

**Open technical decisions:**
- Whether to detect the browser language on first load or always default to
  Spanish (proposing: default Spanish, switch persists after first manual
  change).

## US-011: App shell, navigation and visual theme

- **Status:** in-openspec (implemented — see `openspec/changes/add-app-shell/`)
- **Priority:** cross-cutting — done before US-003, while there are few screens.

**User story:** As a gym owner/trainer, I want a consistent branded layout with
clear navigation (a top app bar, back/home navigation), so that the app looks
professional and I can always move between screens.

**Functional description:** introduce a shared app shell (a persistent MUI
`AppBar` with the gym brand — "SPORT – FITNESS" and the bear logo — plus the
language switcher and logout), a consistent page layout, back/home navigation
(and breadcrumbs) on inner screens, and a custom MUI theme derived from the
gym's brand (black + leaf green + white). Retrofit the existing screens
(dashboard, clients) to use the shell. Pre-login screens (login, forgot/reset)
get the brand/logo header but no nav actions.

**Brand:** gym "SPORT – FITNESS / Entrenamiento Físico Integral" (from the
client's training-plan PDF). Palette: black, leaf green (derived from the PDF),
white. Logo: black bear standing with a barbell (the user provides the image
file placed under `frontend/src/assets/`).

**Files/modules (frontend):**
- `theme/theme.ts` (custom MUI theme: palette, typography), applied in `main.tsx`
- `components/AppLayout.tsx` (AppBar + brand + logo + language switcher + logout
  + content outlet) wrapping the protected routes
- `components/BackButton.tsx` / breadcrumbs for inner screens
- `assets/logo.png` (provided by the user)
- Retrofit `DashboardPage`, `ClientsListPage`, `ClientFormPage` to sit inside
  the layout; move the language switcher/logout out of the dashboard into the
  AppBar

**Definition of done:**
- Persistent AppBar with brand/logo, language switcher and logout on all
  authenticated screens.
- Back navigation available on inner screens (e.g. from clients back to the
  dashboard) — resolves the missing "back" control.
- Custom theme applied app-wide (colors/typography), pre-login screens show the
  brand/logo.
- Existing unit and E2E tests updated (switcher/logout now live in the AppBar).

**Non-functional requirements:**
- Responsive layout (works on smaller widths).
- Accessibility: nav controls have aria-labels; logo has alt text.
- No backend change.

**Open technical decisions:**
- Exact leaf-green HEX (to be finalized from the PDF during implementation).
- Also update `ai-specs/agents/frontend-developer.md`, which is stale (mentions
  React Bootstrap) — align it to MUI.

---

## Backlog (Phase 2 — post-MVP, not yet scoped as US)

Captured for visibility only. Do not start any OpenSpec work on these until
Phase 1 is implemented and the MVP is validated.

- Automated reminders (email/WhatsApp) for payments/routines
- Online payment gateway integration (Mercado Pago/Stripe)
- Attendance / check-in tracking
- Physical progress tracking (measurements, photos, evolution over time)
- Nutrition plans
- Multi-tenant support (multiple gyms/sedes)
- Filter client list by payment status (up to date / overdue)
- Medical record change history (track evolution over time, not just current state)
- Video/image reference per exercise in the catalog
- Automatic exercise suggestions/contraindication warnings based on a client's medical record
- Weekly progression: per-exercise KG/reps/series values across a multi-week mesocycle
- Dynamic, editable warm-up blocks that adapt based on the client's medical record
- Export routines (library templates and client-assigned routines) to PDF and Excel — a printable/shareable routine sheet (PDF, e.g. one page per session) and a spreadsheet export (`.xlsx`, e.g. one sheet per session). Feasible either client-side (jsPDF / SheetJS) or via a backend export endpoint (`GET /api/routine-templates/:id/export.pdf|.xlsx`).
- Payment history summary view (total paid, months owed, etc.) in addition to the chronological list
- Dashboard general KPI numbers (active clients count, monthly revenue, etc.)
