## Context

`Exercise` (US-004) has name/muscleGroup/category/defaultSets/defaultReps/
technique/equipment. The Prisma exercise repository passes the validated input
straight to Prisma (`create({ data })`, `update({ where, data })`) and maps back
with `toDomain({ ...record })`, so new nullable columns flow through
automatically once the domain `Exercise` and `ExerciseInput` accept them.
`validateExercise` uses a zod `exerciseSchema`. Routine entries currently read
only the exercise `name` via `exercise: { select: { name: true } }` in the
routine `nestedInclude`, and `RoutineExerciseEntry` carries `exerciseName`.

## Goals / Non-Goals

**Goals**
- Optional `videoUrl`/`imageUrl` on an exercise, validated as URLs, editable in
  the form, shown in the catalog and as a video link in the client routine view.

**Non-Goals**
- No file upload/object storage; no media in the builder editor or the PDF/Excel
  export; no change to unrelated exercise behavior.

## Decisions

### Data model + migration
- Add `videoUrl String?` and `imageUrl String?` to `Exercise`. Migration via
  `npx prisma migrate dev --name add_exercise_media`.

### Backend
- Domain `Exercise`: add `videoUrl`/`imageUrl` to Props + class (default null).
- `ExerciseInput`: add optional `videoUrl?`/`imageUrl?`. Repository create/update/
  toDomain need **no change** (spread).
- Validator: add to `exerciseSchema`
  `z.preprocess((v) => (v === '' ? null : v), z.string().url().max(2048).nullable().optional())`
  for each URL — so an empty string means "no media" and a malformed non-empty
  value is rejected.
- Routine read: extend the nested `exercise` select to
  `{ name: true, videoUrl: true }`; add `exerciseVideoUrl?: string | null` to
  `RoutineExerciseEntry` (Props + class) and map it in `toDomain`. (Only videoUrl
  is carried into routines; the image stays a catalog concern.)

### Frontend
- `exerciseService`: add `videoUrl?`/`imageUrl?` to `Exercise` and
  `ExerciseFormData`.
- `ExerciseFormPage`: two optional `TextField`s (`type="url"`) for video and
  image, sending `null` when empty.
- Catalog: a **media** column rendering small icon links (`OndemandVideo` →
  videoUrl, `Image` → imageUrl) opening in a new tab when present.
- Client routine view: after the exercise name, a small `▶` icon link
  (`entry.exerciseVideoUrl`) opening the video in a new tab.
- `routineTemplateService` entry type: add `exerciseVideoUrl?`.
- i18n: `exercises.form.videoUrl/imageUrl`, `exercises.columns.media`,
  `exercises.watchVideo` (es/en).

## Risks / Trade-offs
- URL-only means broken/av unavailable links are possible; acceptable for the
  MVP (the trainer curates them). Links open in a new tab with `rel="noopener"`.

## Migration Plan
- Additive migration (two nullable columns). Old exercises read back with null
  media. All existing suites stay green; new tests cover URL validation, the
  form fields, the catalog media column, and the routine video link.

## Open Questions
- None. URL-only, video carried into routines, per the enriched US-019.
