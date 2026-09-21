# client-routine Specification

## Purpose
Let the trainer give each client an active, trackable routine by cloning a
library template, keeping only one active routine per client and a full history
of past routines, so a client's assigned routine can evolve independently of the
template it came from.

## Requirements

### Requirement: Assign a routine to a client
The system SHALL let the trainer assign a routine to a client by deep-cloning an
existing library template into a client-owned routine with a start date and a
fixed duration, marking it active. The system SHALL reject an assignment that
references a non-existent client or a non-existent library template, or that is
missing the start date or duration.

#### Scenario: Successful assignment clones the template
- **WHEN** the trainer assigns an existing template to a client with a start
  date and a duration
- **THEN** a new client-owned routine is created as a deep copy of the
  template's sessions and entries, marked active, and linked back to the source
  template

#### Scenario: Assigning closes the previous active routine
- **WHEN** the trainer assigns a new routine to a client that already has an
  active routine
- **THEN** the previous routine is closed (no longer active) and the client has
  exactly one active routine

#### Scenario: Assignment for a non-existent client rejected
- **WHEN** the trainer assigns a routine to a client that does not exist
- **THEN** a not-found error is returned and no routine is created

#### Scenario: Assignment referencing an unknown template rejected
- **WHEN** the trainer assigns a template that does not exist
- **THEN** an error is returned and no routine is created

### Requirement: View a client's active routine
The system SHALL let the trainer view a client's current active routine with its
full nested detail, and SHALL clearly indicate when the client has no active
routine without treating that as an error.

#### Scenario: View the active routine
- **WHEN** the trainer opens the routine of a client that has an active one
- **THEN** the active routine with its sessions and ordered entries is returned

#### Scenario: View when no active routine exists
- **WHEN** the trainer opens the routine of a client that has none
- **THEN** an empty state is returned (no routine) and no error is raised

### Requirement: View a client's routine history
The system SHALL let the trainer view the client's previously assigned routines.

#### Scenario: List history
- **WHEN** the trainer opens the routine history of a client
- **THEN** the client's previously assigned (closed) routines are listed

### Requirement: Adjust a client's active routine
The system SHALL let the trainer adjust the client's active routine by replacing
its sessions and entries, independently of the source template and without
affecting that template.

#### Scenario: Adjust replaces nested data
- **WHEN** the trainer submits valid changes to the client's active routine
- **THEN** the active routine's sessions and entries are replaced to match the
  submission, while it remains active and linked to the client

#### Scenario: Adjusting does not change the source template
- **WHEN** the trainer adjusts a client's assigned routine
- **THEN** the library template it was cloned from remains unchanged

#### Scenario: Adjust when no active routine exists
- **WHEN** the trainer adjusts a client that has no active routine
- **THEN** a not-found error is returned

### Requirement: Protected access
The system SHALL require an authenticated session for every client-routine
operation.

#### Scenario: Unauthenticated request rejected
- **WHEN** a client-routine request is made without a valid authenticated
  session
- **THEN** the request is rejected and no routine data is returned or modified

### Requirement: Advisory medical warnings on a client's routine
When viewing a client's active routine, the system SHALL show an advisory,
non-blocking warning on any exercise whose body regions intersect the regions
flagged by the client's current medical record, naming the overlapping region(s).
The warning SHALL be purely advisory: it SHALL NOT prevent assigning, adjusting,
or saving the routine, and it SHALL use clear, non-diagnostic wording. To support
this, each routine exercise entry SHALL carry its exercise's body regions.

#### Scenario: Warn on an overlapping exercise
- **WHEN** the client's routine includes an exercise whose body regions intersect
  a region flagged by the client's medical record
- **THEN** an advisory marker naming the overlapping region(s) is shown on that
  exercise

#### Scenario: No warning without overlap
- **WHEN** an exercise's body regions do not intersect any flagged region
- **THEN** no advisory marker is shown for that exercise

#### Scenario: Warnings never block
- **WHEN** an advisory marker is shown
- **THEN** the trainer can still assign, adjust, and save the routine normally

### Requirement: Medical-aware warm-up suggestions
When viewing a client's routine, the system SHALL suggest warm-up exercises for
the body regions flagged by the client's current medical record. A suggestion is
a catalog exercise whose category is `mobility` or `activation` and whose body
regions intersect a flagged region; main-category exercises SHALL NOT be
suggested. Suggestions SHALL be grouped by flagged region, SHALL be advisory
guidance only (nothing is auto-added and assigning/saving is unaffected), and
SHALL require the same authenticated session as the client's routine.

#### Scenario: Suggest warm-up work for a flagged region
- **WHEN** the client's medical record flags a body region and the catalog has a
  mobility or activation exercise tagged with that region
- **THEN** that exercise is suggested under that region

#### Scenario: Main-category exercises are not suggested
- **WHEN** the only exercises tagged with a flagged region are main-category
- **THEN** no warm-up suggestion is produced for that region

#### Scenario: No suggestions without flags or matches
- **WHEN** the client has no flagged regions, or no mobility/activation exercise
  matches a flagged region
- **THEN** an empty set of suggestions is returned and no error is raised

#### Scenario: Suggestions are advisory only
- **WHEN** suggestions are shown for a client's routine
- **THEN** nothing is added to the routine automatically and the trainer can
  still assign, adjust, and save normally

#### Scenario: Suggestions for a non-existent client
- **WHEN** warm-up suggestions are requested for a client that does not exist
- **THEN** a not-found error is returned

#### Scenario: Unauthenticated suggestions rejected
- **WHEN** warm-up suggestions are requested without a valid authenticated session
- **THEN** the request is rejected and no suggestions are returned
