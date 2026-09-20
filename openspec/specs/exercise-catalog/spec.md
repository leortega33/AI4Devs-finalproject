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

### Requirement: Protected access
The system SHALL require an authenticated session for every exercise-catalog
operation.

#### Scenario: Unauthenticated request rejected
- **WHEN** an exercise-catalog request is made without a valid authenticated
  session
- **THEN** the request is rejected and no exercise data is returned or modified

### Requirement: Exercise media reference
The system SHALL let the trainer attach an optional video URL and/or image URL to
a catalog exercise. The system SHALL validate that a provided URL is a well-formed
http(s) URL and SHALL treat an empty value as no media. The media URLs SHALL be
returned with the exercise and stored on create and update.

#### Scenario: Save an exercise with media URLs
- **WHEN** the trainer creates or updates an exercise with a valid video and/or
  image URL
- **THEN** the exercise is stored with the media URLs and returns them

#### Scenario: Exercise without media stays valid
- **WHEN** the trainer saves an exercise leaving the media URLs empty
- **THEN** the exercise is stored with no media and behaves as before

#### Scenario: Reject a malformed media URL
- **WHEN** the trainer submits an exercise whose video or image value is a
  non-empty, malformed URL
- **THEN** the exercise is not stored and a validation error is returned

### Requirement: Show exercise media
The system SHALL show an exercise's media in the catalog (a link/indicator for
its video and/or image) and SHALL show a video link for an exercise that has one
where it appears in a client's routine.

#### Scenario: Media shown in the catalog
- **WHEN** the trainer views the exercise catalog and an exercise has a video or
  image URL
- **THEN** a media link/indicator is shown for that exercise

#### Scenario: Video link shown in a client's routine
- **WHEN** the trainer views a client's routine and an exercise entry's exercise
  has a video URL
- **THEN** a video link is shown next to that exercise
