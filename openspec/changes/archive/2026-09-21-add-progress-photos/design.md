## Context

See proposal.md — Why. US-026 shipped `ProgressEntry` with a JSON create endpoint
(`POST /api/clients/:clientId/progress`) that requires at least one metric, a
list endpoint that returns entries + a summary, and a delete endpoint. The service
ensures the client exists, defaults the date, and computes the summary. The app is
a single-origin Dockerized deploy: one `gym-app` image behind Cloudflare Tunnel
(or optional Render), Postgres in a named volume; the `app` container is currently
**stateless**. Auth is a session cookie enforced by middleware on all routers.

Photos are sensitive PII, so bytes must never be public-static and must be served
through the authenticated app. Storage must survive redeploys. All storage/infra
decisions were resolved in `planning/user-stories-backlog.md` (US-026b).

## Goals / Non-Goals

**Goals:**
- Attach photos to a `ProgressEntry`, upload/serve/delete them behind auth, with
  metadata stripped and files persisted on a named volume.
- Make a photo-only entry valid (relax the metric-only rule) atomically.
- Keep the storage backend swappable by env without touching callers.

**Non-Goals:**
- No `S3PhotoStorage` implementation in this change (env seam only, documented).
- No image gallery/lightbox, cropping, captions, ordering, or per-photo notes.
- No EXIF-based auto-orientation beyond what the re-encode step provides.
- No change to the metric set, the summary math, or the measurements UI layout
  beyond adding a photo strip.

## Decisions

### Atomic multipart create (metrics + photos in one request)
`POST /api/clients/:clientId/progress` becomes `multipart/form-data`: optional
metric **text** fields + optional `photos` **files**. Validation requires **≥1
metric OR ≥1 photo**. The controller creates the entry row, stores each file via
`PhotoStorage`, and inserts `ProgressPhoto` rows; if any file store fails, it
deletes what it stored and the entry so no partial entry survives.
- **Why:** a photo-only entry must be valid the moment it is created; a two-step
  "create empty entry, then upload" flow would leave an invariant-violating empty
  entry in the window between calls.
- **Alternative (rejected):** keep create JSON-only and always add photos to an
  existing entry — cannot express a valid photo-only entry atomically and forces
  the "≥1 metric" rule to be dropped entirely instead of relaxed.
- **Compatibility:** this is a BREAKING change to the create contract (JSON →
  multipart), acceptable pre-release; the frontend switches to `FormData`.

### A separate "add photos to an existing entry" endpoint
`POST /api/clients/:clientId/progress/:entryId/photos` (multipart, `photos`
files) lets the trainer add more photos later without re-creating the entry.
Shares the same store-and-record helper as create.
- **Why:** viewing an old entry and adding a forgotten photo is a natural action;
  keeps create focused on creation.

### Authenticated streaming serve, generated keys
`GET /api/clients/:clientId/progress/:entryId/photos/:photoId` streams the bytes
with the stored `contentType` through the auth middleware. The DB stores an opaque
generated `storageKey` (uuid-based filename); the serve path resolves the key via
the repository, never from client input, so paths cannot be traversed/guessed.
- **Alternative (rejected):** static `express.static` mount — would expose bytes
  without auth and leak keys; violates the privacy requirement.

### `PhotoStorage` abstraction + `LocalDiskPhotoStorage` default
An interface (`save(bytes, contentType) → key`, `read(key) → stream`,
`delete(key)`) mirroring the existing `EmailService` seam. `LocalDiskPhotoStorage`
writes under `PHOTO_STORAGE_DIR` (default `./uploads` in dev, `/data/photos` in
the container) backed by a named Docker volume. `PHOTO_STORAGE=local|s3` selects
the backend; only `local` ships here.
- **Why:** matches the primary local + Cloudflare Tunnel deploy with zero
  external services; keeps a documented seam for R2/Supabase if a cloud
  always-on deploy is later chosen.

### `sharp` for strip + re-encode; `multer` memory storage for validation
Uploads go through `multer` (memory storage, 5 MB limit, mimetype allow-list),
then `sharp` re-encodes to `webp` (dropping EXIF/GPS) before `PhotoStorage.save`.
Stored `contentType` is always `image/webp`.
- **Why:** server-side type/size enforcement + privacy (strip GPS) + smaller,
  uniform files. **Alternative (rejected):** store original bytes — leaks EXIF
  location data and varies wildly in size.

### List endpoint returns photo references, not bytes
`GET .../progress` extends each entry with a `photos` array of `{ id, contentType }`
(the client builds the authenticated stream URL from ids). Summary math is
unchanged.

### Data model
New `ProgressPhoto` (`id`, `progressEntryId` FK → `ProgressEntry` `onDelete:
Cascade`, `storageKey`, `contentType`, `createdAt`, `@@index([progressEntryId])`).
DB cascade removes rows on entry delete; the service deletes the **files** first
(cascade does not touch disk), then the entry.

## Risks / Trade-offs

- **Orphaned files if a delete's DB step succeeds but the file remove fails (or
  vice-versa)** → delete the file first, then the row; a failed file delete for a
  missing file is treated as success (idempotent). On entry delete, enumerate the
  entry's photo keys and remove files before the cascading row delete.
- **Volume not mounted / not writable in prod** → document the `gym_prod_uploads`
  volume + `PHOTO_STORAGE_DIR` ownership in `docs/deployment.md`; the storage
  ensures the directory exists on startup and fails fast with a clear error.
- **Multipart create breaks existing JSON callers** → pre-release, only the
  bundled frontend calls it; update it to `FormData` in the same change and update
  the create tests.
- **Large `sharp` binary / native build in the Docker image** → acceptable; it is
  a common, prebuilt dependency and the multi-stage build already compiles native
  deps.
- **Backup drift between the DB volume and the uploads volume** → document both
  volumes together as a single backup unit in `docs/deployment.md`.

## Migration Plan

- Additive Prisma migration (`add_progress_photo`); no change to existing tables.
- New dependencies `multer` (+ `@types/multer`) and `sharp`.
- Infra: add the `gym_prod_uploads` named volume + `PHOTO_STORAGE_DIR` to
  `docker-compose.prod.yml`; add `PHOTO_STORAGE_DIR`/`PHOTO_STORAGE` to
  `backend/.env.example`; `.gitignore` the local `uploads/` dir.
- Rollback: revert the migration and code; stored files can be discarded (no other
  system depends on them).
