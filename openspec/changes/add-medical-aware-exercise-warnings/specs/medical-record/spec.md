## ADDED Requirements

### Requirement: Derive flagged body regions from the medical record
The system SHALL derive, from a client's current medical record, the set of body
regions flagged by the free-text fields (`preexistingConditions`, `injuries`,
`surgeriesOrProsthetics`, `physicalRestrictions`) by matching them against a
curated keyword dictionary that maps localized (es/en) keywords to the controlled
region vocabulary. Matching SHALL be case- and accent-insensitive. The result
SHALL include, for each flagged region, the source field and the matched snippet
for transparency. This derivation SHALL require the same authenticated session as
the medical record and SHALL make no clinical judgement.

#### Scenario: Flag a region from a medical entry
- **WHEN** the client's medical record mentions a keyword mapped to a region
  (for example an injury referencing the knee)
- **THEN** that region is reported as flagged, with the source field and matched
  snippet

#### Scenario: Case- and accent-insensitive matching
- **WHEN** the keyword appears with different casing or accents than the
  dictionary entry
- **THEN** the region is still flagged

#### Scenario: No medical record or no matches
- **WHEN** the client has no medical record, or none of its text matches the
  dictionary
- **THEN** an empty set of flagged regions is returned and no error is raised

#### Scenario: Flags for a non-existent client
- **WHEN** the flagged regions are requested for a client that does not exist
- **THEN** a not-found error is returned

#### Scenario: Unauthenticated flags rejected
- **WHEN** the flagged regions are requested without a valid authenticated session
- **THEN** the request is rejected and no flags are returned
