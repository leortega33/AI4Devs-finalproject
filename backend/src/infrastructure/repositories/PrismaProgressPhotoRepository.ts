import { PrismaClient, Prisma } from '@prisma/client';
import { ProgressPhoto } from '../../domain/models/ProgressPhoto';
import {
  ProgressPhotoRepository,
  ProgressPhotoInput,
} from '../../domain/repositories/ProgressPhotoRepository';

type ProgressPhotoRecord = Prisma.ProgressPhotoGetPayload<Record<string, never>>;

function toDomain(record: ProgressPhotoRecord): ProgressPhoto {
  return new ProgressPhoto(record);
}

export class PrismaProgressPhotoRepository implements ProgressPhotoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(progressEntryId: number, data: ProgressPhotoInput): Promise<ProgressPhoto> {
    const record = await this.prisma.progressPhoto.create({ data: { progressEntryId, ...data } });
    return toDomain(record);
  }

  async listByEntryId(progressEntryId: number): Promise<ProgressPhoto[]> {
    const records = await this.prisma.progressPhoto.findMany({
      where: { progressEntryId },
      orderBy: { createdAt: 'asc' },
    });
    return records.map(toDomain);
  }

  async listByEntryIds(progressEntryIds: number[]): Promise<ProgressPhoto[]> {
    if (progressEntryIds.length === 0) {
      return [];
    }
    const records = await this.prisma.progressPhoto.findMany({
      where: { progressEntryId: { in: progressEntryIds } },
      orderBy: { createdAt: 'asc' },
    });
    return records.map(toDomain);
  }

  async findById(id: number): Promise<ProgressPhoto | null> {
    const record = await this.prisma.progressPhoto.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.progressPhoto.delete({ where: { id } });
  }
}
