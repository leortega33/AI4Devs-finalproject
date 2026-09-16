## Why

The trainer needs to track who has paid and for which period. Today this lives
on paper/spreadsheets. Manual payment registration (no online gateway) with a
fixed monthly periodicity lets the trainer record payments and, crucially,
derive each client's up-to-date/overdue status automatically. This is the basis
for the payment history (US-008) and the dashboard alerts (US-009).

## What Changes

- Add a `Payment` entity: amount, payment date, method
  (`cash` | `bank_transfer` | `card`), and the covered period (month + year).
- Register a payment for a client, and edit or delete it later (payments are
  editable/deletable, not an immutable ledger).
- List a client's payments (newest first) so they can be reviewed and
  edited/deleted.
- Derive the client's payment status (up to date / overdue / no payments) at
  query time from the most recent covered period vs. today — never stored.
- Show, per client in the list, a payment-status indicator, so the trainer sees
  at a glance who is up to date or overdue.
- All endpoints protected by the existing auth middleware (US-001).

## Capabilities

### New Capabilities
- `payments`: register/edit/delete a client's payments, list them, and derive
  the client's payment status.

### Modified Capabilities
- `client-management`: the client list additionally indicates, per client, the
  derived payment status (up to date / overdue / no payments).

## Impact

- New `Payment` table + `PaymentMethod` enum via a Prisma migration (model
  already described in `docs/data-model.md` entity #8). Back-relation added to
  `Client`.
- New `/api/clients/:clientId/payments` (POST register, GET list) and
  `/api/payments/:id` (PUT edit, DELETE) endpoints, all behind `authMiddleware`.
- The list response includes the derived payment status; editing/deleting
  recalculates it immediately (no caching).
- The client list gains a payment-status indicator column and a "Payments" row
  action to open a dedicated payments page.
- New frontend payments page, a payment form dialog, a service, and routing,
  behind `ProtectedRoute`.
- `docs/api-spec.yml` gains the payment endpoints; `docs/data-model.md` already
  defines `Payment` (verify/adjust during implementation).

## Scope Notes

- The chronological history **PDF export** and any summary/totals view are
  US-008 and are out of scope here. This change introduces payment CRUD, the
  list, and the derived status. US-008 builds the export on top.
