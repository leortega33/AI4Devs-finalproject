## ADDED Requirements

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
