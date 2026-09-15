import { PrismaClient, Prisma } from '@prisma/client';
import { MedicalRecord } from '../../domain/models/MedicalRecord';
import {
  MedicalRecordRepository,
  MedicalRecordInput,
} from '../../domain/repositories/MedicalRecordRepository';

type MedicalRecordRecord = Prisma.MedicalRecordGetPayload<Record<string, never>>;

function toDomain(record: MedicalRecordRecord): MedicalRecord {
  return new MedicalRecord(record);
}

export class PrismaMedicalRecordRepository implements MedicalRecordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByClientId(clientId: number): Promise<MedicalRecord | null> {
    const record = await this.prisma.medicalRecord.findUnique({ where: { clientId } });
    return record ? toDomain(record) : null;
  }

  async upsert(clientId: number, data: MedicalRecordInput): Promise<MedicalRecord> {
    const record = await this.prisma.medicalRecord.upsert({
      where: { clientId },
      create: { clientId, ...data },
      update: data,
    });
    return toDomain(record);
  }
}
