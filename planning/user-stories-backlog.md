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

- **Status:** in-openspec (implemented — see `openspec/changes/assign-client-routine/`)

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

- **Status:** in-openspec (implemented — see `openspec/changes/add-payment-registration/`)

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

- **Status:** in-openspec (implemented — see `openspec/changes/add-payment-history-export/`)

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

- **Status:** in-openspec (implemented — see `openspec/changes/add-dashboard-alerts/`)

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

## US-012: UI/UX design refresh

- **Status:** enriched
- **Priority:** first Phase 2 item (visual/UX polish over the whole app).

**User story:** As the gym owner/trainer, I want a more modern, consistent, and
polished interface, so that the app feels professional, is easier to navigate,
and is comfortable to use on desktop and mobile.

**Functional description:** a **frontend-only** visual/UX refresh implemented **in
MUI** (no stack change; no Tailwind/shadcn; v0.app only for visual inspiration,
not generated code). No new API and no data-model change — it restyles and
reorganizes the existing screens without changing their functional behavior.

**Scope:**
1. **Design system / theme** (`theme/theme.ts`): refined palette on the existing
   brand (black + leaf green + white) with proper color tokens; a modern
   typography scale (Inter, self-hosted via `@fontsource`); consistent spacing,
   border-radius and subtle elevations; themed `MuiButton`/`MuiCard`/`MuiChip`/
   `MuiDataGrid`. Optional dark mode (see open decisions).
2. **Navigation:** replace the top-bar-only nav with a **persistent left
   sidebar** (`Panel`, `Clientes`, `Ejercicios`, `Rutinas`) that collapses to a
   drawer on mobile; keep the top bar for brand, language switcher and logout.
3. **Dashboard** (`pages/DashboardPage.tsx`): the four alert groups become
   **cards with icons, large counts and colored accents**; optional small chart
   (see open decisions); keep the "Panel" heading and the links.
4. **Reusable primitives:** a `PageHeader` (title + actions + optional back), a
   global **Snackbar** provider/hook for action feedback (create/edit/delete/
   errors), and **loading skeletons** for data-fetching pages.
5. **Tables & empty states:** consistent `DataGrid` theming (row hover, density)
   and friendlier empty states.
6. **Responsive:** usable layouts down to ~360px (sidebar → drawer; tables
   scroll/stack).

**Data model (Prisma):** none.

**Endpoints:** none (no backend change).

**Files/modules to create/modify (frontend):**
- *Modify:* `theme/theme.ts`, `components/AppLayout.tsx`, `pages/DashboardPage.tsx`,
  `components/AlertList.tsx`, page components (adopt `PageHeader` + skeletons +
  snackbars), `index.html`/font setup, `i18n` locale files for any new labels.
- *Create:* `components/Sidebar.tsx`, `components/PageHeader.tsx`,
  `components/SnackbarProvider.tsx` (+ `useSnackbar` hook), `components/skeletons/*`
  (or a shared `LoadingSkeleton`).

**Definition of done:**
- Refined theme applied app-wide; sidebar navigation working on desktop and
  collapsing on mobile.
- Dashboard shown as cards with counts/icons; links still navigate correctly.
- Consistent `PageHeader` across internal pages; skeletons on data loads;
  snackbars on create/edit/delete and on errors.
- Responsive from ~360px up.
- **All existing unit (Vitest) and E2E (Playwright) tests pass**, adjusting only
  selectors that must change while **preserving the accessible roles/names the
  tests rely on** (e.g. the "Panel" heading, button names, DataGrid roles).
- All new user-facing strings go through `react-i18next` (es default / en).

**Tests:**
- Unit tests for the new shared components: `PageHeader`, `Sidebar` (links,
  active state, mobile drawer toggle), `SnackbarProvider`/`useSnackbar`, and a
  skeleton render.
- Keep all existing component/page tests green; update queries only where markup
  changes, without weakening assertions.
- E2E: the main flows stay green; if navigation moves to the sidebar, update the
  specs' navigation steps while keeping role-based selectors.

**Non-functional requirements:**
- **Accessibility:** semantic roles, WCAG AA contrast, keyboard-navigable
  sidebar/menus, `aria-label`s on icon buttons.
- **Performance / bundle:** self-hosted fonts, a lightweight charts lib loaded
  lazily (if used); skeletons improve perceived performance; watch the existing
  bundle-size warning.
- **Consistency:** single source of truth in the theme; no ad-hoc inline colors.
- **i18n:** no hardcoded strings.

**Open technical decisions:**
- **Dark mode:** build the theme with tokens that make dark mode easy, but ship
  **light-only first** (add the toggle later) unless the toggle is wanted now.
