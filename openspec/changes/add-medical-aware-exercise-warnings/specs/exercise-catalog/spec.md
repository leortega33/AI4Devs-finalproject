## ADDED Requirements

### Requirement: Exercise body-region tags
The system SHALL let the trainer tag an exercise with the body regions it
primarily loads, chosen from a fixed, controlled vocabulary of region codes
(`neck`, `shoulder`, `elbow`, `wrist`, `upper_back`, `lower_back`, `hip`, `knee`,
`ankle`, `core`, `cardio_respiratory`). The tags are optional (an exercise may
have none), SHALL reject any value outside the vocabulary, and SHALL be returned
with the exercise. Region labels SHALL be localized while the stored codes stay
stable.

#### Scenario: Save an exercise with body regions
- **WHEN** the trainer saves an exercise selecting one or more valid body regions
- **THEN** the exercise is stored with those region codes and returns them

#### Scenario: Exercise without body regions stays valid
- **WHEN** the trainer saves an exercise selecting no body region
- **THEN** the exercise is stored with an empty region list and behaves as before

#### Scenario: Reject an unknown body region
- **WHEN** the trainer submits a body region outside the controlled vocabulary
- **THEN** the exercise is not stored and a validation error identifying the
  problem is returned
