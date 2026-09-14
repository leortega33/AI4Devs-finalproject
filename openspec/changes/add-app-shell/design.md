## Context

Frontend-only change on top of the existing Vite/React/TypeScript/MUI app. The
`ThemeProvider` in `main.tsx` currently uses an empty `createTheme()` (default
MUI look), the dashboard holds ad-hoc header controls (language switcher +
logout), and there is no shared layout or back navigation. `docs/frontend-
standards.md` already prescribes a `ThemeProvider`, breadcrumbs, and back
navigation — this change implements that. Brand assets come from the client's
gym: "SPORT – FITNESS", a black bear-with-barbell logo, and a black/leaf-green/
white palette.

## Goals / Non-Goals

**Goals:**
- Establish the shell + theme pattern every later story inherits.
- Fix the concrete gap: no back navigation from inner screens.
- Reflect the gym's brand identity.

**Non-Goals:**
- Backend or data changes.
- A full design system / component library beyond theming MUI.
- Dark mode, custom fonts loading, or per-user theme preferences.
- Redesigning individual forms beyond placing them in the shared layout.

## Decisions

**1. Custom MUI theme via `createTheme`, applied in `main.tsx`.**
Define `theme/theme.ts` with the brand palette and typography and pass it to the
existing `ThemeProvider`. This is the idiomatic MUI approach and keeps theming
centralized. Palette derived from the training-plan PDF:
- `primary`: leaf green (approx. `#43A047`, finalized against the PDF during
  implementation), used for primary actions and accents.
- `secondary`/dark surface: near-black (`#1B1B1B`) for the AppBar.
- Background: light (`#F5F5F5`), paper white; dark text on light.
Exact green is the one open value; a Material-family leaf green close to the PDF
is acceptable.

**2. A single `AppLayout` component wrapping the protected routes.**
`AppLayout` renders the `AppBar` (brand + logo + language switcher + logout) and
an `<Outlet />` for page content. It wraps the authenticated route group so
every protected screen gets the shell without repeating it. Pre-login screens
use a lighter branded header (logo + name only), not the full layout.

**3. Move the language switcher and logout from the dashboard into the AppBar.**
They are cross-cutting controls, so they belong in the shell, not in a page
body. The dashboard becomes just its content. Existing unit/E2E tests that
click logout/switcher are updated to find them in the AppBar.

**4. Back navigation via a reusable control, plus a home action in the AppBar.**
Inner screens (clients list, client form) get a back control (and/or
breadcrumbs) using `useNavigate`. The AppBar brand doubles as a home link. This
directly resolves the reported missing "back" button.

**5. Logo asset provided by the user.**
The bear logo is a binary image the agent cannot author; the user places it at
`frontend/src/assets/logo.png`. It is rendered in the AppBar and pre-login
header with alt text. If the file is missing at build time, a text-only brand
fallback is shown so the app still runs.

**6. Align the stale frontend agent doc.**
`ai-specs/agents/frontend-developer.md` references React Bootstrap; update it to
MUI to match reality. Low-risk doc-only edit bundled here since it concerns
frontend UI conventions.

## Risks / Trade-offs

- **[Risk]** The exact brand green is not specified numerically → **[Mitigation]**
  derive a close leaf green from the PDF and expose it as a single theme token
  so it can be adjusted in one place later.
- **[Risk]** Moving controls into the AppBar breaks existing tests/E2E that
  locate them in the page body → **[Mitigation]** update those tests as part of
  this change (mandatory test steps) and verify green.
- **[Risk]** Logo file may be absent when another dev builds → **[Mitigation]**
  render a text brand fallback and document the asset in the dev guide.

## Migration Plan

No data migration. Frontend deploy; rollback reverts the frontend change.
