# Step 5 — Unit Tests and State Verification

Change: `add-medical-record-history` (US-021 — Medical record change history)
Date: 2026-09-20

## 5.1 Test suites + build

| Suite | Command | Result |
| --- | --- | --- |
| Backend | `npm test` | 39 suites / 303 tests passed |
| Frontend | `npx vitest run` | 34 files / 110 tests passed |
| Frontend build | `npm run build` | ✓ built, no TypeScript errors |

New/updated tests:

- Backend
  - `MedicalRecordVersion.test.ts` — domain model defaults + snapshot values.
  - `PrismaMedicalRecordVersionRepository.test.ts` — `create` snapshot and
    `listByClientId` newest-first (`orderBy createdAt desc`) + empty list.
  - `medicalRecordService.test.ts` — a version snapshot is written on save
    (from the saved state); `getHistory` returns versions newest first, empty
    when nothing saved, and throws for a missing client; no version on
    not-found.
  - `medicalRecordRoutes.test.ts` — `GET /history` shape (newest first), empty
    history, 404 for a missing client, 401 without auth.
- Frontend
  - `MedicalRecordPage.test.tsx` — empty history state and the saved versions
    render newest first with their values.

## 5.2 Database state

Additive migration `20260920153805_add_medical_record_versions` (new
`MedicalRecordVersion` table). Existing rows untouched.

| Table | Count (before/after unit tests) |
| --- | --- |
| Client | 3 / 3 |
| MedicalRecord | 0 / 0 |
| MedicalRecordVersion | 0 / 0 |

Unit tests use mocked repositories (no DB writes); state unchanged.

## Conclusion

All suites green, build clean, database consistent. Ready for Step 6.
