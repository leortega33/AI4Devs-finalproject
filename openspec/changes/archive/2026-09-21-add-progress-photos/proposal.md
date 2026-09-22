## Why

US-026 shipped physical-progress **measurements** but deliberately deferred
**photos** because they are sensitive personal data that need durable storage and
an authenticated serving path — infrastructure the measurements story did not
require. Trainers still want to attach dated progress photos so they can compare a
client's evolution visually. The storage and infra decisions are now resolved
(see US-026b in `planning/user-stories-backlog.md`), so this change adds photos on
top of the existing progress timeline.

## What Changes

- Add the ability to **upload one or more photos attached to a `ProgressEntry`**,
  view them alongside that entry's measurements, and delete them individually.
- Introduce a pluggable **`PhotoStorage`** abstraction (mirroring the existing
  `EmailService` pattern) with a **`LocalDiskPhotoStorage`** default backed by a
  named Docker volume; the DB stores only a storage **key**, never the bytes.
  (An `S3PhotoStorage` backend is documented as an env-selected opt-in but is NOT
  implemented in this change.)
- Strip EXIF metadata and re-encode uploads to `webp` on the server (privacy +
  size), validating type (`jpeg/png/webp`) and size (~5 MB) server-side.
- Serve photos only through an **authenticated streaming endpoint** (never a
  public static URL); delete the underlying file when a photo or its entry is
  removed.
- **BREAKING (internal API, pre-release):** relax the progress-entry rule from
  "at least one metric" to **"at least one metric OR at least one photo"**, so a
  photo-only entry is valid.
- Add photo UI to the client progress page (thumbnails per entry, upload control,
  delete with confirmation) and i18n keys (es/en).
- Add the uploads volume + `PHOTO_STORAGE_DIR` env to the production compose and
  document it (including backup) in `docs/deployment.md`.

## Capabilities

### New Capabilities
- `progress-photos`: uploading, viewing (authenticated), and deleting dated
  progress photos attached to a client's progress entries, backed by a pluggable
  storage abstraction.

### Modified Capabilities
- `progress`: the "Record a client progress entry" requirement changes so an
  entry is valid when it has at least one metric **or** at least one photo (a
  photo-only entry is allowed), instead of requiring at least one metric.

## Impact

- **Data model:** new `ProgressPhoto` table (`id`, `progressEntryId` FK →
  `ProgressEntry` cascade, `storageKey`, `contentType`, `createdAt`); Prisma
  migration. No change to `ProgressEntry` columns.
- **Backend:** new `PhotoStorage` interface + `LocalDiskPhotoStorage`, photo
  domain model/repository, an upload/serve/delete controller and nested routes
  under `/api/clients/:clientId/progress/:entryId/photos`; `multer` for multipart
  and `sharp` for EXIF-strip/re-encode; progress validator/service relaxed to
  accept photo-only entries; error handler maps a `ProgressPhotoNotFoundError` to
  404.
- **Frontend:** `progressService` gains photo calls; `ClientProgressPage` gains a
  per-entry photo strip with upload + delete; new i18n keys.
- **Infra:** `docker-compose.prod.yml` gains a `gym_prod_uploads` named volume
  mounted at `PHOTO_STORAGE_DIR`; `backend/.env.example`, `.gitignore`, and
  `docs/deployment.md` updated. CI unaffected.
- **Docs:** `docs/api-spec.yml` (photo endpoints + schemas) and
  `docs/data-model.md` (`ProgressPhoto` entity) updated.
- **Dependencies:** add `multer` (+ `@types/multer`) and `sharp` to the backend.
