## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/add-progress-photos` from `finalproject-LNO` and verify it is checked out (`git branch --show-current`)
- [x] 0.2 Verify the working tree is clean before starting (`git status`)

## 1. Dependencies + Data Model + Migration

- [x] 1.1 Add `multer` (+ `@types/multer`) and `sharp` to the backend (`npm install`); confirm the lockfile updates and the build still runs
- [x] 1.2 Add a `ProgressPhoto` model to `schema.prisma` (`id`, `progressEntryId` FK → `ProgressEntry` `onDelete: Cascade`, `storageKey String`, `contentType String`, `createdAt @default(now())`, `@@index([progressEntryId])`); add the `photos ProgressPhoto[]` relation on `ProgressEntry`
- [x] 1.3 Create the migration (`prisma migrate dev --name add_progress_photo`) and regenerate the client; confirm existing rows are untouched

## 2. Photo storage abstraction (TDD)

- [x] 2.1 Add a `PhotoStorage` interface (`save(bytes, contentType) => Promise<key>`, `read(key) => Promise<Buffer|stream>`, `delete(key) => Promise<void>`) and a `LocalDiskPhotoStorage` implementation reading `PHOTO_STORAGE_DIR` (default `./uploads`), generating a uuid-based key, ensuring the directory exists, and deleting idempotently (missing file = success); add a unit test (save→read round-trip, generated-key uniqueness, delete, delete-missing no-throw) — start failing
- [x] 2.2 Add `PHOTO_STORAGE_DIR` (and optional `PHOTO_STORAGE=local|s3`) to `backend/.env.example`; `.gitignore` the local `uploads/` dir

## 3. Backend photos (TDD)

- [x] 3.1 Add the `ProgressPhoto` domain model (with a unit test) and a `ProgressPhotoRepository` interface (`create`, `listByEntryId`, `listByEntryIds`, `findById`, `delete`) + its Prisma implementation with a repository test
- [x] 3.2 Add an image-processing helper that validates the mimetype allow-list (`jpeg/png/webp`) and re-encodes to `webp` stripping metadata via `sharp`, returning the processed bytes + `image/webp`; add a unit test (accepts allowed types, rejects a disallowed type, output is webp) — start failing
- [x] 3.3 Relax `progressSchema`/`ProgressService.record` so an entry is valid with **≥1 metric OR ≥1 photo** (photo-only allowed); update the validator + service unit tests (accepts photo-only, rejects truly-empty, still rejects negative) — start failing
- [x] 3.4 Extend `ProgressService` with photo operations: `addPhotos(clientId, entryId, files)` (ensures client + entry exist, processes + stores each file, records rows, rolls back stored files on failure), `listPhotosByEntryIds`, `getPhoto` (returns bytes + contentType via storage), `removePhoto` (deletes file then row, `ProgressPhotoNotFoundError`), and delete-entry also removes photo files before the cascading row delete; add unit tests (add to missing entry 404, photo-only create, get/stream, remove 404, entry-delete cleans files) — start failing
- [x] 3.5 Change `record` to an atomic multipart create: the entry + any uploaded photos are created together (≥1 metric OR ≥1 photo); update `list` so each returned entry includes a `photos` array of `{ id, contentType }`; keep the summary math unchanged; update service tests
- [x] 3.6 Update the controller + routes: `POST /` (multipart: metric fields + `photos` files), `GET /`, `DELETE /:id` (existing) plus `POST /:entryId/photos` (multipart), `GET /:entryId/photos/:photoId` (auth stream), `DELETE /:entryId/photos/:photoId`; wire `multer` (memory storage, 5 MB limit, mimetype filter); map `ProgressPhotoNotFoundError` to 404 in the error handler; update `index.ts` wiring; update/extend the route test (multipart create with a photo, add-photo, stream 200 + content-type, delete photo 204/404, 400 oversized/bad-type, 401, 404)
- [x] 3.7 Run the backend suite (`npm test`); keep everything green

## 4. Frontend photos (TDD)