- **Dashboard charts:** start with **icon+count cards**; add a small chart (MUI X
  Charts) only if it adds value.
- **Font:** **Inter self-hosted** (`@fontsource/inter`, offline-friendly).

---

## US-013: Notification bell

- **Status:** enriched
- **Dependency:** build after US-012 (lives in the refreshed shell).

**User story:** As the gym owner/trainer, I want a bell icon in the top bar with
a badge showing how many clients need attention and a dropdown listing them, so
that I can spot alerts from any screen without opening the dashboard.

**Functional description:** a persistent notification bell fed by the **existing**
`GET /api/dashboard` aggregation (US-009) — **frontend-only, no new endpoint**.
The badge shows the total number of alerts (overdue + due-soon + no-payment +
expiring-routine, or a chosen subset); the dropdown groups them with links to
each client's payments/routine screen. Data is (re)fetched on mount, on a light
interval, and/or on route change.

**Data model (Prisma):** none. **Endpoints:** none (reuses `GET /api/dashboard`).

**Files/modules (frontend):** `components/NotificationBell.tsx` (MUI `Badge` +
`IconButton` + `Menu`/`Popover`), a `useDashboardAlerts` hook (fetch + total
count) reusing `dashboardService`, integration in `components/AppLayout.tsx` top
bar, and `nav`/`notifications` i18n keys.

**Definition of done:**
- Bell with a live badge count on all authenticated screens; dropdown lists the
  grouped alerts with working links; empty state when there are none.
- Count refreshes (on mount + interval and/or route change).

**Tests:** `NotificationBell` unit (renders the count, opens the dropdown, links
navigate) with `dashboardService` mocked; keep existing tests green.

**Non-functional requirements:** a11y (`aria-label`, badge announced,
keyboard-openable), no excessive polling (e.g. ~60s or refetch-on-navigation),
i18n, no backend change.

**Open technical decisions:**
- Which groups feed the badge (all four vs payments-only). Proposed: all four.
- Refresh strategy: light polling vs refetch-on-route-change. Proposed:
  refetch-on-navigation + optional slow interval.

---

## US-014: Filter client list by payment status

- **Status:** enriched

**User story:** As the gym owner/trainer, I want to filter the client list by
payment status (up to date / overdue / no payments), so that I can quickly find
who owes.

**Functional description:** extend the existing client-list controls (search by
name + active/inactive filter, US-002) with a **payment-status filter**. The list
response already includes each client's derived `paymentStatus` (US-007), so the
MVP can filter **client-side** without a backend change; a backend
`paymentStatus` query param on `GET /api/clients` is the alternative if
server-side filtering/pagination is later needed.

**Data model (Prisma):** none. **Endpoints:** none for the client-side approach
(optional `paymentStatus` query param on `GET /api/clients`).

**Files/modules (frontend):** `pages/ClientsListPage.tsx` (an MUI `Select`
filter combining with the existing search/status filters), `i18n` keys. (If
backend: `ClientRepository.findAll` + validator + controller.)

**Definition of done:** a payment-status filter on the client list that combines
with the name search and the active/inactive filter; clearing shows all.

**Tests:** `ClientsListPage` unit (selecting a payment status filters the rows;
combines with the other filters).

**Non-functional requirements:** i18n, a11y, no regression to the existing
filters.

**Open technical decisions:** client-side vs backend filter. Proposed:
**client-side** for MVP scale (the data is already present).

---

## US-015: Smarter payment-period entry

- **Status:** enriched

**User story:** As the gym owner/trainer, when I register a payment I want the
period pre-filled to the next month the client owes and the payment date
defaulted to today, so that I don't create incoherent entries (e.g. a November
period paid in July).

**Functional description:** improve the "register payment" dialog
(`PaymentFormDialog`, US-007) so the **period defaults** to the next period the
client owes — the most recent covered period + 1 month, or the **current month**
when they have none / are up to date — and the **payment date defaults to
today**. The period stays **editable** for late/advance payments. Optionally warn
when the chosen period is clearly incoherent with the payment date. The covered
period remains the source of truth for the derived up-to-date/overdue status
(US-007) — no change to that logic.

**Data model (Prisma):** none. **Endpoints:** none (uses the existing per-client
payments already loaded on the payments page).

**Files/modules (frontend):** `components/PaymentFormDialog.tsx` (default-period
logic), `pages/ClientPaymentsPage.tsx` (pass the current payments/status), a
small helper to compute the next owed period, `i18n` keys for the optional
warning.

**Definition of done:** opening "Registrar pago" pre-fills the next owed period
and today's date; the field is still editable; the optional coherence warning
appears on a clearly inconsistent period/date; the derived status is unchanged.

