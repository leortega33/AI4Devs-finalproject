## MODIFIED Requirements

### Requirement: Create exercise
The system SHALL let the trainer add an exercise with a name, muscle group, and
category (`mobility`, `activation`, or `main`), plus optional default sets/reps,
technique, and equipment, and SHALL reject invalid submissions. Default sets and
reps, when provided, SHALL be non-negative integers, and the exercise form SHALL
prevent entering negative values.

#### Scenario: Successful exercise creation
- **WHEN** the trainer submits a valid new exercise with the required fields
- **THEN** the exercise is stored and appears in the catalog

#### Scenario: Invalid exercise rejected
- **WHEN** the trainer submits an exercise missing a required field or with an
  invalid category
- **THEN** the exercise is not stored and a validation error identifying the
  problem is returned

#### Scenario: Negative default sets or reps rejected
- **WHEN** the trainer enters a negative value for default sets or reps
- **THEN** the form prevents the submission and shows a validation message, and
  the backend rejects any negative value with a validation error

### Requirement: Seeded base catalog
The system SHALL seed a base set of common exercises covering all three
categories on first run, without duplicating them on subsequent seed runs. The
seeded content (names, muscle groups, equipment) SHALL be in the trainer's
language (Spanish).

#### Scenario: Base catalog available after seeding
- **WHEN** the database is seeded
- **THEN** a base set of exercises across mobility, activation, and main
  categories exists, with Spanish names

#### Scenario: Re-seeding does not duplicate
- **WHEN** the seed runs again
- **THEN** the base exercises are not duplicated
