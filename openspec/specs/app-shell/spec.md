# app-shell Specification

## Purpose
Give the application a consistent, branded layout and reliable navigation so it
looks professional and the user can always move between screens.

## Requirements

### Requirement: Branded application shell
The system SHALL present authenticated screens within a consistent shell that
displays the gym's brand (name and logo) and provides shared controls.

#### Scenario: Shell is shown on authenticated screens
- **WHEN** the authenticated user views any authenticated screen
- **THEN** a persistent app bar with the gym brand and logo is shown, together
  with the language switcher and a logout control

#### Scenario: Brand on pre-login screens
- **WHEN** an unauthenticated user views the login, forgot-password, or
  reset-password screen
- **THEN** the gym brand and logo are shown, without the authenticated
  navigation controls

### Requirement: Back and home navigation
The system SHALL let the user navigate back to a previous or higher-level
screen from inner screens, and return to the home screen at any time.

#### Scenario: Navigate back from an inner screen
- **WHEN** the user is on an inner screen (for example the clients list or a
  client form) and activates the back/home navigation
- **THEN** the user is taken to the appropriate previous or home screen

### Requirement: Consistent visual theme
The system SHALL apply a single visual theme (brand colors and typography)
across the whole application.

#### Scenario: Theme applied app-wide
- **WHEN** the user views any screen
- **THEN** the screen uses the brand's theme (colors and typography)
  consistently rather than default framework styling

### Requirement: Responsive and accessible layout
The shell SHALL remain usable on smaller screen widths, and its navigation
controls and logo SHALL be accessible.

#### Scenario: Usable on a small screen
- **WHEN** the app is viewed at a narrow (mobile-like) width
- **THEN** the app bar and content remain usable without loss of navigation

#### Scenario: Accessible navigation and logo
- **WHEN** assistive technology inspects the shell
- **THEN** the navigation controls expose accessible labels and the logo
  exposes alternative text
