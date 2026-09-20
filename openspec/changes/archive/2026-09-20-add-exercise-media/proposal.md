## Why

An exercise (US-004) has a technique note but no visual reference, so reviewing
correct form means looking it up elsewhere. US-019 lets the trainer attach an
optional **video URL** and/or **image URL** to an exercise (a YouTube/image
link), shown in the catalog and in a client's routine — no file upload/storage,
just a URL.

## What Changes

- Add optional `videoUrl` and `imageUrl` to `Exercise` (Prisma migration; both
  nullable, existing exercises unaffected).
- Validate the URLs (well-formed http(s) URL, or empty → none) on create/update.
- Exercise form: two optional URL fields (video, image).
- Catalog: a small **media** indicator/links column (video / image) when present.
- Client routine view: a small **▶ video** link next to an exercise that has one.

## Impact

- Backend: `schema.prisma` + migration, `Exercise` model + input type, validator
  (URL), routine nested read carries the exercise's `videoUrl`. The exercise
  repository maps the new fields automatically (spread) — no repo change.
- Frontend: `exerciseService` types, `ExerciseFormPage` fields, catalog media
  column, client routine video link, i18n keys.
- Docs: `docs/data-model.md` (Exercise fields), `readme.md`/`prompts.md` on close.

## Scope Notes

- **URL-only** (paste a YouTube/image link); native file upload/object storage is
  out of scope (a later story).
- The "shown in routines" requirement is met by a video link in the client
  routine view; the builder keeps showing the exercise name only.
- Existing exercises keep working with empty media.
