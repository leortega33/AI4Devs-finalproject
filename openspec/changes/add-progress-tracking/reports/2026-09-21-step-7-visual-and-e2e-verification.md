# Step 7 — Visual and E2E Verification

Change: `add-progress-tracking` (US-026 — Physical progress tracking, measurements)
Date: 2026-09-21

## 7.1 Visual verification (browser)

Logged in as admin and navigated to `/clients/218/progress` (demo client Ana Gómez).

Observed:

- Page heading **Progreso** with subtitle **Progreso de Ana Gómez**.
- Summary panel with three cards: **Peso actual** (—), **Cambio de peso** (—), **Mediciones** (0).
- **Registrar medición** button and empty-state text: *"Este cliente todavía no tiene mediciones registradas."*

Registered a measurement via the dialog:

- Dialog opened with the date field defaulting to today (`2026-09-21`), the 7 numeric
  metric fields (Peso, Grasa corporal, Pecho, Cintura, Cadera, Brazo, Muslo) and an
  optional note.
- **Guardar** was disabled and the hint *"Ingresá al menos una medición."* was shown
  while all metrics were empty.
- Entered Peso `80` → the hint disappeared and **Guardar** became enabled.
- Entered Cintura `85` and saved.

Result:

- Snackbar **"Medición registrada."** shown.
- Summary updated to **Peso actual 80 kg**, **Cambio de peso** — (single entry),
  **Mediciones 1**.
- Table row rendered with `Peso 80`, `Cintura 85`, and `—` for the remaining metrics,
  plus an **Eliminar** action.

Screenshot captured showing the populated summary and measurement table.

Delete flow (verified via automated E2E below and Step 6 curl): the row **Eliminar**
action opens a confirmation dialog (*"¿Eliminar esta medición?"*), confirming shows
**"Medición eliminada."** and the empty state returns.

## 7.2 End-to-end (Playwright)

Added `frontend/e2e/progress.spec.ts` covering the full flow:

1. Create a client.
2. Open its Progreso page via the list action icon.
3. Assert empty state.
4. Record a weight measurement → assert snackbar, listed row, and **Peso actual 80 kg**
   summary.
5. Delete it with confirmation → assert **"Medición eliminada."** and empty state.

Run (serial, `--workers=1`, from a clean DB):

- Full suite: **16 passed** including the new progress spec. One transient
  `medical-record` failure occurred due to leftover client state from an interrupted
  prior run (DNI collision); re-running `medical-record` + `progress` from a clean DB
  yielded **2 passed**, confirming no regression.

## Result

Visual and E2E verification passed. The progress feature records, summarizes,
lists, and deletes measurements end-to-end. Demo data reseeded (3 clients, 2 payments).
