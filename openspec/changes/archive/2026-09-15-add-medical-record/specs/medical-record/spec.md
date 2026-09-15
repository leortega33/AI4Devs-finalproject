## Purpose

Let the gym owner/trainer keep each client's medical information up to date in
one place, so routines can be designed safely and emergencies handled
correctly. The record is optional, one per client, and reflects only the
current state (no history in the MVP).

## ADDED Requirements

### Requirement: View a client's medical record
The system SHALL let the trainer view a client's medical record, and SHALL
indicate clearly when no record exists yet without treating that as an error.

#### Scenario: View an existing record
- **WHEN** the trainer opens the medical record of a client that has one
- **THEN** the stored medical information is displayed

#### Scenario: View when no record exists yet
- **WHEN** the trainer opens the medical record of a client that has none
- **THEN** an empty state is shown (no record) and no error is raised

#### Scenario: View for a non-existent client
- **WHEN** the trainer requests the medical record of a client that does not
  exist
- **THEN** a not-found error is returned

### Requirement: Create or update a client's medical record
The system SHALL let the trainer save a client's medical record, creating it
when none exists and updating it otherwise (upsert). All medical fields are
optional and free text (with a blood type), subject to length limits.

#### Scenario: Create a record for the first time
- **WHEN** the trainer saves medical information for a client that has no
  record yet
- **THEN** a new medical record is created for that client and returned

#### Scenario: Update an existing record
- **WHEN** the trainer saves changes to a client that already has a record
- **THEN** the existing record is updated in place (still one record per
  client) and the updated data is returned

#### Scenario: Empty submission is allowed
- **WHEN** the trainer saves the medical record with all fields empty
- **THEN** the submission is accepted (the record may be created/updated with
  empty values) and no validation error is raised

#### Scenario: Oversized field rejected
- **WHEN** the trainer submits a medical field exceeding its length limit
- **THEN** the record is not saved and a validation error identifying the
  problem is returned

#### Scenario: Save for a non-existent client
- **WHEN** the trainer saves a medical record for a client that does not exist
- **THEN** the record is not saved and a not-found error is returned

### Requirement: One medical record per client
The system SHALL maintain at most one medical record per client, linked to the
client, and SHALL remove the record if its client is ever deleted.

#### Scenario: Saving twice keeps a single record
- **WHEN** the trainer saves the medical record for the same client more than
  once
- **THEN** the client still has exactly one medical record reflecting the
  latest saved values

### Requirement: Protected access
The system SHALL require an authenticated session for every medical-record
operation.

#### Scenario: Unauthenticated request rejected
- **WHEN** a medical-record request is made without a valid authenticated
  session
- **THEN** the request is rejected and no medical data is returned or modified
