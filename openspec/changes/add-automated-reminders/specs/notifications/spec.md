## ADDED Requirements

### Requirement: Automated email reminders for client alerts
The system SHALL periodically send email reminders to clients who have a dashboard
alert (an overdue payment, a due-soon payment, or an expiring routine), reusing
the dashboard aggregation rule. Each specific alert SHALL be emailed at most once
(deduplicated by client, alert type, and a reference key identifying the payment
period or routine). Clients without an email address SHALL be skipped. The
scheduler SHALL be opt-in (disabled by default) and SHALL send no real email when
no email provider is configured.

#### Scenario: Remind a client with an overdue payment
- **WHEN** the reminder job runs and a client has an overdue payment and an email
  address, and no reminder for that payment period was sent before
- **THEN** an overdue-payment email is sent to the client and the send is recorded

#### Scenario: Remind for a due-soon payment and an expiring routine
- **WHEN** the reminder job runs and a client has a due-soon payment or an
  expiring routine (with an email, not previously reminded for it)
- **THEN** the corresponding reminder email is sent and recorded

#### Scenario: Do not resend the same alert
- **WHEN** the reminder job runs again and the same alert (same client, type, and
  reference key) was already sent
- **THEN** no duplicate email is sent for that alert

#### Scenario: Skip a client without an email
- **WHEN** a client has an alert but no email address
- **THEN** no email is attempted for that client and no send is recorded

#### Scenario: No provider configured
- **WHEN** the reminder job runs without an email provider configured
- **THEN** no real email is sent (the development provider logs instead) and the
  job completes without error

### Requirement: Manual reminder trigger
The system SHALL provide an authenticated endpoint to run the reminder job on
demand and return a summary of the outcome (how many reminders were sent and how
many were skipped). It SHALL require the same authenticated session as the rest of
the admin API.

#### Scenario: Trigger the job manually
- **WHEN** the trainer calls the manual reminder trigger while authenticated
- **THEN** the job runs and a summary of sent and skipped reminders is returned

#### Scenario: Unauthenticated trigger rejected
- **WHEN** the manual reminder trigger is called without a valid authenticated
  session
- **THEN** the request is rejected and the job does not run
