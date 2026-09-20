## ADDED Requirements

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
