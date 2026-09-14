# internationalization Specification

## Purpose
Let the single admin user use the application in their preferred language
(Spanish or English), so the interface is comfortable to use day to day.

## Requirements

### Requirement: Bilingual interface
The system SHALL present all user-facing text in either Spanish or English.
On first use, when no language preference is stored, the system SHALL select
the language from the browser's preferred language, falling back to Spanish
when the browser language is neither Spanish nor English.

#### Scenario: Browser language used on first use
- **WHEN** the user opens the application for the first time (no language
  preference stored) with a browser whose preferred language is Spanish or
  English
- **THEN** the interface is displayed in that browser language

#### Scenario: Fallback to Spanish on first use
- **WHEN** the user opens the application for the first time (no language
  preference stored) with a browser whose preferred language is neither
  Spanish nor English
- **THEN** the interface is displayed in Spanish

#### Scenario: All screens are translated
- **WHEN** the user navigates any screen of the application in the selected
  language
- **THEN** all visible labels, buttons, messages, and validation/error text
  are shown in that language with no untranslated leftovers

### Requirement: Language switcher
The system SHALL provide a control, available on the authenticated screens of
the application, to switch the interface language between Spanish and English,
applied immediately across the application.

#### Scenario: Switch language
- **WHEN** an authenticated user selects a different language from the switcher
- **THEN** the interface text updates to the chosen language without losing
  the current page or entered data

### Requirement: Persisted language preference
The system SHALL remember the user's chosen language across page reloads and
application restarts.

#### Scenario: Preference survives reload
- **WHEN** the user has selected a language and then reloads or reopens the
  application
- **THEN** the interface is shown in the previously selected language rather
  than reverting to the default

### Requirement: Localized backend error messages
The system SHALL present errors returned by the backend to the user in the
selected language, based on the error's language-agnostic code.

#### Scenario: Localized error display
- **WHEN** the backend rejects a request with a known error code (for example
  invalid credentials or a duplicate DNI)
- **THEN** the user sees the corresponding message in the currently selected
  language
