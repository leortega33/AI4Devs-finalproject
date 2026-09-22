## Purpose

Lets the trainer attach dated progress photos to a client's progress entries and
review them privately, so a client's physical evolution can be compared visually
alongside their measurements. Photos are sensitive personal data and are stored
and served with privacy safeguards.

## ADDED Requirements

### Requirement: Upload photos for a progress entry
The system SHALL let the trainer upload one or more image files to an existing
progress entry. Each upload SHALL be a `jpeg`, `png`, or `webp` image no larger
than 5 MB. The system SHALL strip embedded metadata (such as EXIF/GPS) and
re-encode the image before storing it, and SHALL persist only a storage reference
(not the bytes) in the database. Uploading SHALL require an authenticated session
and SHALL return a not-found error when the client or the progress entry does not
exist.

#### Scenario: Upload a valid image
- **WHEN** the trainer uploads a JPEG/PNG/WebP image within the size limit to an
  existing progress entry
- **THEN** the image is stripped of metadata, stored, and the created photo is
  returned referencing its progress entry

#### Scenario: Reject an unsupported type
- **WHEN** the trainer uploads a file whose type is not `jpeg`, `png`, or `webp`
- **THEN** the file is not stored and a validation error is returned

#### Scenario: Reject an oversized image
- **WHEN** the trainer uploads an image larger than the 5 MB limit
- **THEN** the file is not stored and a validation error is returned

#### Scenario: Upload to a non-existent entry
- **WHEN** the trainer uploads a photo to a client or progress entry that does
  not exist
- **THEN** a not-found error is returned and nothing is stored

### Requirement: View a progress entry's photos
The system SHALL return the photos attached to a client's progress entries so the
trainer can display them alongside the measurements, and SHALL serve each photo's
image bytes only through an authenticated request — never through a public static
URL. Viewing SHALL require an authenticated session.

#### Scenario: List photos with a progress entry
- **WHEN** the trainer opens a client's progress
- **THEN** each entry includes references to its photos so they can be displayed

#### Scenario: Stream a photo's bytes
- **WHEN** the trainer requests an existing photo over an authenticated session
- **THEN** the image bytes are streamed with the correct content type

#### Scenario: Unauthenticated photo access rejected
- **WHEN** a photo's bytes are requested without a valid authenticated session
- **THEN** the request is rejected and no image is served

#### Scenario: Request a non-existent photo
- **WHEN** the trainer requests a photo that does not exist
- **THEN** a not-found error is returned

### Requirement: Delete a progress photo
The system SHALL let the trainer delete a photo, removing both its database
reference and its stored file. Deleting the parent progress entry SHALL also
delete its photos and their stored files. Deleting SHALL require an authenticated
session and SHALL return a not-found error when the photo does not exist.

#### Scenario: Delete a photo
- **WHEN** the trainer deletes an existing photo
- **THEN** its stored file and database reference are removed and it no longer
  appears with the entry

#### Scenario: Deleting the entry removes its photos
- **WHEN** the trainer deletes a progress entry that has photos
- **THEN** the entry's photos and their stored files are removed as well

#### Scenario: Delete a non-existent photo
- **WHEN** the trainer deletes a photo that does not exist
- **THEN** a not-found error is returned

### Requirement: Durable, pluggable photo storage
The system SHALL store photo files through a storage abstraction with a
local-filesystem backend as the default, keeping files in a configured directory
that persists across application restarts and redeploys. The storage backend
SHALL be selectable by configuration without changing calling code, and the
database SHALL reference each file by an opaque generated key (never a
user-supplied path) so that stored file locations cannot be traversed or guessed.

#### Scenario: Files persist across restarts
- **WHEN** the application is restarted or redeployed after photos were uploaded
- **THEN** previously uploaded photos remain retrievable

#### Scenario: Generated storage keys
- **WHEN** a photo is stored
- **THEN** it is referenced by a generated key and the request cannot control the
  stored file's path

### Requirement: Protected photo access
All progress-photo operations SHALL require a valid authenticated session.

#### Scenario: Unauthenticated photo operation rejected
- **WHEN** any progress-photo operation is requested without a valid
  authenticated session
- **THEN** the request is rejected and no data is read or written
