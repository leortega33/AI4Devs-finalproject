## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [ ] 0.1 Create feature branch `feature/add-admin-authentication` from `main` and verify it is checked out (`git branch --show-current`)
- [ ] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Project Scaffolding: Backend

- [ ] 1.1 Initialize the `backend/` project (package.json, TypeScript, Express, Prisma) following the structure in `docs/backend-standards.md`; verify `npm install` succeeds
- [ ] 1.2 Configure Prisma with PostgreSQL (`prisma/schema.prisma`, `DATABASE_URL`) and verify `npx prisma validate` succeeds
- [ ] 1.3 Set up Jest with TypeScript support and verify `npm test` runs successfully with zero tests

## 2. Project Scaffolding: Frontend

- [ ] 2.1 Initialize the `frontend/` project (Vite + React + TypeScript + MUI) following `docs/frontend-standards.md`; verify `npm install` and `npm run dev` start without errors
- [ ] 2.2 Set up Playwright and Vitest configuration and verify `npx playwright install` and `npm test` (zero tests) both succeed

## 3. Backend: Domain & Data Access (TDD)

- [ ] 3.1 Add the `User` model to `prisma/schema.prisma` per `docs/data-model.md` and verify `npx prisma migrate dev --name add-user` succeeds
- [ ] 3.2 Write failing unit tests for `domain/models/User.ts`, then implement it until the tests pass
- [ ] 3.3 Write failing unit tests for `UserRepository` (interface) and `PrismaUserRepository`, then implement until the tests pass

## 4. Backend: Application Layer (TDD)

- [ ] 4.1 Write failing unit tests for `authService.login` (valid credentials, wrong password, unknown email), then implement
- [ ] 4.2 Write failing unit tests for `authService.requestPasswordReset` (matching/non-matching email produce the same response), then implement
- [ ] 4.3 Write failing unit tests for `authService.resetPassword` (valid, expired, invalid, already-used token), then implement
- [ ] 4.4 Write failing unit tests for the login/forgot-password/reset-password validation schemas in `application/validator.ts`, then implement
- [ ] 4.5 Implement the `emailService` interface plus a development (console-log) implementation per `design.md`

## 5. Backend: Presentation Layer

- [ ] 5.1 Implement `authController` (login, logout, me, forgot-password, reset-password) and wire up `authRoutes`
- [ ] 5.2 Implement `authMiddleware` (verifies the JWT cookie, attaches `req.user`) with unit tests for missing/invalid/expired tokens
- [ ] 5.3 Implement rate limiting on `POST /api/auth/login` and `POST /api/auth/forgot-password`

## 6. Backend: Seed & Configuration

- [ ] 6.1 Implement `prisma/seed.ts` to create the admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, failing fast if either is missing; verify `npx prisma db seed` creates exactly one `User` row
- [ ] 6.2 Add `backend/.env.example` with `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

## 7. Frontend: Auth UI

- [ ] 7.1 Implement `services/authService.ts` (axios calls for the 5 endpoints)
- [ ] 7.2 Implement `context/AuthContext.tsx` (login/logout, checks `/api/auth/me` on load) with unit tests
- [ ] 7.3 Implement `components/ProtectedRoute.tsx` with unit tests for the authenticated/unauthenticated redirect behavior
- [ ] 7.4 Implement `pages/LoginPage.tsx`, `pages/ForgotPasswordPage.tsx`, `pages/ResetPasswordPage.tsx` with form validation and unit tests

## 8. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [ ] 8.1 Review all unit tests written in sections 3-7 against the testing standards in `docs/backend-standards.md` (AAA pattern, happy path/error/edge case coverage) and fill any gaps found

## 9. Backend: Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [ ] 9.1 Capture the pre-test database baseline (`User` table row count)
- [ ] 9.2 Run the targeted unit tests for the auth module
- [ ] 9.3 Run the full backend test suite (`npm test`) and record pass/fail counts and coverage
- [ ] 9.4 Verify the post-test database state matches the baseline; restore it if any unintended mutation occurred
- [ ] 9.5 Create the report `openspec/changes/add-admin-authentication/reports/YYYY-MM-DD-step-9-unit-test-and-db-verification.md` with commands executed, results, and DB verification
- [ ] 9.6 Mark this step complete only once tests pass and the report file exists

## 10. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [ ] 10.1 Ensure the backend server and the Dockerized PostgreSQL database are running
- [ ] 10.2 Test `POST /api/auth/login` with curl (valid credentials → 200 + session cookie; invalid → 401) and document responses
- [ ] 10.3 Test `GET /api/auth/me` with curl, with and without a valid session cookie, and document responses
- [ ] 10.4 Test `POST /api/auth/logout` with curl and verify a subsequent `GET /api/auth/me` call fails
- [ ] 10.5 Test `POST /api/auth/forgot-password` with curl for a matching and a non-matching email and verify both return the same generic response
- [ ] 10.6 Test `POST /api/auth/reset-password` with curl (valid, invalid, and expired token); restore the admin user's password state after testing
- [ ] 10.7 Test error cases (missing fields, malformed body) and verify the validation error response format
- [ ] 10.8 Document all curl commands and responses in `openspec/changes/add-admin-authentication/reports/YYYY-MM-DD-step-10-curl-endpoint-testing.md` and confirm the database state matches the pre-test baseline

## 11. Frontend: E2E Testing with Playwright MCP (MANDATORY - AGENT MUST EXECUTE)

- [ ] 11.1 Ensure both the frontend (`npm run dev`) and backend servers are running
- [ ] 11.2 Navigate to the login page and verify it renders correctly
- [ ] 11.3 Execute the full login workflow with valid credentials and verify the user lands on a protected page
- [ ] 11.4 Test an invalid login (wrong password) and verify an error message is shown
- [ ] 11.5 Test logout: verify it returns to the login page and that protected routes become inaccessible
- [ ] 11.6 Test the forgot-password / reset-password flow end to end
- [ ] 11.7 Restore any test data created during the run and document outcomes in `openspec/changes/add-admin-authentication/reports/YYYY-MM-DD-step-11-e2e-testing.md`

## 12. Documentation (MANDATORY)

- [ ] 12.1 Update `docs/api-spec.yml` if the implemented request/response shapes differ from the current draft
- [ ] 12.2 Update `docs/development_guide.md` with the real environment variable list and seed instructions
- [ ] 12.3 Update `planning/user-stories-backlog.md` US-001 status to `in-openspec`, linking to this change
