import { PrismaRoutineTemplateRepository } from './PrismaRoutineTemplateRepository';

function buildPrismaMock() {
  return {
    routineTemplate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    routineSession: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;
}

const nestedRecord = {
  id: 1,
  name: 'Hipertrofia',
  description: null,
  objective: 'Hipertrofia',
  generalConsiderations: null,
  clientId: null,
  sourceTemplateId: null,
  startDate: null,
  durationWeeks: null,
  status: 'draft',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  sessions: [
    {
      id: 10,
      name: 'Sesión A',
      warmupPrescription: '2 vueltas',
      order: 0,
      entries: [
        {
          id: 100,
          exerciseId: 7,
          phase: 'main',
          block: 'Bloque 1',
          kg: 60,
          reps: 8,
          series: 4,
          notes: null,
          order: 0,
          exercise: { name: 'Sentadilla' },
        },
      ],
    },
  ],
};

const input = {
  name: 'Hipertrofia',
  sessions: [
    {
      name: 'Sesión A',
      warmupPrescription: '2 vueltas',
      order: 0,
      entries: [{ exerciseId: 7, phase: 'main' as const, block: 'Bloque 1', kg: 60, reps: 8, series: 4, order: 0 }],
    },
  ],
};

describe('PrismaRoutineTemplateRepository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should create a template with nested sessions and entries and map it to the domain', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.create.mockResolvedValue(nestedRecord);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.create(input);

    expect(result.name).toBe('Hipertrofia');
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0].entries[0].exerciseName).toBe('Sentadilla');
    expect(result.sessions[0].entries[0].kg).toBe(60);
  });

  it('should find a template by id with nested detail', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findUnique.mockResolvedValue(nestedRecord);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.findById(1);

    expect(result?.id).toBe(1);
    expect(result?.sessions[0].name).toBe('Sesión A');
  });

  it('should return null when a template is not found', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findUnique.mockResolvedValue(null);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    expect(await repo.findById(999)).toBeNull();
  });

  it('should list only library templates with a session count', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findMany.mockResolvedValue([
      { id: 1, name: 'Hipertrofia', objective: 'Hipertrofia', status: 'draft', _count: { sessions: 3 } },
    ]);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.findAllLibrary();

    expect(result[0].sessionCount).toBe(3);
    expect(prisma.routineTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId: null } }),
    );
  });

  it('should replace nested data in a transaction on update', async () => {
    const prisma = buildPrismaMock();
    const tx = {
      routineSession: { deleteMany: jest.fn() },
      routineTemplate: { update: jest.fn().mockResolvedValue(nestedRecord) },
    };
    prisma.$transaction.mockImplementation(async (fn: any) => fn(tx));
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.replaceNested(1, input);

    expect(tx.routineSession.deleteMany).toHaveBeenCalledWith({ where: { routineTemplateId: 1 } });
    expect(tx.routineTemplate.update).toHaveBeenCalled();
    expect(result.name).toBe('Hipertrofia');
  });

  it('should deep-copy the source on duplicate with a "(copia)" name', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findUnique.mockResolvedValue(nestedRecord);
    prisma.routineTemplate.create.mockResolvedValue({ ...nestedRecord, id: 2, name: 'Hipertrofia (copia)' });
    const repo = new PrismaRoutineTemplateRepository(prisma);

    const result = await repo.duplicate(1);

    expect(result?.id).toBe(2);
    expect(result?.name).toBe('Hipertrofia (copia)');
    const createArg = prisma.routineTemplate.create.mock.calls[0][0];
    expect(createArg.data.name).toBe('Hipertrofia (copia)');
    expect(createArg.data.sessions.create[0].entries.create[0].exerciseId).toBe(7);
  });

  it('should return null when duplicating a non-existent template', async () => {
    const prisma = buildPrismaMock();
    prisma.routineTemplate.findUnique.mockResolvedValue(null);
    const repo = new PrismaRoutineTemplateRepository(prisma);

    expect(await repo.duplicate(999)).toBeNull();
  });

  describe('client routine assignment (US-006)', () => {
    it('should clone the template to the client and close the previous active routine in a transaction', async () => {
      const prisma = buildPrismaMock();
      prisma.routineTemplate.findUnique.mockResolvedValue(nestedRecord);
      const tx = {
        routineTemplate: {
          updateMany: jest.fn(),
          create: jest.fn().mockResolvedValue({
            ...nestedRecord,
            id: 5,
            clientId: 3,
            sourceTemplateId: 1,
            status: 'active',
            startDate: new Date('2026-02-01'),
            durationWeeks: 4,
          }),
        },
      };
      prisma.$transaction.mockImplementation(async (fn: any) => fn(tx));
      const repo = new PrismaRoutineTemplateRepository(prisma);

      const result = await repo.assignCloneToClient(3, 1, new Date('2026-02-01'), 4);

      expect(tx.routineTemplate.updateMany).toHaveBeenCalledWith({
        where: { clientId: 3, status: 'active' },
        data: { status: 'expired' },
      });
      const createArg = tx.routineTemplate.create.mock.calls[0][0];
      expect(createArg.data.clientId).toBe(3);
      expect(createArg.data.sourceTemplateId).toBe(1);
      expect(createArg.data.status).toBe('active');
      expect(createArg.data.sessions.create[0].entries.create[0].exerciseId).toBe(7);
      expect(result?.clientId).toBe(3);
    });

    it('should return null when assigning a non-existent template', async () => {
      const prisma = buildPrismaMock();
      prisma.routineTemplate.findUnique.mockResolvedValue(null);
      const repo = new PrismaRoutineTemplateRepository(prisma);

      expect(await repo.assignCloneToClient(3, 999, new Date(), 4)).toBeNull();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should find the active routine for a client', async () => {
      const prisma = buildPrismaMock();
      prisma.routineTemplate.findFirst.mockResolvedValue({ ...nestedRecord, clientId: 3, status: 'active' });
      const repo = new PrismaRoutineTemplateRepository(prisma);

      const result = await repo.findActiveByClient(3);

      expect(result?.clientId).toBe(3);
      expect(prisma.routineTemplate.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clientId: 3, status: 'active' } }),
      );
    });

    it('should return null when the client has no active routine', async () => {
      const prisma = buildPrismaMock();
      prisma.routineTemplate.findFirst.mockResolvedValue(null);
      const repo = new PrismaRoutineTemplateRepository(prisma);

      expect(await repo.findActiveByClient(3)).toBeNull();
    });

    it('should list the client non-active routines as history summaries', async () => {
      const prisma = buildPrismaMock();
      prisma.routineTemplate.findMany.mockResolvedValue([
        { id: 2, name: 'Rutina anterior', objective: null, status: 'expired', _count: { sessions: 2 } },
      ]);
      const repo = new PrismaRoutineTemplateRepository(prisma);

      const result = await repo.findHistoryByClient(3);

      expect(result[0].status).toBe('expired');
      expect(prisma.routineTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clientId: 3, status: { not: 'active' } } }),
      );
    });
  });
});
