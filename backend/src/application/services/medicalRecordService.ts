import { MedicalRecord } from '../../domain/models/MedicalRecord';
import { MedicalRecordVersion } from '../../domain/models/MedicalRecordVersion';
import {
  MedicalRecordRepository,
  MedicalRecordInput,
} from '../../domain/repositories/MedicalRecordRepository';
import { MedicalRecordVersionRepository } from '../../domain/repositories/MedicalRecordVersionRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientNotFoundError } from './clientService';

/** Business logic for client medical records and their history (see US-003, US-021). */
export class MedicalRecordService {
  constructor(
    private readonly medicalRecordRepository: MedicalRecordRepository,
    private readonly clientRepository: ClientRepository,
    private readonly medicalRecordVersionRepository: MedicalRecordVersionRepository,
  ) {}

  async getByClientId(clientId: number): Promise<MedicalRecord | null> {
    await this.ensureClientExists(clientId);
    return this.medicalRecordRepository.findByClientId(clientId);
  }

  async upsert(clientId: number, data: MedicalRecordInput): Promise<MedicalRecord> {
    await this.ensureClientExists(clientId);
    const record = await this.medicalRecordRepository.upsert(clientId, data);
    // Record an immutable snapshot of the saved state so the history reflects it.
    await this.medicalRecordVersionRepository.create(clientId, {
      preexistingConditions: record.preexistingConditions,
      injuries: record.injuries,
      surgeriesOrProsthetics: record.surgeriesOrProsthetics,
      physicalRestrictions: record.physicalRestrictions,
      medication: record.medication,
      allergies: record.allergies,
      bloodType: record.bloodType,
      notes: record.notes,
    });
    return record;
  }

  async getHistory(clientId: number): Promise<MedicalRecordVersion[]> {
    await this.ensureClientExists(clientId);
    return this.medicalRecordVersionRepository.listByClientId(clientId);
  }

  private async ensureClientExists(clientId: number): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError();
    }
  }
}
