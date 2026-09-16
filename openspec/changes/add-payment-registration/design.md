## Context

US-007 adds manual payment registration on top of the existing `Client`
(US-002), following the established DDD layered pattern (domain model →
repository → service → controller → nested routes) and the auth middleware
(US-001). The derived payment status is the key business rule and is reused by
the dashboard (US-009). The chronological history + PDF export is US-008.

## Goals / Non-Goals

**Goals**
- Register/edit/delete payments for a client.
- List a client's payments (newest first) with the derived status.
- Compute up-to-date/overdue/no-payments status from the most recent covered
  period vs. today, recomputed after every change.
- Show the payment status per client in the client list.

**Non-Goals**
- No PDF export or totals/summary view (US-008).
- No online payment gateway (Phase 2).
- No manual status flag — status is always derived.

## Decisions

### Data model
- `Payment`: `id`, `clientId` (FK → Client, `onDelete: Cascade`),
  `amount Decimal`, `paymentDate DateTime`, `method` (`PaymentMethod` enum:
  `cash` | `bank_transfer` | `card`), `periodMonth Int` (1-12),
  `periodYear Int`, `createdAt`, `updatedAt`.
- Back-relation `Client.payments Payment[]`.
- `amount` uses Prisma `Decimal` (money); mapped to `number` at the domain
  boundary for the MVP.

### API shape
- `POST /api/clients/:clientId/payments` — register; `201` with the payment;
  `404` unknown client; `400` invalid.
- `GET /api/clients/:clientId/payments` — `200 { success, data: { payments,
  status } }`, newest first; `404` unknown client.
- `PUT /api/payments/:id` — edit; `200`; `400`/`404`.
- `DELETE /api/payments/:id` — `204`/`200`; `404` unknown payment.
- The client-scoped routes mount under `/api/clients/:clientId` (nested
  `mergeParams`), the id-scoped routes under `/api/payments`. All behind
  `authMiddleware`.

### Validation
- Zod `paymentSchema`: `amount` positive number; `method` enum;
  `periodMonth` int 1-12; `periodYear` int (e.g. 2000-2100); `paymentDate`
  coercible date. Introduce `PaymentNotFoundError` (404, mirrors the other
  not-found errors).

### Derived status (`computePaymentStatus`)
- Input: the client's payments and `now`.
- No payments → `no_payments`.
- Otherwise pick the payment with the greatest covered period
  (`periodYear`, then `periodMonth`). Compute the last day of that month; if
  `now` is after it → `overdue`, else `up_to_date`.
- Pure function, unit-tested independently; used both by the list endpoint and
  the client-list mapping.

### Client list payment indicator (modifies client-management)
- `GET /api/clients` returns `paymentStatus` per client (in addition to
  `hasActiveRoutine`). Implemented by including the client's payments in
  `PrismaClientRepository.findAll` and applying `computePaymentStatus`.
- The frontend client list gains a "Pagos" column (up-to-date/overdue/
  no-payments chip) and a "Pagos" row action to open the payments page.

### Frontend
- `services/paymentService.ts`: `list(clientId)` → `{ payments, status }`,
  `create`, `update`, `remove`.
- `components/PaymentFormDialog.tsx`: register/edit (amount, date, method,
  period month + year) with validation matching the backend.
- `pages/ClientPaymentsPage.tsx` at `/clients/:clientId/payments` (behind
  `ProtectedRoute` + `AppLayout`, `BackButton`, reached via a "Pagos" row
  action): shows the status chip, a "Register payment" button, and the payment
  list with edit/delete.
- Route wired into `App.tsx`; new i18n keys under a `payments` namespace
  (Spanish-first).

## Risks / Trade-offs

- **Decimal money**: mapped to `number` at the boundary for MVP simplicity;
  acceptable for gym-scale amounts. Can move to a money type later if needed.
- **Client list N payments**: including payments in the list query adds cost;
  for the MVP client counts it is negligible, and the status is derived in one
  pass. If the list grows, precompute or cache later.
- **Status is always derived**: avoids staleness, at a small compute cost per
  read — intentional per the backlog.

## Migration Plan

- Add the `Payment` model + `PaymentMethod` enum + back-relation, run
  `npx prisma migrate dev --name add-payment`. Additive only.

## Open Questions

- None. Overdue rule (today past the end of the most recent covered month),
  editable/deletable payments, and the derived status are confirmed in the
  backlog.
