# exercise-catalog Specification

## Purpose
Give the trainer a reusable catalog of exercises so routines can be built
faster, and keep that catalog stable over time by never deleting exercises
(routines will reference them). Exercises are categorized so the routine
builder can separate warm-up from main work.

## Requirements

### Requirement: Create exercise
The system SHALL let the trainer add an exercise with a name, muscle group, and
category (`mobility`, `activation`, or `main`), plus optional default sets/reps,
technique, and equipment, and SHALL reject invalid submissions.

#### Scenario: Successful exercise creation
- **WHEN** the trainer submits a valid new exercise with the required fields
- **THEN** the exercise is stored and appears in the catalog

#### Scenario: Invalid exercise rejected
- **WHEN** the trainer submits an exercise missing a required field or with an
  invalid category
- **THEN** the exercise is not stored and a validation error identifying the
  problem is returned

### Requirement: View exercise
The system SHALL let the trainer view a single exercise's full data.

#### Scenario: View an existing exercise
- **WHEN** the trainer opens an existing exercise
- **THEN** that exercise's stored data is displayed

#### Scenario: View a non-existent exercise
- **WHEN** the trainer requests an exercise that does not exist
- **THEN** a not-found error is returned

### Requirement: Edit exercise
The system SHALL let the trainer update an exercise, applying the same
validation rules as creation.

#### Scenario: Successful edit
- **WHEN** the trainer submits valid changes to an existing exercise
- **THEN** the exercise's stored data is updated

#### Scenario: Invalid edit rejected
- **WHEN** the trainer submits changes that fail validation
- **THEN** the exercise is not updated and a validation error is returned

### Requirement: List, search, and filter exercises
The system SHALL provide an exercise catalog that can be searched by name and
filtered by category.

#### Scenario: Search by name
- **WHEN** the trainer searches the catalog by a name fragment
- **THEN** only exercises whose name matches the fragment are shown

#### Scenario: Filter by category
- **WHEN** the trainer filters the catalog by a category
- **THEN** only exercises in that category are shown

### Requirement: No exercise deletion
The system SHALL NOT provide a way to delete an exercise, so routines that
reference it are never broken.

#### Scenario: Deletion is not exposed
- **WHEN** a request attempts to delete an exercise
- **THEN** the catalog exposes no delete operation and the exercise remains

### Requirement: Seeded base catalog
The system SHALL seed a base set of common exercises covering all three
categories on first run, without duplicating them on subsequent seed runs.

#### Scenario: Base catalog available after seeding
- **WHEN** the database is seeded
- **THEN** a base set of exercises across mobility, activation, and main
  categories exists

#### Scenario: Re-seeding does not duplicate
- **WHEN** the seed runs again
- **THEN** the base exercises are not duplicated

### Requirement: Protected access
The system SHALL require an authenticated session for every exercise-catalog
operation.

#### Scenario: Unauthenticated request rejected
- **WHEN** an exercise-catalog request is made without a valid authenticated
  session
- **THEN** the request is rejected and no exercise data is returned or modified
