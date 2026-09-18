## Why

The client list's "Acciones" column renders five text buttons per row (Editar,
Ficha médica, Rutina, Pagos, Desactivar/Reactivar), forcing a ~560px column and
horizontal scrolling to reach the last actions. This hurts the day-to-day flow of
the single trainer. US-028 replaces the text buttons with compact icon buttons
plus tooltips so every action fits without scrolling.

## What Changes

- Replace the five text `Button`s in the client list actions column with MUI
  `IconButton`s wrapped in `Tooltip`, shrinking the column so all actions are
  visible without horizontal scroll.
- Preserve each action's accessible name (via `aria-label` matching the current
  labels) so behavior, keyboard access and existing tests are unaffected.
- Keep the destructive action (Desactivar) visually distinct (error color) and
  the active/inactive toggle behavior unchanged.

## Capabilities

<!-- skip_specs: true. Frontend-only presentation refactor: the same actions with
     the same destinations/handlers, rendered as icon buttons + tooltips instead
     of text buttons. No new/changed backend behavior, endpoint, or data model,
     so no spec delta. -->

## Impact

- Frontend only. No backend/API/data-model/migration change.
- Modified: `pages/ClientsListPage.tsx` (icon buttons + tooltips, narrower actions
  column), `i18n` locale files if any tooltip strings are added (reusing existing
  action labels where possible).
- Tests: `ClientsListPage` unit tests stay green because the accessible names are
  preserved; the clients E2E is unaffected.

## Scope Notes

- Only the client list actions column. The kebab/overflow-menu alternative is out
  of scope (revisit if the action set grows).
- Icons: Editar → `EditOutlined`, Ficha médica → `MedicalInformationOutlined`,
  Rutina → `FitnessCenterOutlined`, Pagos → `PaymentsOutlined`, Desactivar →
  `PersonOffOutlined` (error), Reactivar → `HowToRegOutlined`.
