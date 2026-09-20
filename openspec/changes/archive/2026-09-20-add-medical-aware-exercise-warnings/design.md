## Context

Exercises (`Exercise`, US-004) have `name`, `muscleGroup`, `category`, optional
sets/reps/technique/equipment, and `videoUrl`/`imageUrl` (US-019); they are
created/edited via `POST`/`PUT /api/exercises` and validated by `exerciseSchema`
(zod). The client routine read (`clientRoutineService` → `ClientRoutinePage`)
denormalizes each entry's `exerciseName` and `exerciseVideoUrl` from the exercise.
The medical record (`MedicalRecord`, US-003) stores free-text fields only. There
is no link today between medical data and exercises.

## Goals / Non-Goals

**Goals**
- Tag exercises with body regions (controlled vocabulary).
- Derive a client's flagged regions from their medical record via a curated
  dictionary and expose them.
- Show advisory, non-blocking warnings on a client's routine when an exercise's
  regions overlap the flagged regions.

**Non-Goals**
- No clinical judgement, no blocking, no severity levels.
- No structured medical fields (medical record stays free text).
- No user-editable dictionary; no warm-up suggestions (US-023).
- No warnings on library templates (no client context).

## Decisions

### Controlled region vocabulary
Region codes (stable, stored): `neck`, `shoulder`, `elbow`, `wrist`,
`upper_back`, `lower_back`, `hip`, `knee`, `ankle`, `core`,
`cardio_respiratory`. Defined once in a backend constant and mirrored in the
frontend i18n label maps. Labels are localized (es/en); codes are never
translated.

### Region keyword dictionary (curated config, backend)
A single map `region -> keywords[]` (lowercased, accent-stripped), used to scan
the medical record. Initial content (extensible):

| Region | Keywords (normalized) |
| --- | --- |
| `neck` | cuello, cervical, cervicales, neck |
| `shoulder` | hombro, manguito rotador, deltoides, shoulder, rotator cuff |
| `elbow` | codo, epicondilitis, elbow, tennis elbow |
| `wrist` | muneca, tunel carpiano, carpiano, wrist, carpal tunnel |
| `upper_back` | espalda alta, dorsal, toracica, upper back, thoracic |
| `lower_back` | lumbar, espalda baja, hernia de disco, ciatica, lumbago, lower back, sciatica, herniated disc |
| `hip` | cadera, hip |
| `knee` | rodilla, menisco, ligamento cruzado, lca, rotula, knee, meniscus, acl, patella |
| `ankle` | tobillo, esguince, ankle, sprain |
| `core` | abdominal, abdomen, core, diastasis |
| `cardio_respiratory` | asma, hipertension, cardiaco, corazon, respiratorio, asthma, hypertension, cardiac, heart |

### Matching (backend)
- Normalize both the medical text and each keyword: lowercase + strip diacritics
  (`String.normalize('NFD').replace(/\p{Diacritic}/gu, '')`).
- A keyword matches on a word-boundary basis (so `rodilla` does not match inside
  an unrelated token); multi-word keywords match as a phrase.
- Scan `preexistingConditions`, `injuries`, `surgeriesOrProsthetics`,
  `physicalRestrictions` of the client's current record. For each match, record
  `{ region, field, snippet }` (snippet = the matched keyword or a short window).
- Output: unique flagged regions plus the details list.

### Seed body regions (base catalog)
The seed tags the 11 base exercises so the feature is demonstrable:
`Movilidad de cadera`→`hip`; `Movilidad de hombro`→`shoulder`;
`Movilidad toracica`→`upper_back`; `Puente de gluteos`→`hip,lower_back`;
`Caminata lateral con banda`→`hip,knee`; `Plancha`→`core,lower_back`;
`Sentadilla`→`knee,hip,lower_back`; `Peso muerto`→`lower_back,hip`;
`Press de banca`→`shoulder`; `Remo con barra`→`lower_back,upper_back`;
`Press militar`→`shoulder,neck`. Seed is idempotent (updates regions on existing
base rows).

### Backend
- Data model: `Exercise.bodyRegions String[]` (Postgres scalar list, default
  `[]`). Additive migration.
- Domain `Exercise` + `ExerciseInput` gain `bodyRegions: RegionCode[]`.
- `exerciseSchema` gains `bodyRegions: z.array(z.enum(REGION_CODES)).optional()`
  (defaults to `[]`); the Prisma repository maps it in create/update/read.
- `MedicalFlagsService` (deps: `MedicalRecordRepository`, `ClientRepository`,
  the dictionary) → `getFlags(clientId): { regions, details }`; ensures the
  client exists (404 otherwise).
- Controller action + nested route `GET /api/clients/:clientId/medical-flags`
  (auth-protected), returning `{ success, data: { regions, details } }`.
- Client routine read: denormalize `exerciseBodyRegions` onto each entry
  (alongside `exerciseVideoUrl`) in the routine mapping.

### Frontend
- `exerciseService`/types gain `bodyRegions`; the exercise form adds a MUI
  multi-select of localized region labels (stores codes).
- `clientRoutineService` entry type gains `exerciseBodyRegions`.
- A `medicalFlagsService.getFlags(clientId)` (or a method on the routine service)
  returns `{ regions, details }`.
- `ClientRoutinePage`: fetch the flags on load; for each entry, compute
  `exerciseBodyRegions ∩ regions`; if non-empty, render an advisory marker
  (warning icon + tooltip listing the localized overlapping region labels) next
  to the exercise name. Never blocks the assign/adjust actions.
- i18n (es/en): `exercises.regions.*` (labels + form field) and
  `clientRoutine.warning.*` (advisory text).

## Risks / Trade-offs
- Free-text matching is inherently fuzzy (false positives/negatives). Mitigated
  by keeping it advisory and transparent (shows the matched snippet); the
  dictionary is easy to extend.
- Postgres scalar `String[]` is simple but unconstrained at the DB level; the zod
  enum + a shared constant enforce the vocabulary at the application boundary.
- Matching runs per routine view (one extra request). Fine at MVP scale.

## Migration Plan
- Additive migration `add_exercise_body_regions` (nullable/default-empty column);
  existing exercises get `[]`. Re-run the seed to tag the base catalog. All
  existing suites stay green; new tests cover tagging, the dictionary/scan, the
  flags endpoint, the denormalized entry field, and the advisory marker render.

## Open Questions
- None. Vocabulary, dictionary, seed tags, and advisory-only behavior approved.
