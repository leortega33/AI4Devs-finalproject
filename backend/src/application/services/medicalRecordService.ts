import { MedicalRecord } from '../../domain/models/MedicalRecord';
import {
  MedicalRecordRepository,
  MedicalRecordInput,
} from '../../domain/repositories/MedicalRecordRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ClientNotFoundError } from './clientService';

/** Business logic for client medical records (see US-003). */
export class MedicalRecordService {
  constructor(
    private readonly medicalRecordRepository: MedicalRecordRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async getByClientId(clientId: number): Promise<MedicalRecord | null> {
    await this.ensureClientExists(clientId);
    return this.medicalRecordRepository.findByClientId(clientId);
  }

  async upsert(clientId: number, data: MedicalRecordInput): Promise<MedicalRecord> {
    await this.ensureClientExists(clientId);
    return this.medicalRecordRepository.upsert(clientId, data);
  }

  private async ensureClientExists(clientId: number): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundError();
    }
  }
}
