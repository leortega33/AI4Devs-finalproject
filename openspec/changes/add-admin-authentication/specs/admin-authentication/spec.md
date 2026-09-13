## Purpose

Provide a single administrator (the gym owner/trainer) with secure access to
the system, and ensure every other capability in the application is only
reachable by that authenticated administrator.

## ADDED Requirements

### Requirement: Admin login
The system SHALL allow the administrator to authenticate using an email and
password, and SHALL establish an authenticated session on success.

#### Scenario: Successful login
- **WHEN** the administrator submits their correct email and password
- **THEN** an authenticated session is established and the administrator can
  access protected resources

#### Scenario: Invalid credentials
- **WHEN** the administrator submits an incorrect password or an email that
  does not match the admin account
- **THEN** the login is rejected with a generic invalid-credentials error and
  no session is established

### Requirement: Persistent session
The system SHALL keep the administrator authenticated across page reloads
and application restarts until they explicitly log out. The system SHALL NOT
force session expiration after a fixed period of time.

#### Scenario: Session survives reload
- **WHEN** an authenticated administrator reloads the application
- **THEN** they remain authenticated without being asked to log in again

### Requirement: Logout
The system SHALL allow the administrator to end their authenticated session.

#### Scenario: Logout ends the session
- **WHEN** an authenticated administrator logs out
- **THEN** subsequent requests from that browser are treated as
  unauthenticated

### Requirement: Protected access
The system SHALL require a valid authenticated session to access any
resource other than the authentication endpoints themselves (login, logout,
forgot-password, reset-password).

#### Scenario: Unauthenticated access is rejected
- **WHEN** a request without a valid authenticated session is made to any
  non-authentication resource
- **THEN** the request is rejected and the resource's data is not returned

### Requirement: Password reset request
The system SHALL let the administrator request a password reset by email,
and SHALL respond identically regardless of whether the submitted email
matches the admin account, to avoid revealing account existence.

#### Scenario: Reset requested for the admin email
- **WHEN** a password reset is requested with the email that matches the
  admin account
- **THEN** a generic acknowledgement is returned and a password-reset email
  is sent to that address

#### Scenario: Reset requested for a non-matching email
- **WHEN** a password reset is requested with an email that does not match
  the admin account
- **THEN** the same generic acknowledgement is returned and no email is sent

### Requirement: Password reset completion
The system SHALL let the administrator set a new password using a valid,
unexpired, single-use password-reset token, and SHALL reject the attempt
otherwise.

#### Scenario: Valid reset token
- **WHEN** the administrator submits a valid, unexpired, unused reset token
  together with a new password
- **THEN** the account's password is updated and the token can no longer be
  used

#### Scenario: Invalid or expired reset token
- **WHEN** the administrator submits a reset token that is invalid, expired,
  or already used
- **THEN** the password reset is rejected and the password is not changed

### Requirement: Brute-force protection
The system SHALL limit the rate of repeated login attempts and password-reset
requests from the same source to reduce the risk of brute-force attacks.

#### Scenario: Excessive login attempts are throttled
- **WHEN** an unusually high number of login attempts occur from the same
  source within a short time window
- **THEN** further attempts are temporarily rejected regardless of whether
  the credentials are correct
