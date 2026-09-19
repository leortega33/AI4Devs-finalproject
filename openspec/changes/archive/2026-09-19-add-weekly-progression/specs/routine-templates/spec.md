## ADDED Requirements

### Requirement: Weekly progression on a routine exercise entry
The system SHALL let the trainer optionally define a weekly progression for a
routine exercise entry: an ordered list of per-week values, each with a week
number (1-indexed) and optional kg, reps and series. When a progression is
present, the system SHALL store and return it with the routine; the entry's
existing single kg/reps/series remains the default used when no progression is
defined. The system SHALL reject a progression with a non-positive or duplicate
week number.

#### Scenario: Create a routine with a weekly progression
- **WHEN** the trainer creates a routine whose exercise entry includes a list of
  per-week values (week 1, week 2, …)
- **THEN** the routine is stored with the entry's weekly progression and the
  saved routine returns each entry with its ordered weeks

#### Scenario: Single-value entry stays backward compatible
- **WHEN** the trainer creates or views a routine whose entries have only a
  single kg/reps/series and no weekly progression
- **THEN** the routine is stored and returned exactly as before, with an empty
  weekly progression for those entries

#### Scenario: Update replaces the weekly progression
- **WHEN** the trainer updates a routine, changing an entry's weekly progression
- **THEN** the entry's previous weeks are replaced by the submitted weeks

#### Scenario: Duplicate week rejected
- **WHEN** the trainer submits an entry whose weekly progression repeats a week
  number, or uses a week number less than 1
- **THEN** the routine is not stored and a validation error is returned

### Requirement: View a routine's weekly progression
The system SHALL show a routine exercise entry's weekly progression per week in
the client's routine view when the entry defines one, and SHALL fall back to the
single kg/reps/series line when it does not.

#### Scenario: Client routine shows per-week values
- **WHEN** the trainer opens a client's assigned routine whose entry has a weekly
  progression
- **THEN** the entry's values are shown per week (week 1, week 2, …)

#### Scenario: Client routine shows the single value when there is no progression
- **WHEN** the trainer opens a client's assigned routine whose entry has no
  weekly progression
- **THEN** the entry's single kg/reps/series is shown as before
