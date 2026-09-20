import { PrismaClient, Prisma } from '@prisma/client';
import { MedicalRecordVersion } from '../../domain/models/MedicalRecordVersion';
import {
  MedicalRecordVersionRepository,
  MedicalRecordVersionInput,
} from '../../domain/repositories/MedicalRecordVersionRepository';

type MedicalRecordVersionRecord = Prisma.MedicalRecordVersionGetPayload<Record<string, never>>;

function toDomain(record: MedicalRecordVersionRecord): MedicalRecordVersion {
  return new MedicalRecordVersion(record);
}

export class PrismaMedicalRecordVersionRepository implements MedicalRecordVersionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    clientId: number,
    snapshot: MedicalRecordVersionInput,
  ): Promise<MedicalRecordVersion> {
    const record = await this.prisma.medicalRecordVersion.create({
      data: { clientId, ...snapshot },
    });
    return toDomain(record);
  }

  async listByClientId(clientId: number): Promise<MedicalRecordVersion[]> {
    const records = await this.prisma.medicalRecordVersion.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toDomain);
  }
}
