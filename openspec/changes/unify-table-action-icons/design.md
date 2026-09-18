## Context

Three tables still diverge from the US-028 icon-action pattern:

- `ExerciseCatalogPage` — actions column renders a single text `Button`
  ("Editar", `common.edit`) that navigates to `/exercises/:id/edit`.
- `RoutineTemplatesListPage` — actions column renders two text `Button`s:
  "Editar" (`common.edit`, navigate to `/routines/:id/edit`) and "Duplicar"
  (`routines.actions.duplicate`, calls `duplicate(id)`).
- `ClientPaymentsPage` — actions column already uses `IconButton`s (`EditIcon`,
  `DeleteIcon`) with `aria-label`, but **without** `Tooltip`.

Existing tests query some of these by accessible name, e.g. the routines test
uses `getByRole('button', { name: /duplicar/i })`. The payments edit/delete and
exercise edit are not queried by name today, but their names must stay stable.

## Goals / Non-Goals

**Goals**
- Every table's row actions use `IconButton` + `Tooltip` with a preserved
  `aria-label`.

**Non-Goals**
- No backend/API/data-model change; no kebab/overflow menu; no change to the
  client list (already done in US-028).

## Decisions

- `ExerciseCatalogPage`: replace the text button with
  `Tooltip title={t('common.edit')}` wrapping an `IconButton`
  (`aria-label={t('common.edit')}`, `EditOutlinedIcon`).
- `RoutineTemplatesListPage`: replace both text buttons with `IconButton`s in
  `Tooltip`s — Editar (`EditOutlinedIcon`, `common.edit`) and Duplicar
  (`ContentCopyOutlinedIcon`, `routines.actions.duplicate`). Keep the
  `Stack direction="row"`.
- `ClientPaymentsPage`: wrap the existing edit/delete `IconButton`s in `Tooltip`
  (`payments.edit`, `payments.delete`); no other change.
- Reuse existing i18n labels for both `aria-label` and `Tooltip title` — no new
  keys. Use `size="small"` icons consistent with US-028.
- Reduce the exercise/routines actions column widths to match the compact icons
  (~100px exercises, ~120px routines).

## Risks / Trade-offs
- Tooltip titles must equal the current labels so `getByRole('button', { name })`
  keeps matching (notably the routines "Duplicar" test).

## Migration Plan
- Presentational frontend change only. All suites stay green.

## Open Questions
- None.
