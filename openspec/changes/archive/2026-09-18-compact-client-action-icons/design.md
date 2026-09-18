## Context

`ClientsListPage` renders an `actions` column (`width: 560`) whose `renderCell`
returns a `Stack` of five text `Button`s: Editar (`common.edit`), Ficha médica
(`clients.actions.medicalRecord`), Rutina (`clients.actions.routine`), Pagos
(`clients.actions.payments`) and, depending on `row.status`, Desactivar
(`clients.actions.deactivate`, error color) or Reactivar
(`clients.actions.reactivate`). The wide column forces horizontal scrolling.

Existing unit tests and the clients E2E query these actions by their accessible
name, e.g. `getByRole('button', { name: 'Editar' })` and the row-scoped
`getByRole('button', { name: 'Desactivar' })`.

## Goals / Non-Goals

**Goals**
- Compact the actions column to icon buttons + tooltips so all actions are
  visible without horizontal scroll.
- Preserve each action's accessible name, handler and destination.

**Non-Goals**
- No kebab/overflow menu (keeps a single click per action, avoids test churn).
- No backend/API/data-model change; no change to the confirmation dialog flow.

## Decisions

- In the `actions` column `renderCell`, replace each `Button` with an
  `IconButton` wrapped in a MUI `Tooltip title={<label>}`. Set
  `aria-label={<label>}` on each `IconButton` using the **same** i18n strings as
  today, so `getByRole('button', { name })` keeps working — no new i18n keys.
- Icons (`@mui/icons-material`): Editar → `EditOutlined`, Ficha médica →
  `MedicalInformationOutlined`, Rutina → `FitnessCenterOutlined`, Pagos →
  `PaymentsOutlined`, Desactivar → `PersonOffOutlined` (`color="error"`),
  Reactivar → `HowToRegOutlined`.
- Reduce the column `width` (target ~200px, `sortable: false` unchanged) and use
  `size="small"` icon buttons in the existing `Stack direction="row"`.
- Keep the destructive action visually distinct via `color="error"`.

## Risks / Trade-offs
- Icons are less self-explanatory than text; the `Tooltip` + `aria-label`
  mitigate this for sighted and assistive-tech users alike.
- Tooltip content must match the current labels exactly to avoid breaking
  name-based queries.

## Migration Plan
- Presentational frontend change only. All suites stay green; no data or route
  changes.

## Open Questions
- None. Icon set fixed above; revisit an overflow menu only if actions grow.
