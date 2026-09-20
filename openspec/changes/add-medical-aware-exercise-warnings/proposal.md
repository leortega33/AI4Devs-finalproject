## Why

When assigning a routine to a client, the trainer has no reminder that an
exercise loads a body area the client's medical record already flags (an injury,
condition, surgery, or restriction). US-022 surfaces that overlap as an
**advisory, non-blocking** warning so the trainer reviews the prescription — the
system never diagnoses or blocks saving.

## What Changes

- Tag each exercise with the **body regions** it primarily loads, from a curated,
  controlled vocabulary (`neck`, `shoulder`, `elbow`, `wrist`, `upper_back`,
  `lower_back`, `hip`, `knee`, `ankle`, `core`, `cardio_respiratory`).
- Derive the client's **flagged regions** from their current medical record by
  scanning the free-text fields against a curated keyword dictionary (es/en),
  matching accent- and case-insensitively.
- On a client's active routine, show an **advisory marker** on any exercise whose
  regions intersect the client's flagged regions, naming the overlapping
  region(s). Saving/assigning is never prevented.

## Impact

- Data model: `Exercise.bodyRegions String[]` (controlled region codes; default
  empty). **Additive migration.** No change to `MedicalRecord` (stays free text).
- Backend: exercise input/model/repository/validator gain `bodyRegions`; a
  `MedicalFlagsService` + curated region dictionary derives flagged regions from
  the medical record; new `GET /api/clients/:clientId/medical-flags`; the client
  routine read denormalizes `exerciseBodyRegions` onto each entry (like
  `exerciseVideoUrl`).
- Frontend: exercise form gains a region multi-select; the client routine page
  fetches the flags and renders the advisory marker; types + i18n (es/en) for
  region labels and the warning text.
- Docs: `docs/api-spec.yml` (`bodyRegions`, `medical-flags`), `docs/data-model.md`
  (`Exercise.bodyRegions`), `readme.md`/`prompts.md` on close.

## Scope Notes

- **Advisory only** — the marker surfaces region overlap; it makes no clinical
  judgement and never blocks saving.
- **Rules source** = curated dictionary in code (not user-editable this
  iteration). Region codes are stable; labels are localized.
- Warnings are shown on a **client's** routine (client-scoped, has a medical
  record). Library template building (no client context) is out of scope.
- Matching scans `preexistingConditions`, `injuries`, `surgeriesOrProsthetics`,
  and `physicalRestrictions` of the client's current medical record.

## Out of Scope (future)

- User-editable rules/dictionary, per-condition severity levels, structured
  (non-free-text) medical fields, and warm-up suggestions (US-023).
