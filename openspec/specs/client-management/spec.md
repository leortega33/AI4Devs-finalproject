# client-management Specification

## Purpose
Let the gym owner/trainer keep an up-to-date record of every client's basic
data in one place, and control which clients are currently active without ever
losing historical data.

## Requirements

### Requirement: Create client
The system SHALL allow the trainer to register a new client with their basic
data (full name, DNI, phone, email, birth date, address, goal/notes, and an
emergency contact), and SHALL reject invalid or incomplete submissions.

#### Scenario: Successful client creation
- **WHEN** the trainer submits a valid new client with the required fields
- **THEN** the client is stored, marked active, and appears in the client list

#### Scenario: Invalid client rejected
- **WHEN** the trainer submits a client missing a required field or with an
  invalid field format (for example an invalid email or DNI)
- **THEN** the client is not stored and a validation error identifying the
  problem is returned

#### Scenario: Duplicate DNI rejected
- **WHEN** the trainer submits a client whose DNI already belongs to another
  client
- **THEN** the client is not stored and a conflict error is returned

### Requirement: View client
The system SHALL let the trainer view a single client's full basic data.

#### Scenario: View an existing client
- **WHEN** the trainer opens an existing client
- **THEN** that client's stored basic data is displayed

#### Scenario: View a non-existent client
- **WHEN** the trainer requests a client that does not exist
- **THEN** a not-found error is returned

### Requirement: Edit client
The system SHALL let the trainer update a client's basic data, applying the
same validation rules as creation.

#### Scenario: Successful edit
- **WHEN** the trainer submits valid changes to an existing client
- **THEN** the client's stored data is updated

#### Scenario: Invalid edit rejected
- **WHEN** the trainer submits changes that fail validation
- **THEN** the client is not updated and a validation error is returned

### Requirement: Deactivate and reactivate client
The system SHALL let the trainer deactivate a client (logical status change)
and reactivate them later, without deleting the client or any associated
history.

#### Scenario: Deactivate a client
- **WHEN** the trainer deactivates an active client
- **THEN** the client's status becomes inactive and the client and its history
  are preserved

#### Scenario: Reactivate a client
- **WHEN** the trainer reactivates an inactive client
- **THEN** the client's status becomes active again

### Requirement: List, search, and filter clients
The system SHALL provide a client list that can be searched by name and
filtered by status (active or inactive), and that indicates, for each client,
whether they currently have an active routine assigned.

#### Scenario: Search by name
- **WHEN** the trainer searches the client list by a name fragment
- **THEN** only clients whose name matches the fragment are shown

#### Scenario: Filter by status
- **WHEN** the trainer filters the client list by a status (active or inactive)
- **THEN** only clients with that status are shown

#### Scenario: Routine-assigned indicator
- **WHEN** the trainer views the client list
- **THEN** each client shows whether they currently have an active routine
  assigned (assigned or not)

### Requirement: Protected access
The system SHALL require an authenticated session for every client-management
operation.

#### Scenario: Unauthenticated request rejected
- **WHEN** a client-management request is made without a valid authenticated
  session
- **THEN** the request is rejected and no client data is returned or modified
