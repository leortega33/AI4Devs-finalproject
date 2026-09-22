## MODIFIED Requirements

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
