# attendance Specification

## Purpose
TBD - created by archiving change add-attendance-tracking. Update Purpose after archive.

## Requirements

### Requirement: Record a client check-in
The system SHALL let the trainer record a check-in for a client, with a timestamp
that defaults to the current time when not provided and an optional short note.
Multiple check-ins per day are allowed. Recording SHALL require an authenticated
session and SHALL fail with a not-found error for a non-existent client.

#### Scenario: Record a check-in with the default time
- **WHEN** the trainer records a check-in for a client without specifying a time
- **THEN** a check-in is stored with the current timestamp and returned

#### Scenario: Record a check-in with a chosen time and note
- **WHEN** the trainer records a check-in providing a timestamp and a note
- **THEN** the check-in is stored with that timestamp and note

#### Scenario: Reject an oversized note
- **WHEN** the trainer submits a note longer than the allowed length
- **THEN** the check-in is not stored and a validation error is returned

#### Scenario: Record for a non-existent client
- **WHEN** the trainer records a check-in for a client that does not exist
- **THEN** a not-found error is returned and nothing is stored

### Requirement: View a client's attendance and frequency
The system SHALL let the trainer view a client's check-ins, newest first, together
with a frequency summary: the total number of check-ins, the number this calendar
month, the number in the last 30 days, and the date of the last check-in. Viewing
SHALL require an authenticated session.

#### Scenario: List check-ins with the summary
- **WHEN** the trainer opens a client's attendance
- **THEN** the check-ins are returned newest first with a summary of total, this
  month, last 30 days, and the last check-in date

#### Scenario: Empty attendance
- **WHEN** the client has no check-ins
- **THEN** an empty list is returned and the summary reports zero with no last
  check-in

#### Scenario: Attendance for a non-existent client
- **WHEN** the trainer requests attendance for a client that does not exist
- **THEN** a not-found error is returned

### Requirement: Delete a client check-in
The system SHALL let the trainer delete a check-in to correct mistakes. Deleting
SHALL require an authenticated session and SHALL return a not-found error when the
check-in does not exist.

#### Scenario: Delete a check-in
- **WHEN** the trainer deletes an existing check-in
- **THEN** it is removed and no longer appears in the client's attendance

#### Scenario: Delete a non-existent check-in
- **WHEN** the trainer deletes a check-in that does not exist
- **THEN** a not-found error is returned

### Requirement: Protected attendance access
All attendance operations SHALL require a valid authenticated session.

#### Scenario: Unauthenticated attendance rejected
- **WHEN** any attendance operation is requested without a valid authenticated
  session
- **THEN** the request is rejected and no data is read or written
