## ADDED Requirements

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
