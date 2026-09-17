## Why

The MVP is functionally complete but the UI (US-011) is intentionally basic. A
visual/UX refresh makes the app look professional, easier to navigate, and
comfortable on desktop and mobile — the first Phase 2 item (US-012). This is a
**presentation-only** change: same features, restyled and reorganized.

## What Changes

- **Theme** (`theme/theme.ts`): refined tokens on the existing brand (black +
  leaf green + white), self-hosted **Inter** typography (`@fontsource/inter`),
  consistent spacing/radius/elevation, and themed MUI components. Built with
  tokens that make a future dark mode easy, but **shipping light-only**.
- **Navigation**: a persistent **left sidebar** (`Panel`, `Clientes`,
  `Ejercicios`, `Rutinas`) that collapses to a drawer on mobile; the top bar
  keeps brand, language switcher and logout.
- **Dashboard**: the four alert groups rendered as **cards with icons, large
  counts and colored accents** (no charts for now); keeps the "Panel" heading
  and links.
- **Reusable primitives**: `PageHeader` (title + actions + optional back), a
  global **Snackbar** provider/hook for action feedback, and **loading
  skeletons** for data-fetching pages.
- **Tables & empty states**: consistent `DataGrid` theming and friendlier empty
  states; **responsive** down to ~360px.

## Capabilities

<!-- skip_specs: true. Presentation/UX-only refresh: no new or changed product
     capability, endpoint, or data model. The features and their behavior are
     unchanged; only styling, layout, and feedback affordances change. Specs
     describe behavior, so no spec delta is created. -->

## Impact

- Frontend only. No backend change, no API, no data model, no migration.
- New dependency: `@fontsource/inter` (self-hosted font). Optional lazy charts
  lib only if added later (not in this change).
- Modified: `theme/theme.ts`, `components/AppLayout.tsx`, `pages/DashboardPage.tsx`,
  `components/AlertList.tsx`, page components (adopt `PageHeader`, skeletons,
  snackbars), `main.tsx` (font + SnackbarProvider), `i18n` locales (nav labels).
- New: `components/Sidebar.tsx`, `components/PageHeader.tsx`,
  `components/SnackbarProvider.tsx` (+ `useSnackbar`), `components/skeletons/*`.
- **Tests**: all existing unit (Vitest) and E2E (Playwright) suites must stay
  green. Because navigation moves into a sidebar, E2E navigation steps and some
  component queries are updated — **preserving the accessible roles/names the
  tests rely on** (e.g. the "Panel" heading, button names, DataGrid roles).

## Scope Notes

- **Out of scope**: dark mode toggle, dashboard charts, and any functional
  change. Dark mode is prepared at the token level but not shipped.
- Incremental delivery: theme + primitives first, then layout/nav, then
  per-page adoption, keeping the suites green at each step.
