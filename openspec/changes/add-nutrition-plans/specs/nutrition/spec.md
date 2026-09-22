## Purpose

Lets the trainer record and maintain a structured nutrition plan for each client —
ordered meals with food items, optional daily targets, and a general note — and
keep a saved history of every change so past plans can be reviewed.

## ADDED Requirements

### Requirement: View a client's nutrition plan
The system SHALL return a client's current nutrition plan — its optional daily
targets (calories, protein), general note, and its ordered meals each with their
ordered food items. When the client has no plan yet, the system SHALL return an
empty plan payload rather than an error. Viewing SHALL require an authenticated
session and SHALL fail with a not-found error for a non-existent client.

#### Scenario: View an existing plan
- **WHEN** the trainer opens a client's nutrition plan
- **THEN** the plan is returned with its targets, note, and meals in order, each
  meal listing its food items in order

#### Scenario: View when no plan exists
- **WHEN** the trainer opens the nutrition plan of a client that has none
- **THEN** an empty plan payload is returned (no targets, no note, no meals)

#### Scenario: View for a non-existent client
- **WHEN** the trainer requests the nutrition plan of a client that does not exist
- **THEN** a not-found error is returned

### Requirement: Save a client's nutrition plan
The system SHALL let the trainer save a client's whole nutrition plan in one
operation, creating it when absent and replacing its meals and food items when it
exists. Daily targets (calories, protein) SHALL be optional and, when provided,
non-negative; the general note and each meal's note SHALL be optional. Each meal
SHALL have a name and each food item SHALL have a description; the order of meals
and of food items within a meal SHALL be preserved as submitted. Saving SHALL
require an authenticated session and SHALL fail with a not-found error for a
non-existent client.

#### Scenario: Create a plan on first save
- **WHEN** the trainer saves a plan for a client that has none
- **THEN** the plan, its meals, and its food items are stored and returned in the
  submitted order

#### Scenario: Replace meals and items on a later save
- **WHEN** the trainer saves a plan for a client that already has one
- **THEN** the previous meals and food items are replaced by the submitted ones
  and the targets and note are updated

#### Scenario: Reject a negative target
- **WHEN** the trainer submits a negative daily calorie or protein target
- **THEN** the plan is not saved and a validation error is returned

#### Scenario: Reject a meal without a name or an item without a description
- **WHEN** the trainer submits a meal missing its name or a food item missing its
  description
- **THEN** the plan is not saved and a validation error is returned

#### Scenario: Save for a non-existent client
- **WHEN** the trainer saves a plan for a client that does not exist
- **THEN** a not-found error is returned and nothing is stored

### Requirement: Keep a nutrition plan version history
The system SHALL append an immutable version snapshot of the whole plan (targets,
note, meals, and food items) each time the plan is saved, and SHALL let the
trainer view these versions newest first. The most recent version SHALL match the
current plan. Viewing history SHALL require an authenticated session.

#### Scenario: A save appends a version
- **WHEN** the trainer saves a plan
- **THEN** a new version snapshot capturing the saved plan is added to the
  client's nutrition history

#### Scenario: View the version history
- **WHEN** the trainer opens the plan's history
- **THEN** the version snapshots are returned newest first, the first matching the
  current plan

#### Scenario: Empty history
- **WHEN** the client has never had a plan saved
- **THEN** an empty history is returned

### Requirement: Protected nutrition access
All nutrition operations SHALL require a valid authenticated session.

#### Scenario: Unauthenticated nutrition access rejected
- **WHEN** any nutrition operation is requested without a valid authenticated
  session
- **THEN** the request is rejected and no data is read or written
