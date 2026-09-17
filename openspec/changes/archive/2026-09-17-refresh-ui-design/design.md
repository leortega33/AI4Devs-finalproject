## Context

The app is a Vite/React 18 + MUI SPA. Today the authenticated shell
(`components/AppLayout.tsx`, US-011) is a single top `AppBar` (brand + language
switcher + logout) over a `Container` outlet; navigation between sections happens
via buttons on the dashboard. The theme (`theme/theme.ts`) uses Roboto and a
leaf-green primary. Screens fetch data in `useEffect` and show content or an
inline empty/error state. Tests (Vitest + Playwright) rely on accessible
roles/names (e.g. the "Panel" heading, button names like "Nuevo cliente",
DataGrid roles). This refresh is presentation-only and must keep all of that
green.

## Goals / Non-Goals

**Goals**
- A refined MUI theme (Inter, tokens, spacing, elevation) applied app-wide.
- Persistent left sidebar nav (desktop) that collapses to a drawer (mobile).
- A more visual dashboard (cards with icons + counts).
- Reusable `PageHeader`, global snackbars, and loading skeletons.
- Consistent tables/empty states; responsive to ~360px.
- All unit + E2E suites stay green.

**Non-Goals**
- No dark-mode toggle (tokens prepared, not shipped), no charts, no functional
  change, no backend/API/data-model change.

## Decisions

### Theme (`theme/theme.ts`)
- Self-host **Inter** via `@fontsource/inter` (imported in `main.tsx`); set
  `typography.fontFamily` to Inter with a refined scale and weights.
- Keep the brand palette (leaf green + near-black + white) but organize it as
  tokens (primary/secondary/success/warning/error, background, divider) so a
  future dark mode only needs a second palette. Add subtle `components`
  overrides: `MuiButton` (radius, no text-transform — already), `MuiCard`
  (radius, soft shadow), `MuiChip`, `MuiPaper`, and default `MuiDataGrid`
  styling (header background, row hover, border).
- `shape.borderRadius` bumped slightly; a small elevation scale for cards.

### Navigation: sidebar + top bar (`AppLayout` + `Sidebar`)
- Introduce `components/Sidebar.tsx`: a MUI `Drawer` with `List`/`ListItemButton`
  entries (`Panel` → `/`, `Clientes` → `/clients`, `Ejercicios` → `/exercises`,
  `Rutinas` → `/routines`), each with an icon and an **active state** derived
  from the current route (`useLocation`). Entries are `RouterLink`s.
- On desktop (`md+`): a **permanent** drawer beside the content. On mobile: a
  **temporary** drawer opened by a hamburger `IconButton` in the top bar.
- `AppLayout` keeps the top `AppBar` (brand/home, language switcher, logout) and
  renders the sidebar + the `Outlet` in a responsive flex/grid. The dashboard's
  section buttons become redundant (nav lives in the sidebar) but the dashboard
  keeps quick links; the "Panel" heading stays.
- **Accessibility**: `nav` landmark, `aria-current="page"` on the active item,
  `aria-label`s on the hamburger and icon-only controls.

### Reusable primitives
- `components/PageHeader.tsx`: `{ title, actions?, backTo? }` → a consistent
  header (Typography h4 + optional `BackButton` + right-aligned actions). Pages
  adopt it incrementally, preserving their current heading text/roles.
- `components/SnackbarProvider.tsx` + `useSnackbar()`: a context that renders a
  single MUI `Snackbar`/`Alert`; `useSnackbar().notify(message, severity)` is
  called after create/edit/delete and on caught errors. Mounted once in
  `main.tsx` (or `App`). Purely additive — existing inline `Alert`s can remain or
  be migrated gradually.
- `components/skeletons/`: a small `LoadingSkeleton` (list/table/cards variants)
  shown while `loading` is true on data pages, replacing bare "nothing yet"
  flashes. Pages gain a `loading` state where they only had data/empty.

### Per-page adoption (incremental, behavior-preserving)
- `DashboardPage`: alert groups → `Card`s with an icon, the count as a large
  number, and a colored accent; keep `AlertList` semantics/links (it can be
  restyled or wrapped). Keep the `getByRole('heading', { name: 'Panel' })`.
- Clients/Exercises/Routines/Payments/Medical/Client-routine pages: adopt
  `PageHeader`, add skeletons, and fire snackbars on mutations — without changing
  button names or DataGrid structure the tests query.

### i18n
- New strings (sidebar labels, snackbar messages) added to `es.json`/`en.json`
  under a `nav`/`common` namespace; no hardcoded text.

## Risks / Trade-offs
- **Test fragility**: moving nav to a sidebar changes how E2E reaches sections.
  Mitigated by keeping role-based selectors and updating only the navigation
  steps; component tests keep querying by role/name, not by layout.
- **Bundle size**: Inter self-hosted adds font files; acceptable and offline-
  friendly. No charts lib added. Watch the existing chunk-size warning.
- **Scope creep**: strictly no functional/behavioral change; snackbars/skeletons
  are additive affordances.

## Migration Plan
- Additive + restyle. Deliver in order: (1) theme + font, (2) primitives
  (`PageHeader`, snackbars, skeletons), (3) sidebar nav in `AppLayout`, (4)
  per-page adoption + dashboard cards. Run unit + E2E after each step; keep the
  suites green throughout. No DB or API changes.

## Open Questions
- None blocking (defaults agreed: light-only, no charts, Inter self-hosted).
