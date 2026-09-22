# progress Specification

## Purpose
TBD - created by archiving change add-progress-tracking. Update Purpose after archive.

## Requirements

### Requirement: Record a client progress entry
The system SHALL let the trainer record a dated progress entry for a client with
any subset of a fixed metric set — weight, body fat percentage, and the chest,
waist, hips, arm, and thigh circumferences — plus an optional note, and with zero
or more attached photos. The date SHALL default to the current time when not
provided. An entry SHALL be rejected when it contains neither a metric value nor a
photo, and any provided metric SHALL be a non-negative number. Recording SHALL
require an authenticated session and SHALL fail with a not-found error for a
non-existent client.

#### Scenario: Record an entry with some metrics
- **WHEN** the trainer records an entry providing at least one metric
- **THEN** the entry is stored with those values and the given or default date and
  returned

#### Scenario: Record a photo-only entry
- **WHEN** the trainer records an entry with no metric value but at least one
  photo
- **THEN** the entry is stored and returned

#### Scenario: Reject an empty entry
- **WHEN** the trainer submits an entry with no metric value and no photo
- **THEN** the entry is not stored and a validation error is returned

#### Scenario: Reject a negative metric
- **WHEN** the trainer submits a negative value for a metric
- **THEN** the entry is not stored and a validation error is returned

#### Scenario: Record for a non-existent client
- **WHEN** the trainer records an entry for a client that does not exist
- **THEN** a not-found error is returned and nothing is stored

### Requirement: View a client's progress and evolution
The system SHALL let the trainer view a client's progress entries, newest first,
together with a summary: the latest recorded weight, the change in weight since the
first recorded entry, and the number of entries. Viewing SHALL require an
authenticated session.

#### Scenario: List entries with the summary
- **WHEN** the trainer opens a client's progress
- **THEN** the entries are returned newest first with a summary of the latest
  weight, the weight change since the first entry, and the entry count

#### Scenario: Empty progress
- **WHEN** the client has no entries
- **THEN** an empty list is returned and the summary reports no latest weight, no
  change, and a zero count

#### Scenario: Progress for a non-existent client
- **WHEN** the trainer requests progress for a client that does not exist
- **THEN** a not-found error is returned

### Requirement: Delete a client progress entry
The system SHALL let the trainer delete a progress entry to correct mistakes.
Deleting SHALL require an authenticated session and SHALL return a not-found error
when the entry does not exist.

#### Scenario: Delete an entry
- **WHEN** the trainer deletes an existing progress entry
- **THEN** it is removed and no longer appears in the client's progress

#### Scenario: Delete a non-existent entry
- **WHEN** the trainer deletes a progress entry that does not exist
- **THEN** a not-found error is returned

### Requirement: Protected progress access
All progress operations SHALL require a valid authenticated session.

#### Scenario: Unauthenticated progress rejected
- **WHEN** any progress operation is requested without a valid authenticated
  session
- **THEN** the request is rejected and no data is read or written