- [x] 4.1 Extend `progressService`: `create` sends `FormData` (metrics + optional `photos`); add `addPhotos(clientId, entryId, files)`, `deletePhoto(clientId, entryId, photoId)`, and a `photoUrl(clientId, entryId, photoId)` helper; extend the `ProgressEntry` type with `photos: { id; contentType }[]`
- [x] 4.2 Update `ClientProgressPage`: the register dialog accepts optional photo files (save enabled when ≥1 metric OR ≥1 photo); each entry row/section shows photo thumbnails (authenticated `<img>` via the stream URL) with a delete-photo action + confirm; add an "add photo" control on an existing entry; add `progress.photos.*` i18n keys (es/en); update the page test (create a photo-only entry, thumbnail renders, delete a photo) — start failing
- [x] 4.3 Run `npx vitest run` + `npm run build`; keep everything green

## 5. Review Unit Tests (MANDATORY)

- [x] 5.1 Review the new backend + frontend tests against `docs/backend-standards.md` and `docs/frontend-standards.md` (storage round-trip, EXIF-strip/re-encode, photo-only rule, auth on serve, rollback, render/a11y) and fill any gaps

## 6. Run Unit Tests and Verify State (MANDATORY)

- [x] 6.1 Run the full backend suite (`npm test`) and the full frontend suite (`npx vitest run`) + `npm run build`; all green
- [x] 6.2 Record `Client`/`ProgressEntry`/`ProgressPhoto` counts before/after and confirm no stray files remain in the test storage dir (unit tests use a temp dir / mocks)
- [x] 6.3 Create the report `openspec/changes/add-progress-photos/reports/YYYY-MM-DD-step-6-unit-test-and-verification.md`

## 7. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 With the backend running and an authenticated cookie: create a photo-only entry (multipart) and confirm it lists with a `photos` entry; add a photo to an existing entry; `GET` the photo bytes (200 + `image/webp`) and confirm 401 without auth; delete a photo (204) and confirm 404 on repeat; confirm 400 for a disallowed type and an oversized file, 404 for a non-existent client/entry; delete an entry with photos and confirm its files are gone from the storage dir. Document commands + outcomes in `openspec/changes/add-progress-photos/reports/YYYY-MM-DD-step-7-curl-endpoint-testing.md`

## 8. Manual Visual + E2E Testing (MANDATORY)

- [x] 8.1 In the browser: open a client's progress, create an entry with a photo, verify the thumbnail renders (authenticated), add another photo, and delete a photo. Capture notes in `openspec/changes/add-progress-photos/reports/YYYY-MM-DD-step-8-visual-and-e2e-verification.md`
- [x] 8.2 Add a progress-photos E2E (create an entry with a photo fixture, assert the thumbnail appears, delete it); run the full suite serially (backend `RATE_LIMIT_DISABLED=true`) from a clean DB and confirm no regressions; document outcomes in the step-8 report

## 9. Infrastructure + Documentation (MANDATORY)

- [x] 9.1 Add the `gym_prod_uploads` named volume mounted at `PHOTO_STORAGE_DIR` on the `app` service in `docker-compose.prod.yml`; set `PHOTO_STORAGE_DIR` in the app environment
- [x] 9.2 Update `docs/deployment.md`: document the uploads volume, `PHOTO_STORAGE_DIR`/`PHOTO_STORAGE`, directory ownership, and include the uploads volume in the **same backup story as the DB volume**
- [x] 9.3 Update `docs/api-spec.yml` with the photo endpoints (multipart create, add-photo, stream, delete) and the `ProgressPhoto` reference on the progress schemas
- [x] 9.4 Update `docs/data-model.md` with the `ProgressPhoto` entity, its relationship, the ER diagram node, and a design-principle note (photo-only entry, generated keys, EXIF-strip)
- [x] 9.5 Update `planning/user-stories-backlog.md` US-026b status to `in-openspec`, linking to this change
- [x] 9.6 On feature close: update `readme.md` §1.3 (progress photos) and `prompts.md` with this work
