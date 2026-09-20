## ADDED Requirements

### Requirement: Dashboard KPIs
The system SHALL include, in the dashboard response, a set of aggregate KPIs
derived at query time: the number of active clients, the number of active clients
by derived payment status (up to date, overdue, no payments), and the monthly
income (the sum of payment amounts whose payment date falls within the current
month). The KPIs SHALL require the same authenticated session as the dashboard.

#### Scenario: Active client count and status split
- **WHEN** the trainer opens the dashboard
- **THEN** the KPIs report the number of active clients and how many are up to
  date, overdue, and with no payments, consistent with the derived payment-status
  rule

#### Scenario: Monthly income
- **WHEN** the trainer opens the dashboard
- **THEN** the KPIs report the monthly income as the sum of the amounts of
  payments whose payment date falls within the current month

#### Scenario: No payments this month
- **WHEN** no payment has a payment date within the current month
- **THEN** the monthly income KPI is zero

#### Scenario: Unauthenticated KPIs rejected
- **WHEN** the dashboard is requested without a valid authenticated session
- **THEN** the request is rejected and no KPIs are returned
