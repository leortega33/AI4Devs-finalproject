# Step 5 Report - E2E Testing with Playwright

- Date: 2026-09-18
- Change: filter-clients-by-payment (US-014)

## Setup

- Servers restarted from a clean DB (0 clients, 0 payments, 11 exercises).
- Backend started with `RATE_LIMIT_DISABLED=true` (avoids the login rate limiter
  across the full serial suite).
- Command: `npx playwright test --workers=1`.

## Changes to the suite

Extended `e2e/clients.spec.ts` ("create, edit, filter and deactivate a client"):

- Fixed the status-filter combobox selector to a scoped regex
  (`/^Estado (Todos|Activo|Inactivo)/`) so it no longer clashes with the new
  "Estado de pago" combobox.
- Added a payment-status filter check: with the client (no payments) shown,
  selecting **"Sin pagos"** keeps it visible, and switching to **"Al día"** hides
  it (`toHaveCount(0)`).

## Result

- **14/14 passed** in a single serial run (22.7s). No regressions.

## Cleanup

- E2E-created data removed after the run (Payments/RoutineTemplates/Clients
  cleared; E2E exercises deleted) — Exercise catalog back to 11.

## Outcome

- Step 5 status: PASS
- Blocking issues: none
