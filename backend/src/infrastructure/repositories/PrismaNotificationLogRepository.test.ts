import { PrismaNotificationLogRepository } from './PrismaNotificationLogRepository';

function buildPrismaMock() {
  return {
    notificationLog: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  } as any;
}

describe('PrismaNotificationLogRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should report an existing log by the composite key', async () => {
    const prisma = buildPrismaMock();
    prisma.notificationLog.findUnique.mockResolvedValue({ id: 1 });
    const repo = new PrismaNotificationLogRepository(prisma);

    expect(await repo.exists(10, 'payment_overdue', '2026-07')).toBe(true);
    expect(prisma.notificationLog.findUnique).toHaveBeenCalledWith({
      where: { clientId_type_referenceKey: { clientId: 10, type: 'payment_overdue', referenceKey: '2026-07' } },
    });
  });

  it('should report a missing log as not existing', async () => {
    const prisma = buildPrismaMock();
    prisma.notificationLog.findUnique.mockResolvedValue(null);
    const repo = new PrismaNotificationLogRepository(prisma);

    expect(await repo.exists(10, 'routine_expiring', '2026-10-01')).toBe(false);
  });

  it('should record a send', async () => {
    const prisma = buildPrismaMock();
    prisma.notificationLog.create.mockResolvedValue({ id: 1 });
    const repo = new PrismaNotificationLogRepository(prisma);

    await repo.record(10, 'payment_due_soon', '2026-08');

    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: { clientId: 10, type: 'payment_due_soon', referenceKey: '2026-08' },
    });
  });
});
