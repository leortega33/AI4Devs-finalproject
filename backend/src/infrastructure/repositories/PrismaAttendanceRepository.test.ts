import { PrismaAttendanceRepository } from './PrismaAttendanceRepository';

function buildPrismaMock() {
  return {
    attendance: {
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
  checkInAt: new Date('2026-09-20T10:00:00.000Z'),
  note: 'Buena sesión',
  createdAt: new Date('2026-09-20T10:00:00.000Z'),
};

describe('PrismaAttendanceRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create a check-in for the client', async () => {
    const prisma = buildPrismaMock();
    prisma.attendance.create.mockResolvedValue(baseRecord);
    const repo = new PrismaAttendanceRepository(prisma);

    const checkInAt = new Date('2026-09-20T10:00:00.000Z');
    const result = await repo.create(10, { checkInAt, note: 'Buena sesión' });

    expect(result.clientId).toBe(10);
    expect(result.note).toBe('Buena sesión');
    expect(prisma.attendance.create).toHaveBeenCalledWith({
      data: { clientId: 10, checkInAt, note: 'Buena sesión' },
    });
  });

  it('should list check-ins newest first', async () => {
    const prisma = buildPrismaMock();
    prisma.attendance.findMany.mockResolvedValue([baseRecord]);
    const repo = new PrismaAttendanceRepository(prisma);

    const result = await repo.listByClientId(10);

    expect(result).toHaveLength(1);
    expect(prisma.attendance.findMany).toHaveBeenCalledWith({
      where: { clientId: 10 },
      orderBy: { checkInAt: 'desc' },
    });
  });

  it('should find a check-in by id', async () => {
    const prisma = buildPrismaMock();
    prisma.attendance.findUnique.mockResolvedValue(baseRecord);
    const repo = new PrismaAttendanceRepository(prisma);

    expect((await repo.findById(1))?.id).toBe(1);
    expect(prisma.attendance.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null when a check-in is not found', async () => {
    const prisma = buildPrismaMock();
    prisma.attendance.findUnique.mockResolvedValue(null);
    const repo = new PrismaAttendanceRepository(prisma);

    expect(await repo.findById(999)).toBeNull();
  });

  it('should delete a check-in', async () => {
    const prisma = buildPrismaMock();
    prisma.attendance.delete.mockResolvedValue(baseRecord);
    const repo = new PrismaAttendanceRepository(prisma);

    await repo.delete(1);

    expect(prisma.attendance.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
