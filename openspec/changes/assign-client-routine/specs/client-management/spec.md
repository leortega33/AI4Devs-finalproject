## MODIFIED Requirements

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
