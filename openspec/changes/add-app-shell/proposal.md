## Why

The app works but looks unstyled and has no consistent navigation shell: there
is no top app bar, no branding, and no way to navigate back from an inner
screen (for example, from the clients list back to the dashboard). The visual
identity of the client's gym ("SPORT – FITNESS", black + leaf green + bear
logo) is not reflected. Doing this now, with only a few screens, is cheaper
than retrofitting later and gives every future story a ready-made layout.

## What Changes

- Add a custom MUI theme derived from the gym's brand (black, leaf green,
  white; typography) applied app-wide.
- Add a shared app shell: a persistent `AppBar` with the brand ("SPORT –
  FITNESS") and logo, containing the language switcher and logout, wrapping all
  authenticated screens.
- Add back/home navigation (and breadcrumbs) on inner screens, resolving the
  missing "back" control on the clients screens.
- Show the brand/logo header on the pre-login screens (login, forgot/reset)
  without nav actions.
- Retrofit the dashboard and client screens to sit inside the shell (moving the
  language switcher and logout out of the dashboard body into the AppBar).

## Capabilities

### New Capabilities
- `app-shell`: a consistent branded application layout with a persistent app
  bar, navigation (back/home), and a themed visual identity.

### Modified Capabilities
<!-- None at the spec level. This changes presentation/navigation, not the
     behavior contracts of admin-authentication, client-management, or
     internationalization. Those specs are unchanged. -->

## Impact

- Frontend-only change. No backend or database change.
- New theme, layout, and navigation components; existing pages are wrapped by
  the shell and lose their ad-hoc header controls (moved into the AppBar).
- New asset: the gym logo image, provided by the user under
  `frontend/src/assets/`.
- `docs/frontend-standards.md` UI/UX section already mandates a `ThemeProvider`,
  breadcrumbs, and back navigation; this change implements that guidance.
- `ai-specs/agents/frontend-developer.md` is stale (mentions React Bootstrap)
  and is aligned to MUI as part of this change.
