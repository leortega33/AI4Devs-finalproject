## MODIFIED Requirements

### Requirement: Create or update a client's medical record
The system SHALL let the trainer save a client's medical record, creating it
when none exists and updating it otherwise (upsert). All medical fields are
optional and free text (with a blood type), subject to length limits. On every
successful save, the system SHALL also record an immutable, timestamped full
snapshot (a version) of the resulting record.

#### Scenario: Create a record for the first time
- **WHEN** the trainer saves medical information for a client that has no
  record yet
- **THEN** a new medical record is created for that client and returned
- **AND** a version snapshot of the saved state is recorded

#### Scenario: Update an existing record
- **WHEN** the trainer saves changes to a client that already has a record
- **THEN** the existing record is updated in place (still one record per
  client) and the updated data is returned
- **AND** a version snapshot of the saved state is recorded

#### Scenario: Empty submission is allowed
- **WHEN** the trainer saves the medical record with all fields empty
- **THEN** the submission is accepted (the record may be created/updated with
  empty values) and no validation error is raised

#### Scenario: Oversized field rejected
- **WHEN** the trainer submits a medical field exceeding its length limit
- **THEN** the record is not saved and a validation error identifying the
  problem is returned
- **AND** no version is recorded

#### Scenario: Save for a non-existent client
- **WHEN** the trainer saves a medical record for a client that does not exist
- **THEN** the record is not saved and a not-found error is returned
- **AND** no version is recorded

## ADDED Requirements

### Requirement: Medical record change history
The system SHALL keep a history of a client's medical record as immutable,
timestamped full snapshots, and SHALL let the trainer view that history newest
first. Recording a version SHALL NOT alter the current record. The history
SHALL require the same authenticated session as the medical record.

#### Scenario: View the history of a client with saved versions
- **WHEN** the trainer opens the medical record history of a client that has
  been saved at least once
- **THEN** the past versions are returned newest first, each with its timestamp
  and the medical field values captured at that time

#### Scenario: View the history when nothing has been saved
- **WHEN** the trainer opens the medical record history of a client that has
  never been saved
- **THEN** an empty history is returned and no error is raised

#### Scenario: Each save appends a version
- **WHEN** the trainer saves the medical record twice
- **THEN** the history contains two versions, and the newest version matches the
  latest saved state

#### Scenario: History for a non-existent client
- **WHEN** the trainer requests the medical record history of a client that does
  not exist
- **THEN** a not-found error is returned

#### Scenario: Unauthenticated history rejected
- **WHEN** the medical record history is requested without a valid authenticated
  session
- **THEN** the request is rejected and no history is returned
