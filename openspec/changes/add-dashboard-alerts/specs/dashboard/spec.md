## ADDED Requirements

### Requirement: Payment and routine alert dashboard
The system SHALL provide a dashboard that aggregates active clients into four
alert groups derived at query time: clients with overdue payments, clients whose
payment is due soon (up to date but whose covered period ends within a
configurable threshold), clients with no payments (never registered one), and
clients whose active routine has expired or will expire within the same
threshold. Each alert SHALL identify the client so the trainer can navigate to
that client. The dashboard SHALL require an authenticated session.

#### Scenario: Overdue payments group
- **WHEN** the trainer opens the dashboard and an active client's derived
  payment status is overdue
- **THEN** that client appears in the overdue-payments group

#### Scenario: Payments due soon group
- **WHEN** an active client is up to date but the end of their most recent
  covered period falls within the configured threshold
- **THEN** that client appears in the payments-due-soon group

#### Scenario: Expiring routines group
- **WHEN** an active client's active routine has expired or its computed end date
  falls within the configured threshold
- **THEN** that client appears in the expiring-routines group

#### Scenario: Client with no alerts is omitted
- **WHEN** an active client is up to date (with the period ending beyond the
  threshold) and has no expiring routine
- **THEN** that client does not appear in any alert group

#### Scenario: Clients with no payments appear in their own group
- **WHEN** an active client has never registered a payment
- **THEN** that client is listed in the no-payments group and not in the
  overdue-payments group

#### Scenario: Navigate from an alert to the client
- **WHEN** the trainer selects a client from any alert group
- **THEN** they are taken to that client's relevant screen (payments or routine)

#### Scenario: Empty dashboard
- **WHEN** no active client has any overdue/due-soon/no payment or expiring
  routine
- **THEN** the dashboard shows all groups as empty with no error

### Requirement: Protected dashboard access
The system SHALL require an authenticated session to retrieve the dashboard.

#### Scenario: Unauthenticated dashboard request rejected
- **WHEN** the dashboard is requested without a valid authenticated session
- **THEN** the request is rejected and no dashboard data is returned
