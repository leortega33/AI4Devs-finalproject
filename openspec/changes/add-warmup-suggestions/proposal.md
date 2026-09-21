## Why

US-022 already surfaces advisory warnings when a routine exercise loads a body
area the client's medical record flags. US-023 turns that same mapping into
positive guidance: for the flagged areas, suggest **warm-up/mobility exercises**
the trainer may want to include, so preparation work is relevant to the client's
condition — as guidance, never forced.

## What Changes

- Add `GET /api/clients/:clientId/warmup-suggestions`: for the client's flagged
  regions (US-022), return the catalog exercises whose `category` is `mobility`
  or `activation` and whose `bodyRegions` intersect a flagged region, grouped by
  region.
- Show an advisory **"Calentamiento sugerido"** panel on the client's routine
  page, grouped by flagged region, each suggestion linking to its reference media
  when present.

## Impact

- Backend: a `WarmupSuggestionService` (composes the medical-flags derivation +
  the exercise repository) and a controller/route for the new endpoint; wired in
  `index.ts`. Reuses US-022's `MedicalFlagsService`/dictionary and
  `Exercise.bodyRegions`. **No data-model change, no migration.**
- Frontend: a `warmupSuggestionService`; a suggestions panel on
  `ClientRoutinePage`; types + i18n (es/en).
- Docs: `docs/api-spec.yml` (the new endpoint + response schema),
  `readme.md`/`prompts.md` on close.

## Scope Notes

- **Warm-up suggestion** = a `mobility` or `activation` catalog exercise whose
  `bodyRegions` overlap a flagged region. Main-category exercises are excluded
  (they are the load, not the preparation).
- **Guidance only** — nothing is auto-added to the routine; the panel is advisory
  and does not change assign/save behavior.
- Suggestions reflect the client's **current** medical record and the catalog
  tags; they recompute on load.

## Out of Scope (future)

- In-place editing of a client's routine (routines are clones of templates),
  auto-inserting suggested warm-ups, severity/priority ordering, and structured
  (non-free-text) medical fields.
