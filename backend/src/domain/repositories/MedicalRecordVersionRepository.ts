import { MedicalRecordVersion } from '../models/MedicalRecordVersion';

/** Snapshot data captured when a medical record is saved (US-021). */
export interface MedicalRecordVersionInput {
  preexistingConditions?: string | null;
  injuries?: string | null;
  surgeriesOrProsthetics?: string | null;
  physicalRestrictions?: string | null;
  medication?: string | null;
  allergies?: string | null;
  bloodType?: string | null;
  notes?: string | null;
}

/** Data access contract for medical record version history (see docs/backend-standards.md). */
export interface MedicalRecordVersionRepository {
  create(clientId: number, snapshot: MedicalRecordVersionInput): Promise<MedicalRecordVersion>;
  listByClientId(clientId: number): Promise<MedicalRecordVersion[]>;
}