**Tests:** `PaymentFormDialog` unit (default = current month when up to date;
default = most-recent + 1 when there are payments; warning shows on incoherent
period/date).

**Non-functional requirements:** no change to the derived-status rule; i18n.

**Open technical decisions:** the exact "next owed" computation. Proposed:
**most recent covered period + 1 month**, or current month if none — a full
gap/arrears analysis using the client's join date is deferred.

---

## US-016: Payment history summary

- **Status:** enriched

**User story:** As the gym owner/trainer, I want a summary of a client's payments
(total paid, number of payments, covered-period range, current status) alongside
the chronological list, so that I can see the big picture at a glance.

**Functional description:** add a **summary panel** to the client payments page
(and optionally to the US-008 PDF) computed from the payments already listed —
**client-side, no backend change**. Fields: total amount paid, payment count,
first/last covered period, and the current derived payment status.

**Data model (Prisma):** none. **Endpoints:** none (client-side from the existing
list; could later be a backend summary).

**Files/modules (frontend):** `pages/ClientPaymentsPage.tsx` (summary cards using
the refreshed design system), a small pure helper for the aggregation, `i18n`
keys; optionally extend `infrastructure/pdf/paymentHistoryPdf.ts` (backend) to
include the summary in the PDF.

**Definition of done:** the summary is shown above/beside the history; totals and
period range are correct; status matches the derived status.

**Tests:** unit for the aggregation helper + the summary render.

**Non-functional requirements:** i18n, a11y, consistent with the refreshed UI
(US-012).

**Open technical decisions:** include "months owed" (needs join-date/arrears
logic, tied to US-015) or keep to total/count/period-range/status for now.
Proposed: the latter; "months owed" deferred.

---

## US-017: Export routines to PDF/Excel

- **Status:** enriched

