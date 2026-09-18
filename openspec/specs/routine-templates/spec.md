# routine-templates Specification

## Purpose
Let the trainer build reusable routine templates once and duplicate them,
instead of rebuilding a routine from scratch for every client. A template is a
structured, nested object: sessions, each with a warm-up and a main block of
exercises drawn from the catalog.

## Requirements

### Requirement: Create routine template
The system SHALL let the trainer create a library routine template with a name
and one or more sessions, where each session has a name and a list of exercise
entries, and each entry references a catalog exercise with a phase
(`warmup` or `main`). The system SHALL reject a template without a name or
without at least one session, and SHALL reject an entry that references a
non-existent exercise.

#### Scenario: Successful template creation
- **WHEN** the trainer submits a valid template with a name and at least one
  session containing exercise entries
- **THEN** the template and its nested sessions and entries are stored and the
  template appears in the template library

#### Scenario: Template without a session rejected
- **WHEN** the trainer submits a template with no sessions
- **THEN** the template is not stored and a validation error is returned

#### Scenario: Entry with an unknown exercise rejected
- **WHEN** the trainer submits a template whose entry references an exercise
  that does not exist
- **THEN** the template is not stored and a validation error is returned

### Requirement: View routine template
The system SHALL let the trainer view a single template with its full nested
detail (sessions and their warm-up and main exercise entries, in order).

#### Scenario: View an existing template
- **WHEN** the trainer opens an existing template
- **THEN** the template with its sessions and ordered exercise entries is
  returned

#### Scenario: View a non-existent template
- **WHEN** the trainer requests a template that does not exist
- **THEN** a not-found error is returned

### Requirement: List library templates
The system SHALL provide a list of the reusable library templates (those not
assigned to a client).

#### Scenario: List templates
- **WHEN** the trainer opens the template library
- **THEN** the reusable library templates are listed

### Requirement: Update routine template
The system SHALL let the trainer update a template, replacing its full set of
sessions and exercise entries atomically, applying the same validation rules as
creation.

#### Scenario: Successful update replaces nested data
- **WHEN** the trainer submits valid changes that add, remove, or reorder
  sessions and entries
- **THEN** the template's stored sessions and entries are replaced to match the
  submission

#### Scenario: Invalid update rejected without partial changes
- **WHEN** the trainer submits an update that fails validation
- **THEN** the template is not modified at all (no partial update remains)

### Requirement: Duplicate routine template
The system SHALL let the trainer duplicate a template into a new, independent
library template that is a deep copy of the original's sessions and entries.

#### Scenario: Duplicate creates an independent deep copy
- **WHEN** the trainer duplicates an existing template
- **THEN** a new template with copies of all sessions and entries is created

#### Scenario: Editing the copy does not affect the original
- **WHEN** the trainer edits the duplicated template
- **THEN** the original template remains unchanged

### Requirement: Protected access
The system SHALL require an authenticated session for every routine-template
operation.

#### Scenario: Unauthenticated request rejected
- **WHEN** a routine-template request is made without a valid authenticated
  session
- **THEN** the request is rejected and no template data is returned or modified

### Requirement: Export a routine as PDF
The system SHALL let the trainer download a routine (a library template or a
client's assigned routine, identified by its routine-template id) as a PDF
document. The PDF SHALL include the routine's name and objective, and for each
session in order its name, its warm-up prescription (when present), and its
ordered exercise entries showing the exercise name, phase (warm-up or main),
optional block, and the kg / reps / series and notes when present. The export
SHALL require an authenticated session.

#### Scenario: Export a routine with sessions
- **WHEN** the trainer requests the PDF export for a routine that has sessions
  and exercise entries
- **THEN** a PDF document is returned as a downloadable file containing the
  routine name and, per session in order, its warm-up and its ordered exercise
  entries with their prescriptions

#### Scenario: Export a routine with no sessions
- **WHEN** the trainer requests the PDF export for a routine that has no sessions
- **THEN** a PDF document is still returned, showing the routine name and an
  empty body

#### Scenario: Export a non-existent routine as PDF
- **WHEN** the trainer requests the PDF export for a routine id that does not
  exist
- **THEN** a not-found error is returned and no document is produced

#### Scenario: Unauthenticated PDF export rejected
- **WHEN** the PDF export is requested without a valid authenticated session
- **THEN** the request is rejected and no document is returned

### Requirement: Export a routine as a spreadsheet
The system SHALL let the trainer download a routine (a library template or a
client's assigned routine, identified by its routine-template id) as an Excel
(`.xlsx`) workbook. The workbook SHALL contain one worksheet per session in
order, and within each worksheet a header row plus one row per exercise entry
showing the phase, block, exercise name, kg, reps, series and notes. The export
SHALL require an authenticated session.

#### Scenario: Export a routine as a workbook
- **WHEN** the trainer requests the Excel export for a routine that has sessions
  and exercise entries
- **THEN** an `.xlsx` workbook is returned as a downloadable file with one
  worksheet per session, each listing its exercise entries with their
  prescriptions

#### Scenario: Export a routine with no sessions as a workbook
- **WHEN** the trainer requests the Excel export for a routine that has no
  sessions
- **THEN** an `.xlsx` workbook is still returned (with no per-session sheets or a
  single empty sheet) and the request succeeds

#### Scenario: Export a non-existent routine as a workbook
- **WHEN** the trainer requests the Excel export for a routine id that does not
  exist
- **THEN** a not-found error is returned and no document is produced

#### Scenario: Unauthenticated workbook export rejected
- **WHEN** the Excel export is requested without a valid authenticated session
- **THEN** the request is rejected and no document is returned
