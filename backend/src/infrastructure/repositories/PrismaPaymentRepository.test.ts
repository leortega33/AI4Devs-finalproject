import { PrismaPaymentRepository } from './PrismaPaymentRepository';

function buildPrismaMock() {
  return {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
}

// Prisma Decimal-like: amount.toNumber() is used by the mapper.
const baseRecord = {
  id: 1,
  clientId: 3,
  amount: { toNumber: () => 5000 },
  paymentDate: new Date('2026-02-05'),
  method: 'cash',
  periodMonth: 2,
  periodYear: 2026,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-05'),
};

const input = {
  amount: 5000,
  paymentDate: new Date('2026-02-05'),
  method: 'cash' as const,
  periodMonth: 2,
  periodYear: 2026,
};

describe('PrismaPaymentRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create a payment for a client and map the Decimal amount to a number', async () => {
    const prisma = buildPrismaMock();
    prisma.payment.create.mockResolvedValue(baseRecord);
    const repo = new PrismaPaymentRepository(prisma);

    const result = await repo.create(3, input);

    expect(result.amount).toBe(5000);
    expect(result.clientId).toBe(3);
    expect(prisma.payment.create).toHaveBeenCalledWith({ data: { clientId: 3, ...input } });
  });

  it('should find a payment by id', async () => {
    const prisma = buildPrismaMock();
    prisma.payment.findUnique.mockResolvedValue(baseRecord);
    const repo = new PrismaPaymentRepository(prisma);

    const result = await repo.findById(1);

    expect(result?.id).toBe(1);
    expect(prisma.payment.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should return null when a payment is not found', async () => {
    const prisma = buildPrismaMock();
    prisma.payment.findUnique.mockResolvedValue(null);
    const repo = new PrismaPaymentRepository(prisma);

    expect(await repo.findById(999)).toBeNull();
  });

  it('should list a client payments newest first', async () => {
    const prisma = buildPrismaMock();
    prisma.payment.findMany.mockResolvedValue([baseRecord]);
    const repo = new PrismaPaymentRepository(prisma);

    const result = await repo.findByClient(3);

    expect(result).toHaveLength(1);
    expect(prisma.payment.findMany).toHaveBeenCalledWith({
      where: { clientId: 3 },
      orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
    });
  });

  it('should update a payment', async () => {
    const prisma = buildPrismaMock();
    prisma.payment.update.mockResolvedValue({ ...baseRecord, amount: { toNumber: () => 6000 } });
    const repo = new PrismaPaymentRepository(prisma);

    const result = await repo.update(1, { ...input, amount: 6000 });

    expect(result.amount).toBe(6000);
    expect(prisma.payment.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { ...input, amount: 6000 } });
  });

  it('should delete a payment', async () => {
    const prisma = buildPrismaMock();
    const repo = new PrismaPaymentRepository(prisma);

    await repo.delete(1);

    expect(prisma.payment.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
