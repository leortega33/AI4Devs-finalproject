import { PrismaClient, Prisma } from '@prisma/client';
import { Client, ClientStatus } from '../../domain/models/Client';
import {
  ClientRepository,
  ClientInput,
  ClientListFilters,
} from '../../domain/repositories/ClientRepository';

type ClientRecord = Prisma.ClientGetPayload<Record<string, never>>;

function toDomain(record: ClientRecord): Client {
  return new Client({
    ...record,
    status: record.status as ClientStatus,
  });
}

export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: ClientInput): Promise<Client> {
    const record = await this.prisma.client.create({ data });
    return toDomain(record);
  }

  async findById(id: number): Promise<Client | null> {
    const record = await this.prisma.client.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findByDni(dni: string): Promise<Client | null> {
    const record = await this.prisma.client.findUnique({ where: { dni } });
    return record ? toDomain(record) : null;
  }

  async findAll(filters: ClientListFilters): Promise<Client[]> {
    const where: Prisma.ClientWhereInput = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const records = await this.prisma.client.findMany({
      where,
      orderBy: { lastName: 'asc' },
      include: { routines: { where: { status: 'active' }, select: { id: true }, take: 1 } },
    });
    return records.map((record) => {
      const { routines, ...clientRecord } = record;
      return new Client({
        ...clientRecord,
        status: clientRecord.status as ClientStatus,
        hasActiveRoutine: routines.length > 0,
      });
    });
  }

  async update(id: number, data: ClientInput): Promise<Client> {
    const record = await this.prisma.client.update({ where: { id }, data });
    return toDomain(record);
  }

  async setStatus(id: number, status: ClientStatus): Promise<Client> {
    const record = await this.prisma.client.update({ where: { id }, data: { status } });
    return toDomain(record);
  }
}
