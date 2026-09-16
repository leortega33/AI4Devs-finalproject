import { PrismaClientRepository } from './PrismaClientRepository';

function buildPrismaMock() {
  return {
    client: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  } as any;
}

const baseRecord = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  dni: '12345678',
  phone: '+542604000000',
  email: 'john@example.com',
  birthDate: new Date('1990-01-01'),
  address: null,
  goal: null,
  emergencyContactName: null,
  emergencyContactPhone: null,
  emergencyContactRelationship: null,
  joinDate: new Date('2026-01-01'),
  status: 'active',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const input = {
  firstName: 'John',
  lastName: 'Doe',
  dni: '12345678',
  phone: '+542604000000',
  email: 'john@example.com',
  birthDate: new Date('1990-01-01'),
};

describe('PrismaClientRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create a client and map it to the domain', async () => {
    const prisma = buildPrismaMock();
    prisma.client.create.mockResolvedValue(baseRecord);
    const repo = new PrismaClientRepository(prisma);

    const result = await repo.create(input);

    expect(result.fullName).toBe('John Doe');
    expect(prisma.client.create).toHaveBeenCalledWith({ data: input });
  });

  it('should find a client by id', async () => {
    const prisma = buildPrismaMock();
    prisma.client.findUnique.mockResolvedValue(baseRecord);
    const repo = new PrismaClientRepository(prisma);

    const result = await repo.findById(1);

    expect(result?.id).toBe(1);
    expect(prisma.client.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null when a client is not found by id', async () => {
    const prisma = buildPrismaMock();
    prisma.client.findUnique.mockResolvedValue(null);
    const repo = new PrismaClientRepository(prisma);

    expect(await repo.findById(999)).toBeNull();
  });

  it('should find a client by dni', async () => {
    const prisma = buildPrismaMock();
    prisma.client.findUnique.mockResolvedValue(baseRecord);
    const repo = new PrismaClientRepository(prisma);

    const result = await repo.findByDni('12345678');

    expect(result?.dni).toBe('12345678');
    expect(prisma.client.findUnique).toHaveBeenCalledWith({ where: { dni: '12345678' } });
  });

  it('should build a case-insensitive name search with a status filter', async () => {
    const prisma = buildPrismaMock();
    prisma.client.findMany.mockResolvedValue([{ ...baseRecord, routines: [], payments: [] }]);
    const repo = new PrismaClientRepository(prisma);

    await repo.findAll({ search: 'jo', status: 'active' });

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: {
        status: 'active',
        OR: [
          { firstName: { contains: 'jo', mode: 'insensitive' } },
          { lastName: { contains: 'jo', mode: 'insensitive' } },
        ],
      },
      orderBy: { lastName: 'asc' },
      include: {
        routines: { where: { status: 'active' }, select: { id: true }, take: 1 },
        payments: { select: { periodMonth: true, periodYear: true } },
      },
    });
  });

  it('should list all clients with derived routine and payment indicators', async () => {
    const prisma = buildPrismaMock();
    prisma.client.findMany.mockResolvedValue([
      { ...baseRecord, routines: [], payments: [] },
      { ...baseRecord, id: 2, routines: [{ id: 99 }], payments: [{ periodMonth: 1, periodYear: 2000 }] },
    ]);
    const repo = new PrismaClientRepository(prisma);

    const result = await repo.findAll({});

    expect(result).toHaveLength(2);
    expect(result[0].hasActiveRoutine).toBe(false);
    expect(result[0].paymentStatus).toBe('no_payments');
    expect(result[1].hasActiveRoutine).toBe(true);
    expect(result[1].paymentStatus).toBe('overdue');
  });

  it('should update a client', async () => {
    const prisma = buildPrismaMock();
    prisma.client.update.mockResolvedValue({ ...baseRecord, phone: '+542604111111' });
    const repo = new PrismaClientRepository(prisma);

    const result = await repo.update(1, { ...input, phone: '+542604111111' });

    expect(result.phone).toBe('+542604111111');
  });

  it('should set a client status', async () => {
    const prisma = buildPrismaMock();
    prisma.client.update.mockResolvedValue({ ...baseRecord, status: 'inactive' });
    const repo = new PrismaClientRepository(prisma);

    const result = await repo.setStatus(1, 'inactive');

    expect(result.status).toBe('inactive');
    expect(prisma.client.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: 'inactive' } });
  });
});
