import { MedicalRecord } from '../models/MedicalRecord';

/** Input data for creating or updating a medical record (no id; clientId is the route param). */
export interface MedicalRecordInput {
  preexistingConditions?: string | null;
  injuries?: string | null;
  surgeriesOrProsthetics?: string | null;
  physicalRestrictions?: string | null;
  medication?: string | null;
  allergies?: string | null;
  bloodType?: string | null;
  notes?: string | null;
}

/** Data access contract for client medical records (see docs/backend-standards.md). */
export interface MedicalRecordRepository {
  findByClientId(clientId: number): Promise<MedicalRecord | null>;
  upsert(clientId: number, data: MedicalRecordInput): Promise<MedicalRecord>;
}
