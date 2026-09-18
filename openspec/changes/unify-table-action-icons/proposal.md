## Why

US-028 replaced the client list's text action buttons with compact icon buttons +
tooltips, but the rest of the system's tables are inconsistent: the exercise
catalog and routine templates still use text buttons, and the payments table has
icon buttons **without** tooltips. US-029 unifies every table's row actions on the
same pattern (icon button + tooltip + preserved accessible name) for a consistent,
compact UI.

## What Changes

- **Exercise catalog** (`ExerciseCatalogPage`): replace the text "Editar" button
  with an `IconButton` + `Tooltip` (`EditOutlined`).
- **Routine templates** (`RoutineTemplatesListPage`): replace the text "Editar"
  and "Duplicar" buttons with `IconButton`s + `Tooltip` (`EditOutlined`,
  `ContentCopyOutlined`).
- **Client payments** (`ClientPaymentsPage`): wrap the existing edit/delete
  `IconButton`s in `Tooltip` for consistency (icons already present).
- Preserve every action's accessible name via `aria-label` (same i18n labels), so
  behavior, keyboard access and existing tests are unaffected.

## Capabilities

<!-- skip_specs: true. Frontend-only presentation refactor across existing tables:
     the same actions with the same destinations/handlers, rendered as icon
     buttons + tooltips. No new/changed backend behavior, endpoint, or data model,
     so no spec delta. -->

## Impact

- Frontend only. No backend/API/data-model/migration change.
- Modified: `pages/ExerciseCatalogPage.tsx`, `pages/RoutineTemplatesListPage.tsx`,
  `pages/ClientPaymentsPage.tsx`. Reuses existing i18n labels (no new keys).
- Tests: existing unit tests and E2E query actions by accessible name, which is
  preserved; extend/adjust unit tests where an action was text-only before.

## Scope Notes

- Only the row-action columns of the three remaining tables. The client list
  (US-028) is already done. Icon set: `EditOutlined`, `ContentCopyOutlined`
  (duplicate), and the existing `Edit`/`Delete` for payments.
- Kebab/overflow menu remains out of scope.
