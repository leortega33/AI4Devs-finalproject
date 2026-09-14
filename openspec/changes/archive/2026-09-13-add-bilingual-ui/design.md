## Context

Frontend-only change on top of the existing Vite/React/TypeScript/MUI app (see
`proposal.md` - Why). The screens built so far (US-001 auth, US-002 clients)
have hardcoded English strings that need to move into translation resources.
This is the first cross-cutting frontend concern, so the pattern established
here is reused by every later story.

## Goals / Non-Goals

**Goals:**
- Establish the i18n setup (library, resource files, key naming) that all
  future stories follow.
- Retrofit the existing screens with translation keys.
- Keep the English-only code constraint intact.

**Non-Goals:**
- Backend changes (error codes stay language-agnostic and English).
- Additional languages beyond Spanish and English.
- Translating log messages, code comments, or any developer-facing text.
- Right-to-left layouts or locale-specific number/date/currency formatting
  (can be a later enhancement; out of scope here).

## Decisions

**1. `react-i18next` with JSON resource files, one per locale.**
`react-i18next` is the de-facto standard for React i18n, integrates cleanly
with hooks (`useTranslation`), and supports interpolation/pluralization. A
hand-rolled context-based solution was considered and rejected: it would
reimplement persistence, interpolation, and fallbacks that the library already
provides well.

**2. Detection order = stored preference → browser language → Spanish fallback.**
`i18next-browser-languagedetector` first reads a stored preference from
localStorage; if none exists, it uses the browser's preferred language when it
is Spanish or English, and otherwise falls back to Spanish. This was confirmed
with the user. Only `es` and `en` are supported, so any other browser language
resolves to the Spanish fallback.

**3. Key naming: nested namespaces by feature, keys in English.**
Keys are grouped by feature (e.g. `auth.login.title`, `clients.form.dni`,
`common.save`) and written in English, satisfying the code-English constraint
in `docs/base-standards.md`. Only the string VALUES differ per locale.

**4. Backend error codes mapped to keys on the frontend.**
The frontend maps each backend error `code` (e.g. `INVALID_CREDENTIALS`,
`DUPLICATE_DNI`, `VALIDATION_ERROR`) to a translation key, so error messages
localize without any backend change. Unknown codes fall back to a generic
localized message.

**5. Language switcher placement.**
The switcher is shown only on the authenticated screens of the app (after
login), reachable from a shared location such as the dashboard header. The
pre-login screens (login, forgot/reset password) are still fully translated,
but they follow the detected/stored language without exposing a switcher, to
keep the login flow minimal (confirmed with the user).

## Risks / Trade-offs

- **[Risk]** Missing translation keys render raw key strings to the user →
  **[Mitigation]** configure i18next with a sensible fallback and add a unit
  test that a representative screen shows no raw keys; keep `es` and `en`
  files structurally in sync.
- **[Risk]** Retrofitting every existing screen risks accidentally changing
  behavior while swapping strings → **[Mitigation]** the existing unit/E2E
  tests are updated to assert on translated (Spanish default) text and keep
  passing, catching regressions.

## Migration Plan

No data migration. Rollout is a frontend deploy. Rollback is reverting the
frontend change; the backend is untouched.
