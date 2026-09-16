## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-payment-registration` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Backend: Data Model & Migration

- [x] 1.1 Add the `Payment` model + `PaymentMethod` enum (`cash`/`bank_transfer`/`card`) to `prisma/schema.prisma` per `docs/data-model.md` entity #8 (FK to `Client` with `onDelete: Cascade`, `amount` Decimal, `paymentDate`, `periodMonth`, `periodYear`), and add the back-relation `payments Payment[]` on `Client`
- [x] 1.2 Run `npx prisma migrate dev --name add-payment`, verify `npx prisma validate` passes and the client regenerates

## 2. Backend: Domain & Data Access (TDD)

- [x] 2.1 Write failing unit tests for `domain/models/Payment.ts`, then implement it (Decimal amount mapped to number)
- [x] 2.2 Define `domain/repositories/PaymentRepository.ts` (`PaymentInput`, `create`, `findById`, `findByClient` newest-first, `update`, `delete`)
- [x] 2.3 Write failing unit tests for `PrismaPaymentRepository` (create, findById found/not-found, findByClient ordered, update, delete), then implement until they pass

## 3. Backend: Application Layer (TDD)

- [x] 3.1 Write failing unit tests for `paymentSchema` in `application/validator.ts` (amount > 0, method enum, periodMonth 1-12, periodYear range, paymentDate coercible), then implement
- [x] 3.2 Write failing unit tests for `computePaymentStatus` (no payments → `no_payments`; most recent period covers now → `up_to_date`; today past the covered month end → `overdue`; picks the greatest period), then implement it
- [x] 3.3 Write failing unit tests for `paymentService` (register incl. client-not-found; findByClient with status; update incl. `PaymentNotFoundError`; delete incl. `PaymentNotFoundError`), then implement; add `PaymentNotFoundError` and map it to 404 in `errorHandler`

## 4. Backend: Presentation Layer

- [x] 4.1 Implement `presentation/controllers/paymentController.ts` (register, list, update, delete) and `routes/paymentRoutes.ts`: client-scoped nested router (`/api/clients/:clientId/payments` POST/GET) and id-scoped router (`/api/payments/:id` PUT/DELETE), protected by `authMiddleware`; wire both into `index.ts`
- [x] 4.2 Write integration tests (supertest) for the routes: 201 register + 404 (client)/400 (invalid), 200 list (payments + status), 200 update + 404, 200/204 delete + 404, and 401 when unauthenticated

## 5. Frontend: Payments UI + Client List Indicator

- [x] 5.1 Implement `services/paymentService.ts` (`list`, `create`, `update`, `remove`) and add `payments` i18n keys to `es.json`/`en.json`
- [x] 5.2 Implement `components/PaymentFormDialog.tsx` (register/edit: amount, date, method, period month + year, validation matching the backend) with a unit test
- [x] 5.3 Implement `pages/ClientPaymentsPage.tsx` at `/clients/:clientId/payments` (status chip, "Register payment", list with edit/delete, `BackButton`) with unit tests
- [x] 5.4 Wire the route into `App.tsx` behind `ProtectedRoute` + `AppLayout`, and add a "Pagos" action to reach it from `ClientsListPage`; keep existing tests green
- [x] 5.5 Add a payment-status indicator to the client list: extend the backend client list to return `paymentStatus` (include payments in `PrismaClientRepository.findAll` + `computePaymentStatus`) and add a "Pagos" column (up-to-date/overdue/no-payments chip) to `ClientsListPage`; update the affected client-management unit tests

## 6. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 6.1 Review all unit tests written in sections 2-5 against `docs/backend-standards.md` (AAA pattern, happy path/error/edge case coverage) and fill any gaps

## 7. Backend: Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 Capture the pre-test database baseline (`Payment`, `Client`, `User` row counts)
- [x] 7.2 Run the targeted unit tests for the payment module
- [x] 7.3 Run the full backend test suite (`npm test`) and record pass/fail counts and coverage (90%+ threshold)
- [x] 7.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [x] 7.5 Create the report `openspec/changes/add-payment-registration/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`
- [x] 7.6 Mark this step complete only once tests pass and the report file exists

## 8. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 8.1 Ensure the backend server and the Dockerized PostgreSQL database are running; log in; create a throwaway client
- [x] 8.2 Test `POST /api/clients/:clientId/payments` (register) → 201; `GET /api/clients/:clientId/payments` → 200 with payments (newest first) + status
- [x] 8.3 Register payments covering different periods and verify the derived status (up to date vs overdue) is correct; register for an unknown client → 404; invalid amount/method/period → 400
- [x] 8.4 Test `PUT /api/payments/:id` (edit) → 200 and confirm the status recomputes; missing id → 404
- [x] 8.5 Test `DELETE /api/payments/:id` → 200/204 and confirm the status recomputes; missing id → 404
- [x] 8.6 Test the client list `GET /api/clients` returns the correct `paymentStatus`; test that every endpoint returns 401 without a session cookie
- [x] 8.7 Restore the database (delete the throwaway client [cascade] and its payments, reset sequences, clear the admin reset token) and document all curl commands/responses in `openspec/changes/add-payment-registration/reports/YYYY-MM-DD-step-8-curl-endpoint-testing.md`

## 9. Frontend: E2E Testing with Playwright (MANDATORY - AGENT MUST EXECUTE)

- [x] 9.1 Ensure both servers are running; run E2E serially (`--workers=1`)
- [x] 9.2 Log in, create a client, open its payments page, register a payment, and verify it appears with the correct status
- [x] 9.3 Edit and delete a payment and verify the list and status update; verify the client list shows the payment-status indicator
- [x] 9.4 Restore any test data created during the run and document outcomes in `openspec/changes/add-payment-registration/reports/YYYY-MM-DD-step-9-e2e-testing.md`

## 10. Documentation (MANDATORY)

- [x] 10.1 Update `docs/api-spec.yml` with the payment endpoints and schemas, and add `paymentStatus` to the client list response schema
- [x] 10.2 Verify/adjust `docs/data-model.md` `Payment` entity to match the implemented schema
- [x] 10.3 Update `planning/user-stories-backlog.md` US-007 status to `in-openspec`, linking to this change
- [x] 10.4 On feature close: update `readme.md` and `prompts.md` deliverables with US-007 content
