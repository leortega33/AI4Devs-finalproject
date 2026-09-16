import { PrismaDashboardRepository } from './PrismaDashboardRepository';

function buildPrismaMock() {
  return {
    client: {
      findMany: jest.fn(),
    },
  } as any;
}

describe('PrismaDashboardRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should query only active clients including payment periods and the active routine', async () => {
    const prisma = buildPrismaMock();
    prisma.client.findMany.mockResolvedValue([]);
    const repo = new PrismaDashboardRepository(prisma);

    await repo.getActiveClientsOverview();

    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'active' },
        select: expect.objectContaining({
          payments: { select: { periodMonth: true, periodYear: true } },
          routines: expect.objectContaining({
            where: { status: 'active' },
            take: 1,
          }),
        }),
      }),
    );
  });

  it('should map a client with payments and an active routine', async () => {
    const prisma = buildPrismaMock();
    prisma.client.findMany.mockResolvedValue([
      {
        id: 7,
        firstName: 'Ana',
        lastName: 'García',
        payments: [
          { periodMonth: 8, periodYear: 2026 },
          { periodMonth: 9, periodYear: 2026 },
        ],
        routines: [{ startDate: new Date('2026-09-01'), durationWeeks: 4 }],
      },
    ]);
    const repo = new PrismaDashboardRepository(prisma);

    const result = await repo.getActiveClientsOverview();

    expect(result).toEqual([
      {
        id: 7,
        firstName: 'Ana',
        lastName: 'García',
        payments: [
          { periodMonth: 8, periodYear: 2026 },
          { periodMonth: 9, periodYear: 2026 },
        ],
        activeRoutine: { startDate: new Date('2026-09-01'), durationWeeks: 4 },
      },
    ]);
  });

  it('should map activeRoutine to null when there is no active routine', async () => {
    const prisma = buildPrismaMock();
    prisma.client.findMany.mockResolvedValue([
      { id: 8, firstName: 'Beto', lastName: 'Pérez', payments: [], routines: [] },
    ]);
    const repo = new PrismaDashboardRepository(prisma);

    const result = await repo.getActiveClientsOverview();

    expect(result[0].activeRoutine).toBeNull();
    expect(result[0].payments).toEqual([]);
  });
});
