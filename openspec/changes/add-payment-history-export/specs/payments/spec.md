## ADDED Requirements

### Requirement: Export a client's payment history as PDF
The system SHALL let the trainer download a client's full payment history as a
PDF document. The PDF SHALL include the client's name, their current derived
payment status, and the client's payments in reverse chronological order (newest
first), each showing the payment date, covered period, method, and amount. The
export SHALL require an authenticated session.

#### Scenario: Export a client's payment history
- **WHEN** the trainer requests the PDF export for a client with payments
- **THEN** a PDF document is returned as a downloadable file containing the
  client's name, derived payment status, and their payments newest first

#### Scenario: Export a client with no payments
- **WHEN** the trainer requests the PDF export for a client with no payments
- **THEN** a PDF document is still returned, showing the client's name, a "no
  payments" status, and an empty history

#### Scenario: Export for a non-existent client
- **WHEN** the trainer requests the PDF export for a client that does not exist
- **THEN** a not-found error is returned and no document is produced

#### Scenario: Unauthenticated export rejected
- **WHEN** the export is requested without a valid authenticated session
- **THEN** the request is rejected and no document is returned
