## Why

The entire UI is currently in English, but the target user (a single gym
owner/trainer) is Spanish-speaking (the domain uses DNI, pesos, etc.). Doing
this now — with only the auth and client screens built — is far cheaper than
retrofitting every screen after the remaining seven stories are implemented.
Establishing the i18n pattern now also means every future story adds its
strings translated from the start.

## What Changes

- Add `react-i18next` internationalization to the frontend with two locales:
  Spanish (`es`, default) and English (`en`).
- Add a language switcher; the selected language persists across reloads
  (localStorage).
- Move all existing user-facing copy (login, forgot/reset password, dashboard,
  clients list/form, dialogs, validation and error messages) into translation
  resource files and render it via `t()` keys.
- Map backend error `code`s to localized messages on the frontend.

## Capabilities

### New Capabilities
- `internationalization`: a bilingual (Spanish/English) UI with a persistent
  language switcher, defaulting to Spanish.

### Modified Capabilities
<!-- None at the spec level. This changes how existing screens present copy,
     not the behavior contracts of admin-authentication or client-management,
     so those specs are unchanged. -->

## Impact

- Frontend-only change. No backend or database change (backend error codes are
  already language-agnostic; the frontend maps them to localized text).
- New frontend dependencies: `react-i18next`, `i18next`,
  `i18next-browser-languagedetector`.
- Touches every existing frontend page/component to replace hardcoded strings
  with translation keys.
- **Constraint (per `docs/base-standards.md`):** all code stays in English —
  translation KEYS, identifiers, comments, commits, and docs. Only the display
  string VALUES in `es.json` / `en.json` are translated.
