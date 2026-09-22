import { PrismaClient, Prisma } from '@prisma/client';
import { ProgressEntry } from '../../domain/models/ProgressEntry';
import {
  ProgressEntryRepository,
  ProgressEntryInput,
} from '../../domain/repositories/ProgressEntryRepository';

type ProgressEntryRecord = Prisma.ProgressEntryGetPayload<Record<string, never>>;

function toDomain(record: ProgressEntryRecord): ProgressEntry {
  return new ProgressEntry(record);
}

export class PrismaProgressEntryRepository implements ProgressEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(clientId: number, data: ProgressEntryInput): Promise<ProgressEntry> {
    const record = await this.prisma.progressEntry.create({ data: { clientId, ...data } });
    return toDomain(record);
  }

  async listByClientId(clientId: number): Promise<ProgressEntry[]> {
    const records = await this.prisma.progressEntry.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
    });
    return records.map(toDomain);
  }

  async findById(id: number): Promise<ProgressEntry | null> {
    const record = await this.prisma.progressEntry.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.progressEntry.delete({ where: { id } });
  }
}
