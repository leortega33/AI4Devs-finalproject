import { PrismaProgressEntryRepository } from './PrismaProgressEntryRepository';

function buildPrismaMock() {
  return {
    progressEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
}

const baseRecord = {
  id: 1,
  clientId: 10,
  date: new Date('2026-09-21T10:00:00.000Z'),
  weightKg: 80,
  bodyFatPercent: null,
  chestCm: null,
  waistCm: 85,
  hipsCm: null,
  armCm: null,
  thighCm: null,
  note: 'Buen progreso',
  createdAt: new Date('2026-09-21T10:00:00.000Z'),
};

describe('PrismaProgressEntryRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create an entry for the client', async () => {
    const prisma = buildPrismaMock();
    prisma.progressEntry.create.mockResolvedValue(baseRecord);
    const repo = new PrismaProgressEntryRepository(prisma);

    const date = new Date('2026-09-21T10:00:00.000Z');
    const result = await repo.create(10, { date, weightKg: 80, waistCm: 85, note: 'Buen progreso' });

    expect(result.clientId).toBe(10);
    expect(result.weightKg).toBe(80);
    expect(prisma.progressEntry.create).toHaveBeenCalledWith({
      data: { clientId: 10, date, weightKg: 80, waistCm: 85, note: 'Buen progreso' },
    });
  });

  it('should list entries newest first', async () => {
    const prisma = buildPrismaMock();
    prisma.progressEntry.findMany.mockResolvedValue([baseRecord]);
    const repo = new PrismaProgressEntryRepository(prisma);

    const result = await repo.listByClientId(10);

    expect(result).toHaveLength(1);
    expect(prisma.progressEntry.findMany).toHaveBeenCalledWith({
      where: { clientId: 10 },
      orderBy: { date: 'desc' },
    });
  });

  it('should find an entry by id', async () => {
    const prisma = buildPrismaMock();
    prisma.progressEntry.findUnique.mockResolvedValue(baseRecord);
    const repo = new PrismaProgressEntryRepository(prisma);

    expect((await repo.findById(1))?.id).toBe(1);
    expect(prisma.progressEntry.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null when an entry is not found', async () => {
    const prisma = buildPrismaMock();
    prisma.progressEntry.findUnique.mockResolvedValue(null);
    const repo = new PrismaProgressEntryRepository(prisma);

    expect(await repo.findById(999)).toBeNull();
  });

  it('should delete an entry', async () => {
    const prisma = buildPrismaMock();
    prisma.progressEntry.delete.mockResolvedValue(baseRecord);
    const repo = new PrismaProgressEntryRepository(prisma);

    await repo.delete(1);

    expect(prisma.progressEntry.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
