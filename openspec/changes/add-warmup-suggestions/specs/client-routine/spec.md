## ADDED Requirements

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
