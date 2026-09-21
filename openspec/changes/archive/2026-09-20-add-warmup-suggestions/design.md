## Context

US-022 added `Exercise.bodyRegions` (controlled vocabulary), a curated keyword
dictionary, `MedicalFlagsService.getFlags(clientId) → { regions, details }`, and
`GET /api/clients/:clientId/medical-flags`. The client routine page
(`ClientRoutinePage`) already fetches the flags and renders advisory warnings on
overlapping exercises. Exercises have a `category` (`mobility | activation |
main`). The exercise repository lists exercises with an optional category filter.

## Goals / Non-Goals

**Goals**
- Suggest warm-up (mobility/activation) exercises for a client's flagged regions,
  grouped by region, as advisory guidance.
- Expose it via an endpoint and a panel on the client routine page.

**Non-Goals**
- No new data model, dictionary, or tags (all reused from US-022).
- No auto-insertion into the routine, no editing of the client's routine in place,
  no severity/priority ordering.

## Decisions

### Backend
- `WarmupSuggestionService` composed of the existing `MedicalFlagsService` and the
  `ExerciseRepository`:
  - `getSuggestions(clientId)`:
    1. `regions = (await medicalFlagsService.getFlags(clientId)).regions`
       (this also enforces client-exists → 404).
    2. If `regions` is empty → return `{ regions: [], suggestions: [] }`.
    3. Load warm-up-eligible exercises. Reuse `ExerciseRepository.findAll` twice
       (`category: 'mobility'` and `category: 'activation'`) or add a small
       repository method to fetch both; filter in the service to those whose
       `bodyRegions` intersect `regions`.
    4. Group by flagged region: for each region in `regions`, the exercises whose
       `bodyRegions` include it; drop regions with no matches.
  - Returns `{ regions, suggestions: [{ region, exercises: Exercise[] }] }` where
    each `exercises` entry carries `{ id, name, category, bodyRegions, videoUrl,
    imageUrl }`.
- Controller action + nested route `GET /api/clients/:clientId/warmup-suggestions`
  (auth-protected), returning `{ success, data }`. Wire the service in `index.ts`
  (reusing the existing `medicalRecordRepository`, `clientRepository`,
  `exerciseRepository`).

### Frontend
- `warmupSuggestionService.get(clientId)` returns
  `{ regions, suggestions: [{ region, exercises }] }` (types mirror the exercise
  service shape + region codes).
- `ClientRoutinePage`: below the active routine, a **"Calentamiento sugerido"**
  panel. For each `suggestion` group, show the localized region label and its
  exercise names (each with the reference video/image link when present, reusing
  the existing icons). Empty state when `suggestions` is empty. Fetched on load
  alongside the medical flags.
- i18n (es/en): `clientRoutine.warmup.*` (title, empty state) — region labels
  reuse the existing `exercises.regions.*` keys from US-022.

## Risks / Trade-offs
- Two catalog reads (mobility + activation) per page load. Trivial at MVP scale;
  a single `category IN (...)` query could replace them later.
- Suggestions are only as good as the exercise tagging; acceptable and transparent
  (the trainer sees which exercises target the flagged area).

## Migration Plan
- Purely additive: a new read endpoint + a UI panel. No schema change. All
  existing suites stay green; new tests cover the grouping/exclusion logic, the
  endpoint shape (401/404/empty), and the panel render.

## Open Questions
- None. Warm-up = mobility/activation exercises overlapping a flagged region;
  advisory panel on the client routine page; server-side computation.