**User story:** As the gym owner/trainer, I want to export a routine (a library
template or a client's assigned routine) to PDF and Excel, so that I can print or
share a clean routine sheet.

**Functional description:** a printable **PDF** (e.g. one page per session) and a
**spreadsheet** (`.xlsx`, e.g. one sheet per session) of a routine. The PDF
reuses the `pdfkit` approach already built for payments (US-008); the Excel
export uses a light library (e.g. `exceljs`). Can be a backend export endpoint
(consistent with US-008) or client-side (`jsPDF`/`SheetJS`).

**Data model (Prisma):** none. **Endpoints:** `GET /api/routine-templates/:id/export.pdf`
and `.xlsx` (backend option), or client-side generation.

**Files/modules:** backend `infrastructure/pdf/routinePdf.ts` +
`infrastructure/xlsx/routineXlsx.ts`, a controller action + route, and an
"Export" control on the routine template and client-routine screens (or the
frontend equivalents if client-side).

**Definition of done:** export buttons on a template and on a client's routine;
both PDF and `.xlsx` download with the sessions/exercises and prescriptions;
protected by auth (backend option).

**Tests:** smoke tests for PDF and xlsx generation (non-empty, expected
sheets/rows); a frontend test for the export action.

**Non-functional requirements:** protected (backend), i18n of labels, reasonable
file size.

**Open technical decisions:** backend endpoint (reuse `pdfkit`, add `exceljs`)
vs client-side (`jsPDF`/`SheetJS`). Proposed: **backend PDF via `pdfkit`** for
consistency with US-008; evaluate `exceljs` for the `.xlsx`.

---

## US-018: Weekly progression (mesocycle)

- **Status:** enriched (larger — needs a data-model change)

**User story:** As the gym owner/trainer, I want each exercise's kg/reps/series to
vary across the weeks of a routine, so that the plan reflects a real progression.

**Functional description:** today `RoutineExerciseEntry` stores a single
kg/reps/series value (US-005). This adds **per-week** values across the routine's
`durationWeeks`, editable in the routine builder and shown per week in the
client's routine view. Existing single-value routines must keep working
(backward compatible).

**Data model (Prisma):** new `RoutineExerciseWeek` table (`entryId` FK, `week`,
`kg`, `reps`, `series`) — or a structured JSON column on the entry. Migration
required.

**Endpoints:** extends the routine-template create/update (nested weeks).

**Files/modules:** `schema.prisma` + migration, `RoutineExerciseEntry`/new model,
its repository/service mapping, the builder UI (per-week inputs), and the client
routine view (per-week display).

**Definition of done:** the builder lets the trainer set weekly progression; the
client routine shows values per week; old routines still render.

**Tests:** model/repository/service for the weekly values; builder unit; a
migration/backward-compat check.

**Non-functional requirements:** backward compatibility; no change to unrelated
routine behavior.

**Open technical decisions:** separate `RoutineExerciseWeek` table vs JSON
column; how to present per-week in the client view (tabs/table). Proposed:
separate table; a compact per-week table in the view.

---

## US-019: Exercise media reference (video/image)

- **Status:** enriched

**User story:** As the gym owner/trainer, I want to attach a reference video or
image to each exercise, so that the correct technique is easy to review.

**Functional description:** add an optional **media URL** (e.g. a YouTube link
and/or an image URL) to `Exercise` (US-004); show a thumbnail/link in the catalog
and in routine views. MVP stores a **URL only** (no file upload/storage); native
uploads are a later addition.

**Data model (Prisma):** add `videoUrl String?` and/or `imageUrl String?` to
`Exercise`. Migration required.

**Endpoints:** extends the exercise create/update payload.

**Files/modules:** `schema.prisma` + migration, `Exercise` model/repository,
`validator` (URL validation), `ExerciseForm`, and the catalog/routine display.

**Definition of done:** an exercise can store a media URL; it is shown as a
link/thumbnail in the catalog and where the exercise appears in routines.

**Tests:** model/validator (URL), form unit, catalog render.

**Non-functional requirements:** validate the URL; i18n; no upload/storage in
this story.

**Open technical decisions:** URL-only vs file upload (needs object storage).
Proposed: **URL-only** for the MVP (paste a YouTube/image link).

---

## US-020: Dashboard KPIs

- **Status:** enriched
- **Dependency:** presented within the US-012 dashboard cards.

**User story:** As the gym owner/trainer, I want key numbers on the dashboard
(active clients, how many are up to date/overdue, monthly income), so that I see
the business at a glance.

**Functional description:** extend the dashboard (US-009) with **aggregate KPIs**:
active client count, counts by derived payment status, and the sum of payments in
the current month (income). Rendered as KPI cards alongside the alert groups.

**Data model (Prisma):** none (derived at query time). **Endpoints:** extend
`GET /api/dashboard` with a `kpis` object (or a `GET /api/dashboard/kpis`).

**Files/modules:** `dashboardService` (KPI aggregation reusing the existing read
model + payments), controller, and dashboard KPI cards (frontend).

**Definition of done:** KPI cards on the dashboard with correct figures; protected
by auth.

**Tests:** service aggregation (counts, monthly income) + render.

**Non-functional requirements:** simple aggregation is fine at MVP scale; i18n;
revisit indexing/caching only if slow.

**Open technical decisions:** income definition — sum of `Payment.amount` by
`paymentDate` in the current month vs by covered period. Proposed: by
`paymentDate` in the current month.

---

## Backlog (Phase 2 — post-MVP, not yet scoped as US)

Captured for visibility only. Do not start any OpenSpec work on these until
Phase 1 is implemented and the MVP is validated.

**Planned Phase 2 order** (agreed): (1) UI/UX design refresh, then the smaller
wins and product-depth items below, with **online payment gateway** and
**multi-tenant support** deliberately deferred to the very end (largest scope /
external dependencies).

- UI/UX design refresh — enriched as **US-012** (see above).
- Automated reminders for payments/routines: start with **email** via a free
  provider (**Resend**, 3k/month free) plugged into the existing `EmailService`
  abstraction (today `ConsoleEmailService`), scheduled with an in-process
  scheduler (**node-cron**) that checks overdue/due-soon payments and
  expiring routines. **WhatsApp** (Meta WhatsApp Cloud API free tier) is an
  optional later addition (needs a Meta business number + approved templates).
- Online payment gateway integration (Mercado Pago/Stripe) — deferred to the end.
- Attendance / check-in tracking
- Physical progress tracking (measurements, photos, evolution over time)
- Nutrition plans
- Multi-tenant support (multiple gyms/sedes) — deferred to the end.
- Filter client list by payment status (up to date / overdue) — enriched as **US-014** (see above).
- Medical record change history (track evolution over time, not just current state)
- Video/image reference per exercise in the catalog — enriched as **US-019** (see above).
- Automatic exercise suggestions/contraindication warnings based on a client's medical record
- Weekly progression: per-exercise KG/reps/series values across a multi-week mesocycle — enriched as **US-018** (see above).
- Dynamic, editable warm-up blocks that adapt based on the client's medical record
- Export routines (library templates and client-assigned routines) to PDF and Excel — enriched as **US-017** (see above).
- Payment history summary view (total paid, months owed, etc.) in addition to the chronological list — enriched as **US-016** (see above).
- Dashboard general KPI numbers (active clients count, monthly revenue, etc.) — enriched as **US-020** (see above).
- Smarter payment-period entry — enriched as **US-015** (see above).
- Notification bell in the header — enriched as **US-013** (see above).
