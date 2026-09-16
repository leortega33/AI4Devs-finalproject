# payments Specification

## Purpose
Let the trainer record client payments manually (monthly periodicity), correct
them when needed, and know each client's up-to-date/overdue status automatically
— without ever manually flagging it.

## Requirements

### Requirement: Register a payment
The system SHALL let the trainer register a payment for a client with an amount,
a payment date, a method (`cash`, `bank_transfer`, or `card`), and the covered
period (month and year). The system SHALL reject an invalid payment (non-positive
amount, invalid method, or invalid period) and a payment for a non-existent
client.

#### Scenario: Successful payment registration
- **WHEN** the trainer registers a valid payment for an existing client
- **THEN** the payment is stored and appears in that client's payment list

#### Scenario: Invalid payment rejected
- **WHEN** the trainer registers a payment with a non-positive amount, an
  invalid method, or an invalid period
- **THEN** the payment is not stored and a validation error is returned

#### Scenario: Payment for a non-existent client rejected
- **WHEN** the trainer registers a payment for a client that does not exist
- **THEN** a not-found error is returned and no payment is stored

### Requirement: Edit a payment
The system SHALL let the trainer edit an existing payment, applying the same
validation rules as registration.

#### Scenario: Successful edit
- **WHEN** the trainer submits valid changes to an existing payment
- **THEN** the payment is updated

#### Scenario: Edit a non-existent payment
- **WHEN** the trainer edits a payment that does not exist
- **THEN** a not-found error is returned

### Requirement: Delete a payment
The system SHALL let the trainer delete a payment.

#### Scenario: Successful delete
- **WHEN** the trainer deletes an existing payment
- **THEN** the payment is removed and no longer appears in the client's list

#### Scenario: Delete a non-existent payment
- **WHEN** the trainer deletes a payment that does not exist
- **THEN** a not-found error is returned

### Requirement: List a client's payments
The system SHALL provide a client's payments in reverse chronological order
(newest first), along with the client's derived payment status.

#### Scenario: List payments
- **WHEN** the trainer opens a client's payments
- **THEN** that client's payments are returned newest first

#### Scenario: Empty payments
- **WHEN** the trainer opens the payments of a client with none
- **THEN** an empty list is returned with a "no payments" status and no error

### Requirement: Derived payment status
The system SHALL derive a client's payment status from the most recent covered
period versus the current date: up to date when today is within or before the
end of that period's month, overdue when today is past it, and "no payments"
when the client has none. The status SHALL always reflect the current payments
(recomputed after any create/edit/delete).

#### Scenario: Up to date
- **WHEN** the client's most recent payment covers the current month (or a
  future month)
- **THEN** the client's status is "up to date"

#### Scenario: Overdue
- **WHEN** today's date is past the end of the month covered by the client's
  most recent payment
- **THEN** the client's status is "overdue"

#### Scenario: No payments
- **WHEN** the client has no payments
- **THEN** the client's status is "no payments"

#### Scenario: Status refreshed after changes
- **WHEN** the trainer registers, edits, or deletes a payment
- **THEN** the client's derived status reflects the change immediately

### Requirement: Payment status in the client list
The system SHALL indicate, for each client in the client list, their derived
payment status (up to date / overdue / no payments).

#### Scenario: Indicator in the list
- **WHEN** the trainer views the client list
- **THEN** each client shows their current payment status

### Requirement: Protected access
The system SHALL require an authenticated session for every payment operation.

#### Scenario: Unauthenticated request rejected
- **WHEN** a payment request is made without a valid authenticated session
- **THEN** the request is rejected and no payment data is returned or modified
